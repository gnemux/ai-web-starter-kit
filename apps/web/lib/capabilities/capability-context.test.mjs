import assert from "node:assert/strict";
import test from "node:test";

import { fanOutSafeCapabilityContext } from "./capability-context.ts";

test("one validated capability context instance reaches every consumer", () => {
  const received = [];
  const context = fanOutSafeCapabilityContext(
    {
      correlation_id: "123e4567-e89b-12d3-a456-426614174000",
      request_source: "travel_plan_publish",
      resource_id: "223e4567-e89b-12d3-a456-426614174000",
      resource_type: "trip_plan"
    },
    [
      (value) => received.push({ consumer: "audit", value }),
      (value) => received.push({ consumer: "analytics", value }),
      (value) => received.push({ consumer: "outbox", value })
    ]
  );

  assert.equal(received.length, 3);
  assert.ok(received.every((entry) => entry.value === context));
  assert.deepEqual(
    received.map((entry) => entry.consumer),
    ["audit", "analytics", "outbox"]
  );
});

test("invalid untrusted context reaches no consumer", () => {
  let calls = 0;

  assert.throws(
    () =>
      fanOutSafeCapabilityContext(
        { resource_id: "secret:abcdefghijklmnopqrstuvwxyz123456" },
        [() => calls++]
      ),
    /valid capability context/
  );
  assert.equal(calls, 0);
});
