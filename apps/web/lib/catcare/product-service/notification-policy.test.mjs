import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOwnerSubmissionNotification,
  mapOwnerNotification
} from "./notification-policy.ts";

test("owner notification insert contains only bounded submission facts", () => {
  const insert = buildOwnerSubmissionNotification({
    abnormal: true,
    ownerId: "owner-1",
    planId: "plan-1",
    serviceDate: "2026-07-17",
    status: "exception",
    submissionId: "submission-1",
    submissionRevision: 1,
    taskId: "task-1",
    taskTitle: `  ${"x".repeat(180)}  `,
    visitTime: "09:30"
  });

  assert.equal(insert.event_type, "care_exception");
  assert.equal(
    insert.idempotency_key,
    "owner-notification:submission:submission-1"
  );
  assert.equal(insert.task_title.length, 160);
  assert.deepEqual(Object.keys(insert).sort(), [
    "event_type",
    "idempotency_key",
    "owner_id",
    "plan_id",
    "service_date",
    "submission_id",
    "submission_revision",
    "submission_status",
    "task_id",
    "task_title",
    "visit_time"
  ]);
});

test("notification target is product-local and safely disappears with its plan", () => {
  const base = {
    created_at: "2026-07-17T03:00:00.000Z",
    event_type: "care_submission",
    id: "notification-1",
    idempotency_key: "owner-notification:submission:submission-1",
    last_notified_at: "2026-07-17T03:00:00.000Z",
    owner_id: "owner-1",
    plan_id: "plan-1",
    read_at: null,
    service_date: "2026-07-17",
    submission_id: "submission-1",
    submission_revision: 1,
    submission_status: "completed",
    task_id: "task-1",
    task_title: "补充饮水",
    updated_at: "2026-07-17T03:00:00.000Z",
    visit_time: "09:30:00"
  };

  assert.equal(
    mapOwnerNotification(base).href,
    "/catcare/plans/plan-1/results"
  );
  assert.equal(mapOwnerNotification({ ...base, plan_id: null }).href, null);
});

test("notification payload carries the source submission revision", () => {
  const insert = buildOwnerSubmissionNotification({
    abnormal: false,
    ownerId: "owner-1",
    planId: "plan-1",
    serviceDate: "2026-07-17",
    status: "note",
    submissionId: "submission-1",
    submissionRevision: 2,
    taskId: "task-1",
    taskTitle: "补充饮水",
    visitTime: "09:30"
  });

  assert.equal(insert.submission_revision, 2);
  assert.equal("read_at" in insert, false);
  assert.equal("last_notified_at" in insert, false);
});
