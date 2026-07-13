import { createHash, randomUUID } from "node:crypto";

import type { PlatformActorType } from "@xwlc/platform";
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

export const catCareAuditEventNames = [
  "care_plan_published",
  "share_link_created",
  "share_link_revoked",
  "share_page_viewed",
  "invalid_or_revoked_token_rejected",
  "care_submission_created",
  "owner_boundary_denied",
  "cat_profile_archived"
] as const;

export type CatCareAuditEventName = (typeof catCareAuditEventNames)[number];
export type CatCareAuditKind = "info" | "success" | "warning";

export type CatCareAuditEventRow = {
  actor_type: PlatformActorType;
  correlation_id: string;
  event_data: Json;
  event_name: CatCareAuditEventName;
  id: string;
  idempotency_key: string | null;
  occurred_at: string;
  owner_id: string | null;
  resource_id: string | null;
  resource_type: "care_plan" | "cat_profile" | null;
  task_id: string | null;
  token_record_id: string | null;
};

export type CatCareAuditInsert = Omit<CatCareAuditEventRow, "occurred_at">;

export type CatCareAuditInput = {
  actorType: PlatformActorType;
  correlationId?: string | null;
  eventName: CatCareAuditEventName;
  idempotencyKey?: string | null;
  ownerId?: string | null;
  properties?: Record<string, Json | undefined>;
  resourceId?: string | null;
  resourceType?: "care_plan" | "cat_profile" | null;
  taskId?: string | null;
  tokenRecordId?: string | null;
};

export type CatCareAuditActivity = {
  description: string;
  id: string;
  kind: CatCareAuditKind;
  occurredAt: string;
  title: string;
};

const allowedEventData: Record<CatCareAuditEventName, readonly string[]> = {
  cat_profile_archived: ["deletion_mode"],
  care_plan_published: ["task_count"],
  care_submission_created: ["abnormal", "service_date", "status", "visit_time"],
  invalid_or_revoked_token_rejected: ["reason"],
  owner_boundary_denied: ["reason"],
  share_link_created: ["expires_at"],
  share_link_revoked: ["revoked_at"],
  share_page_viewed: ["expires_at"]
};

export function buildCatCareAuditInsert(input: CatCareAuditInput): CatCareAuditInsert {
  const event = {
    actor_type: input.actorType,
    correlation_id: input.correlationId || randomUUID(),
    event_data: pickAllowedEventData(input.eventName, input.properties ?? {}),
    event_name: input.eventName,
    idempotency_key: input.idempotencyKey ?? null,
    owner_id: input.ownerId ?? null,
    resource_id: input.resourceId ?? null,
    resource_type: input.resourceType ?? null,
    task_id: input.taskId ?? null,
    token_record_id: input.tokenRecordId ?? null
  };
  return { ...event, id: input.idempotencyKey ? deterministicAuditId(event) : randomUUID() };
}

export async function recordCatCareAuditEvent(
  input: CatCareAuditInput
): Promise<ServiceResult<{ correlationId: string }>> {
  const event = buildCatCareAuditInsert(input);
  const { createSupabaseAdminClient } = await import("../../supabase/server");
  const clientResult = createSupabaseAdminClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const result = await clientResult.data.from("audit_events").insert(event);

  if (result.error) {
    if (result.error.code === "23505") return serviceOk({ correlationId: event.correlation_id });
    return serviceError("audit_write_failed", "The activity record could not be written.");
  }

  return serviceOk({ correlationId: event.correlation_id });
}

function deterministicAuditId(event: Omit<CatCareAuditInsert, "id">) {
  const digest = createHash("sha256").update(JSON.stringify({
    actor_type: event.actor_type,
    event_data: event.event_data,
    event_name: event.event_name,
    idempotency_key: event.idempotency_key,
    owner_id: event.owner_id,
    resource_id: event.resource_id,
    resource_type: event.resource_type,
    task_id: event.task_id,
    token_record_id: event.token_record_id,
    version: 1
  })).digest("hex").slice(0, 32).split("");
  digest[12] = "5";
  digest[16] = ((Number.parseInt(digest[16], 16) & 3) | 8).toString(16);
  return `${digest.slice(0, 8).join("")}-${digest.slice(8, 12).join("")}-${digest.slice(12, 16).join("")}-${digest.slice(16, 20).join("")}-${digest.slice(20).join("")}`;
}

