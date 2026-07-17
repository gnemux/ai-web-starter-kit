import "server-only";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "../../supabase/server";
import { getAuthenticatedOwnerId, mapSupabaseError } from "./core";
import {
  buildOwnerSubmissionNotification,
  mapOwnerNotification,
  type OwnerNotificationView
} from "./notification-policy";

const ownerNotificationSelect =
  "id, owner_id, event_type, plan_id, task_id, submission_id, submission_revision, task_title, service_date, visit_time, submission_status, idempotency_key, read_at, last_notified_at, created_at, updated_at";

export type OwnerNotificationCenter = {
  notifications: OwnerNotificationView[];
  status: "ready" | "error";
  unreadCount: number;
};

export async function getOwnerNotificationCenter(
  limit = 12
): Promise<ServiceResult<OwnerNotificationCenter>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 30);
  const [listResult, unreadResult] = await Promise.all([
    clientResult.data
      .from("owner_notifications")
      .select(ownerNotificationSelect)
      .eq("owner_id", ownerResult.data)
      .order("last_notified_at", { ascending: false })
      .limit(safeLimit),
    clientResult.data
      .from("owner_notifications")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerResult.data)
      .is("read_at", null)
  ]);

  if (listResult.error) {
    return mapSupabaseError(listResult.error);
  }

  if (unreadResult.error) {
    return mapSupabaseError(unreadResult.error);
  }

  return serviceOk({
    notifications: (listResult.data ?? []).map(mapOwnerNotification),
    status: "ready",
    unreadCount: unreadResult.count ?? 0
  });
}

export async function recordOwnerSubmissionNotification(input: {
  abnormal: boolean;
  ownerId: string;
  planId: string;
  serviceDate: string;
  status: "completed" | "note" | "exception";
  submissionId: string;
  submissionRevision: number;
  taskId: string;
  taskTitle: string;
  visitTime: string;
}): Promise<ServiceResult<{ id: string }>> {
  const clientResult = createSupabaseAdminClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const notification = buildOwnerSubmissionNotification(input);
  const result = await clientResult.data
    .rpc("upsert_owner_submission_notification", {
      p_event_type: notification.event_type,
      p_idempotency_key: notification.idempotency_key,
      p_owner_id: notification.owner_id,
      p_plan_id: notification.plan_id ?? null,
      p_service_date: notification.service_date,
      p_submission_id: notification.submission_id ?? null,
      p_submission_revision: input.submissionRevision,
      p_submission_status: notification.submission_status,
      p_task_id: notification.task_id ?? null,
      p_task_title: notification.task_title,
      p_visit_time: notification.visit_time
    });

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  if (!result.data) {
    return serviceError("system_error", "Owner notification could not be written.");
  }

  return serviceOk({ id: result.data });
}

export async function markOwnerNotificationRead(
  notificationId: string
): Promise<ServiceResult<{ href: string | null }>> {
  if (!isUuid(notificationId)) {
    return serviceError("validation_error", "请选择有效通知。");
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const result = await clientResult.data
    .from("owner_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("owner_id", ownerResult.data)
    .select(ownerNotificationSelect)
    .maybeSingle();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  if (!result.data) {
    return serviceError("not_found", "通知不存在或不属于当前账户。");
  }

  return serviceOk({ href: mapOwnerNotification(result.data).href });
}

export async function markAllOwnerNotificationsRead(): Promise<
  ServiceResult<{ markedCount: number }>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const result = await clientResult.data
    .from("owner_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("owner_id", ownerResult.data)
    .is("read_at", null)
    .select("id");

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  return serviceOk({ markedCount: result.data?.length ?? 0 });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
