import test from "node:test";
import assert from "node:assert/strict";

import { buildCatCareOutboxInsert } from "./outbox.ts";

test("catcare outbox payload keeps bearer-link secrets and private notes out", () => {
  const item = buildCatCareOutboxInsert({
    aggregateId: "submission-id",
    aggregateType: "care_submission",
    correlationId: "corr_test",
    eventType: "owner_notification",
    idempotencyKey: "anonymous:plan:2026-07-07:0930:submission-ref",
    ownerId: "owner-id",
    payload: {
      rawToken: "raw-secret-token",
      status: "exception",
      task_title: "换水",
      tokenHash: "hash-secret",
      full_note: "private note text"
    }
  });

  assert.deepEqual(item.payload, {
    status: "exception",
    task_title: "换水"
  });
  assert.equal(item.status, "pending");
  assert.equal(item.attempt_count, 0);
});
