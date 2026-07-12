import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCatCareAuditInsert,
  mapCatCareAuditActivity
} from "./audit.ts";

test("catcare audit payload keeps bearer-link secrets and private notes out", () => {
  const event = buildCatCareAuditInsert({
    actorType: "anonymous_token",
    correlationId: "corr_test",
    eventName: "care_submission_created",
    idempotencyKey: "anonymous:plan:2026-07-07:0930:submission-ref",
    ownerId: "owner-id",
    properties: {
      abnormal: true,
      note: "full private note must not be stored",
      rawToken: "raw-secret-token",
      status: "exception",
      tokenHash: "hash-secret"
    },
    resourceId: "plan-id",
    resourceType: "care_plan",
    taskId: "task-id"
  });

  assert.deepEqual(event.event_data, {
    abnormal: true,
    status: "exception"
  });
  const retry = buildCatCareAuditInsert({ actorType: "anonymous_token", correlationId: "different_corr", eventName: "care_submission_created", idempotencyKey: "anonymous:plan:2026-07-07:0930:submission-ref", ownerId: "owner-id", properties: { abnormal: true, status: "exception" }, resourceId: "plan-id", resourceType: "care_plan", taskId: "task-id" });
  const update = buildCatCareAuditInsert({ actorType: "anonymous_token", correlationId: "different_corr", eventName: "care_submission_created", idempotencyKey: "anonymous:plan:2026-07-07:0930:submission-ref", ownerId: "owner-id", properties: { abnormal: false, status: "completed" }, resourceId: "plan-id", resourceType: "care_plan", taskId: "task-id" });
  assert.equal(retry.id, event.id);
  assert.notEqual(update.id, event.id);
});

test("catcare audit activity is owner-readable without internal ids", () => {
  const activity = mapCatCareAuditActivity({
    actor_type: "anonymous_token",
    correlation_id: "corr_test",
    event_data: { reason: "revoked" },
    event_name: "invalid_or_revoked_token_rejected",
    id: "audit-id",
    idempotency_key: null,
    occurred_at: "2026-07-08T10:00:00.000Z",
    owner_id: "owner-id",
    resource_id: "plan-id",
    resource_type: "care_plan",
    task_id: null,
    token_record_id: "token-row-id"
  });

  assert.equal(activity.title, "有人尝试使用不可用链接");
  assert.equal(activity.description, "原因：已撤销");
  assert.equal(activity.kind, "warning");
});
