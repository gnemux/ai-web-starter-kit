import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  deliverAnalyticsSafely,
  serverAnalyticsDeliveryTimeoutMs
} from "./delivery.ts";

const catCareServerModules = [
  "../catcare/product-service/anonymous-submissions.ts",
  "../catcare/product-service/anonymous-view.ts",
  "../catcare/product-service/cats.ts",
  "../catcare/product-service/plans.ts",
  "../catcare/product-service/routines.ts",
  "../catcare/product-service/share-tokens.ts"
];

test("committed business result survives analytics transport failure", async () => {
  const warnings = [];
  const result = { data: { submissionId: "submission-1" }, ok: true };

  async function completeBusinessAction() {
    await deliverAnalyticsSafely({
      deliver: async () => {
        throw new Error("provider unavailable");
      },
      event: "catcare_submission_created",
      onWarning: (details) => warnings.push(details)
    });
    return result;
  }

  let completedResult;
  await assert.doesNotReject(async () => {
    completedResult = await completeBusinessAction();
  });
  assert.equal(completedResult, result);
  assert.deepEqual(warnings, [
    {
      event: "catcare_submission_created",
      message: "provider unavailable"
    }
  ]);
});

test("analytics non-success response is observed and still settles", async () => {
  const warnings = [];

  await deliverAnalyticsSafely({
    deliver: async (signal) => {
      assert.equal(signal.aborted, false);
      return { ok: false, status: 503 };
    },
    event: "catcare_share_page_viewed",
    onWarning: (details) => warnings.push(details),
    timeoutMs: 100
  });

  assert.deepEqual(warnings, [
    { event: "catcare_share_page_viewed", status: 503 }
  ]);
});

test("analytics timeout aborts delivery and settles with a safe warning", async () => {
  const warnings = [];

  assert.equal(serverAnalyticsDeliveryTimeoutMs, 3_000);
  await assert.doesNotReject(() =>
    deliverAnalyticsSafely({
      deliver: (signal) =>
        new Promise((_, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true
          });
        }),
      event: "catcare_submission_created",
      onWarning: (details) => warnings.push(details),
      timeoutMs: 10
    })
  );

  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].event, "catcare_submission_created");
  assert.equal(typeof warnings[0].message, "string");
});

test("CatCare server analytics has no unmanaged fire-and-forget delivery", () => {
  for (const path of catCareServerModules) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");

    assert.doesNotMatch(
      source,
      /void\s+trackCatCareProductEvent\s*\(/,
      `${path} must await its Analytics facade`
    );
  }
});
