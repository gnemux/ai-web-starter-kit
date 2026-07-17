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
  "id, owner_id, event_type, plan_id, task_id, submission_id, task_title, service_date, visit_time, submission_status, idempotency_key, read_at, last_notified_at, created_at, updated_at";

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
  markUnread?: boolean;
  ownerId: string;
  planId: string;
  serviceDate: string;
  status: "completed" | "note" | "exception";
  submissionId: string;
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
    .from("owner_notifications")
    .upsert(notification, { onConflict: "idempotency_key" })
    .select("id")
    .single();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  return serviceOk({ id: result.data.id });
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
