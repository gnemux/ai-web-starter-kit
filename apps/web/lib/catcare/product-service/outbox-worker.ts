import type { Json } from "../../supabase/database.types";
import type { AppSupabaseClient } from "../../supabase/server";

export type CatCareOutboxWorkerEvent = {
  attempt_count: number;
  created_at: string;
  event_type: "owner_notification" | "share_notification" | "submission_notification";
  id: string;
  idempotency_key: string | null;
  next_attempt_at: string | null;
  payload: Json;
  status: "pending" | "processing" | "sent" | "failed" | "dead_letter";
  updated_at: string;
};

export type CatCareOutboxFailureCode = "destination_unavailable" | "dispatch_rejected" | "dispatch_timeout";
export type CatCareOutboxDispatchResult =
  | { ok: true }
  | { ok: false; errorCode: CatCareOutboxFailureCode };

export type CatCareOutboxDispatcher = (
  event: CatCareOutboxWorkerEvent & { idempotency_key: string }
) => Promise<CatCareOutboxDispatchResult>;
// Destinations must persist this idempotency key with their side effect. A stale
// lease can be reclaimed after a worker crashes between delivery and markSent.

export type CatCareOutboxWorkerStore = {
  claim(event: CatCareOutboxWorkerEvent): Promise<CatCareOutboxWorkerEvent | null>;
  listReady(now: string, limit: number): Promise<CatCareOutboxWorkerEvent[]>;
  markDeadLetter(event: CatCareOutboxWorkerEvent, payload: Json): Promise<void>;
  markRetry(event: CatCareOutboxWorkerEvent, nextAttemptAt: string, payload: Json): Promise<void>;
  markSent(event: CatCareOutboxWorkerEvent): Promise<void>;
};

export type CatCareOutboxWorkerSummary = {
  claimed: number;
  deadLettered: number;
  retried: number;
  sent: number;
  skipped: number;
};

export const catCareOutboxMaxAttempts = 3;
export const catCareOutboxLeaseMs = 5 * 60_000;
const retryDelaysMs = [60_000, 5 * 60_000] as const;

export function getCatCareOutboxRetryAt(attemptCount: number, now: Date) {
  const delay = retryDelaysMs[Math.min(Math.max(attemptCount - 1, 0), retryDelaysMs.length - 1)];
  return new Date(now.getTime() + delay).toISOString();
}

export async function runCatCareOutboxBatch({
  dispatcher,
  limit = 20,
  now = new Date(),
  store
}: {
  dispatcher: CatCareOutboxDispatcher;
  limit?: number;
  now?: Date;
  store: CatCareOutboxWorkerStore;
}): Promise<CatCareOutboxWorkerSummary> {
  const summary: CatCareOutboxWorkerSummary = { claimed: 0, deadLettered: 0, retried: 0, sent: 0, skipped: 0 };
  const events = await store.listReady(now.toISOString(), Math.min(Math.max(limit, 1), 100));

  for (const event of events) {
    if (!event.idempotency_key) {
      const claimed = await store.claim(event);
      if (!claimed) { summary.skipped += 1; continue; }
      summary.claimed += 1;
      await store.markDeadLetter(claimed, withFailureCode(claimed.payload, "missing_idempotency_key"));
      summary.deadLettered += 1;
      continue;
    }

    const claimed = await store.claim(event);
    if (!claimed) { summary.skipped += 1; continue; }
    summary.claimed += 1;
    let result: CatCareOutboxDispatchResult;
    try {
      result = await dispatcher({ ...claimed, idempotency_key: event.idempotency_key });
    } catch {
      result = { errorCode: "destination_unavailable", ok: false };
    }
    if (result.ok) {
      await store.markSent(claimed);
      summary.sent += 1;
      continue;
    }

    const attempted = { ...claimed, attempt_count: claimed.attempt_count + 1 };
    const payload = withFailureCode(claimed.payload, result.errorCode);
    if (attempted.attempt_count >= catCareOutboxMaxAttempts) {
      await store.markDeadLetter(attempted, payload);
      summary.deadLettered += 1;
    } else {
      await store.markRetry(attempted, getCatCareOutboxRetryAt(attempted.attempt_count, now), payload);
      summary.retried += 1;
    }
  }

  return summary;
}

export function createSupabaseCatCareOutboxWorkerStore(client: AppSupabaseClient): CatCareOutboxWorkerStore {
  return {
    async listReady(now, limit) {
      const leaseCutoff = new Date(new Date(now).getTime() - catCareOutboxLeaseMs).toISOString();
      const fields = "id, event_type, payload, status, attempt_count, next_attempt_at, idempotency_key, created_at, updated_at";
      const [ready, stale] = await Promise.all([
        client.from("outbox_events").select(fields).in("status", ["pending", "failed"]).or(`next_attempt_at.is.null,next_attempt_at.lte.${now}`).order("created_at", { ascending: true }).limit(limit),
        client.from("outbox_events").select(fields).eq("status", "processing").lte("updated_at", leaseCutoff).order("created_at", { ascending: true }).limit(limit)
      ]);
      if (ready.error || stale.error) throw new Error("outbox_list_failed");
      return ([...(ready.data ?? []), ...(stale.data ?? [])] as CatCareOutboxWorkerEvent[]).sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(0, limit);
    },
    async claim(event) {
      let query = client.from("outbox_events").update({ status: "processing", updated_at: new Date().toISOString() }).eq("id", event.id).eq("status", event.status).eq("attempt_count", event.attempt_count).eq("updated_at", event.updated_at);
      query = event.next_attempt_at === null ? query.is("next_attempt_at", null) : query.eq("next_attempt_at", event.next_attempt_at);
      const result = await query.select("id, event_type, payload, status, attempt_count, next_attempt_at, idempotency_key, created_at, updated_at").maybeSingle();
      if (result.error) throw new Error("outbox_claim_failed");
      return result.data as CatCareOutboxWorkerEvent | null;
    },
    async markSent(event) {
      const result = await client.from("outbox_events").update({ attempt_count: event.attempt_count + 1, next_attempt_at: null, status: "sent", updated_at: new Date().toISOString() }).eq("id", event.id).eq("status", "processing").eq("attempt_count", event.attempt_count).select("id").maybeSingle();
      if (result.error || !result.data) throw new Error("outbox_sent_update_failed");
    },
    async markRetry(event, nextAttemptAt, payload) {
      const result = await client.from("outbox_events").update({ attempt_count: event.attempt_count, next_attempt_at: nextAttemptAt, payload, status: "failed", updated_at: new Date().toISOString() }).eq("id", event.id).eq("status", "processing").eq("attempt_count", event.attempt_count - 1).select("id").maybeSingle();
      if (result.error || !result.data) throw new Error("outbox_retry_update_failed");
    },
    async markDeadLetter(event, payload) {
      const result = await client.from("outbox_events").update({ attempt_count: Math.max(event.attempt_count, 1), next_attempt_at: null, payload, status: "dead_letter", updated_at: new Date().toISOString() }).eq("id", event.id).eq("status", "processing").eq("attempt_count", Math.max(event.attempt_count - 1, 0)).select("id").maybeSingle();
      if (result.error || !result.data) throw new Error("outbox_dead_letter_update_failed");
    }
  };
}

function withFailureCode(payload: Json, value: string): Json {
  const safeCode = value === "missing_idempotency_key" || value === "destination_unavailable" || value === "dispatch_rejected" || value === "dispatch_timeout" ? value : "dispatch_failed";
  return { ...(isJsonObject(payload) ? payload : {}), worker_failure_code: safeCode };
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
