import assert from "node:assert/strict";
import test from "node:test";

import { buildPostHogCaptureRequest } from "./posthog-capture.ts";

test("PostHog single-event request uses the current capture endpoint and top-level identity", () => {
  const request = buildPostHogCaptureRequest({
    apiKey: "project-token",
    distinctId: "owner-id",
    event: "travel_plan_created",
    host: "https://us.i.posthog.com/",
    properties: { module: "travel" }
  });

  assert.equal(request.url, "https://us.i.posthog.com/i/v0/e/");
  assert.deepEqual(JSON.parse(request.body), {
    api_key: "project-token",
    distinct_id: "owner-id",
    event: "travel_plan_created",
    properties: { module: "travel" }
  });
});
