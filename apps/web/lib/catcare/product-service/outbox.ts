import { randomUUID } from "node:crypto";

import type { Json } from "../../supabase/database.types";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

function serviceOk<T>(data: T): ServiceResult<T> {
  return { data, ok: true };
}

function serviceError(
  code: string,
  message: string
): ServiceResult<never> {
  return { error: { code, message }, ok: false };
}

export type CatCareOutboxEventType =
  | "owner_notification"
  | "share_notification"
  | "submission_notification";
export type CatCareOutboxAggregateType =
  | "care_plan"
  | "care_submission"
  | "share_token";

export type CatCareOutboxInsert = {
  aggregate_id: string;
  aggregate_type: CatCareOutboxAggregateType;
  attempt_count: number;
  correlation_id: string;
  event_type: CatCareOutboxEventType;
  idempotency_key: string | null;
  next_attempt_at: string | null;
  owner_id: string | null;
  payload: Json;
  status: "pending";
};

export type CatCareOutboxInput = {
  aggregateId: string;
  aggregateType: CatCareOutboxAggregateType;
  correlationId?: string | null;
  eventType: CatCareOutboxEventType;
  idempotencyKey?: string | null;
  ownerId?: string | null;
  payload?: Record<string, Json | undefined>;
};

const allowedPayload: Record<CatCareOutboxEventType, readonly string[]> = {
  owner_notification: [
    "abnormal",
    "service_date",
    "status",
    "task_title",
    "visit_time"
  ],
  share_notification: ["action", "expires_at", "revoked_at"],
  submission_notification: [
    "abnormal",
    "service_date",
    "status",
    "task_title",
    "visit_time"
  ]
};

export function buildCatCareOutboxInsert(
  input: CatCareOutboxInput
): CatCareOutboxInsert {
  return {
    aggregate_id: input.aggregateId,
    aggregate_type: input.aggregateType,
    attempt_count: 0,
    correlation_id: input.correlationId || randomUUID(),
    event_type: input.eventType,
    idempotency_key: input.idempotencyKey ?? null,
    next_attempt_at: null,
    owner_id: input.ownerId ?? null,
    payload: pickAllowedPayload(input.eventType, input.payload ?? {}),
    status: "pending"
  };
}

export async function recordCatCareOutboxEvent(
  input: CatCareOutboxInput
): Promise<ServiceResult<{ correlationId: string }>> {
  const item = buildCatCareOutboxInsert(input);
  const { createSupabaseAdminClient } = await import("../../supabase/server");
  const clientResult = createSupabaseAdminClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const result = await clientResult.data.from("outbox_events").upsert(item, {
    onConflict: "idempotency_key"
  });

  if (result.error) {
    return serviceError("system_error", result.error.message);
  }

  return serviceOk({ correlationId: item.correlation_id });
}

function pickAllowedPayload(
  eventType: CatCareOutboxEventType,
  payload: Record<string, Json | undefined>
) {
  return Object.fromEntries(
    allowedPayload[eventType]
      .filter((key) => payload[key] !== undefined)
      .map((key) => [key, payload[key]])
  );
}