export async function getCatCareAuditActivities(
  ownerId: string,
  resourceId: string
): Promise<ServiceResult<CatCareAuditActivity[]>> {
  const { createSupabaseServerClient } = await import("../../supabase/server");
  const { getAuthenticatedOwnerId, mapSupabaseError } = await import("./core");
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const authOwnerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!authOwnerResult.ok) {
    return authOwnerResult;
  }

  if (authOwnerResult.data !== ownerId) {
    return serviceError("forbidden", "Only the owner can view audit activity.");
  }

  const result = await clientResult.data
    .from("audit_events")
    .select(
      "id, event_name, actor_type, owner_id, resource_type, resource_id, token_record_id, task_id, idempotency_key, correlation_id, event_data, occurred_at"
    )
    .eq("owner_id", ownerId)
    .eq("resource_type", "care_plan")
    .eq("resource_id", resourceId)
    .order("occurred_at", { ascending: false })
    .limit(20);

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  return serviceOk((result.data ?? []).map((row) => mapCatCareAuditActivity(row)));
}

export function mapCatCareAuditActivity(
  row: CatCareAuditEventRow
): CatCareAuditActivity {
  const data =
    row.event_data && typeof row.event_data === "object" && !Array.isArray(row.event_data)
      ? row.event_data
      : {};

  switch (row.event_name) {
    case "care_plan_published":
      return activity(row, "success", "照护计划已发布", "可以生成私密链接并邀请照看者执行。");
    case "share_link_created":
      return activity(row, "success", "私密链接已生成", "拿到有效链接的人可以查看授权照护信息。");
    case "share_link_revoked":
      return activity(row, "warning", "私密链接已撤销", "旧链接不能继续访问，已提交结果仍保留。");
    case "share_page_viewed":
      return activity(row, "info", "有人打开了有效链接", "系统只确认链接有效，不确认照看者真实身份。");
    case "invalid_or_revoked_token_rejected":
      return activity(
        row,
        "warning",
        "有人尝试使用不可用链接",
        `原因：${formatRejectedReason(String(data.reason ?? "invalid"))}`
      );
    case "care_submission_created":
      return activity(row, "success", "照看者提交了照护结果", formatSubmissionSummary(data));
    case "owner_boundary_denied":
      return activity(row, "warning", "已拒绝越权操作", "系统阻止了不属于当前主人的访问。");
    case "cat_profile_archived":
      return activity(row, "warning", "猫咪档案已归档", "日常数据已隐藏，历史计划与结果继续保留。");
  }
}

function pickAllowedEventData(
  eventName: CatCareAuditEventName,
  properties: Record<string, Json | undefined>
) {
  return Object.fromEntries(
    allowedEventData[eventName]
      .filter((key) => properties[key] !== undefined)
      .map((key) => [key, properties[key]])
  );
}

function activity(
  row: CatCareAuditEventRow,
  kind: CatCareAuditKind,
  title: string,
  description: string
): CatCareAuditActivity {
  return {
    description,
    id: row.id,
    kind,
    occurredAt: row.occurred_at,
    title
  };
}

function formatRejectedReason(reason: string) {
  const labels: Record<string, string> = {
    expired: "已过期",
    invalid: "无效",
    revoked: "已撤销",
    unavailable: "计划不可用"
  };

  return labels[reason] ?? "不可用";
}

function formatSubmissionSummary(data: Record<string, Json | undefined>) {
  const status = String(data.status ?? "completed");
  const labels: Record<string, string> = {
    completed: "已完成",
    exception: "有异常",
    note: "有备注"
  };

  return labels[status] ?? "已提交";
}
