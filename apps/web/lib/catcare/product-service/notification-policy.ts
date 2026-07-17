import type { Database } from "../../supabase/database.types";

export type OwnerNotificationRow =
  Database["public"]["Tables"]["owner_notifications"]["Row"];
export type OwnerNotificationInsert =
  Database["public"]["Tables"]["owner_notifications"]["Insert"];

export type OwnerNotificationView = {
  eventType: OwnerNotificationRow["event_type"];
  href: string | null;
  id: string;
  notifiedAt: string;
  readAt: string | null;
  serviceDate: string;
  submissionStatus: OwnerNotificationRow["submission_status"];
  taskTitle: string;
  visitTime: string;
};

export function buildOwnerSubmissionNotification(input: {
  abnormal: boolean;
  ownerId: string;
  planId: string;
  serviceDate: string;
  status: OwnerNotificationRow["submission_status"];
  submissionId: string;
  submissionRevision: number;
  taskId: string;
  taskTitle: string;
  visitTime: string;
}): OwnerNotificationInsert {
  const taskTitle = input.taskTitle.trim().slice(0, 160) || "照护任务";

  return {
    event_type:
      input.abnormal || input.status === "exception"
        ? "care_exception"
        : "care_submission",
    idempotency_key: `owner-notification:submission:${input.submissionId}`,
    owner_id: input.ownerId,
    plan_id: input.planId,
    service_date: input.serviceDate,
    submission_id: input.submissionId,
    submission_revision: input.submissionRevision,
    submission_status: input.status,
    task_id: input.taskId,
    task_title: taskTitle,
    visit_time: input.visitTime
  };
}

export function mapOwnerNotification(
  row: OwnerNotificationRow
): OwnerNotificationView {
  return {
    eventType: row.event_type,
    href: row.plan_id ? `/catcare/plans/${row.plan_id}/results` : null,
    id: row.id,
    notifiedAt: row.last_notified_at,
    readAt: row.read_at,
    serviceDate: row.service_date,
    submissionStatus: row.submission_status,
    taskTitle: row.task_title,
    visitTime: row.visit_time.slice(0, 5)
  };
}
