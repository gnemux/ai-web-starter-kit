import assert from "node:assert/strict";
import test from "node:test";

import {
  anonymousCareSubmissionNoteMaxLength,
  getAnonymousCarePlanServiceDates,
  getAnonymousCareTodayIsoDate,
  isAnonymousCareServiceDate,
  isAnonymousCareServiceDateInPlan,
  normalizeAnonymousCareSubmissionNote,
  parseAnonymousCareSubmissionStatus,
  requiresAnonymousCareSubmissionNote
} from "./anonymous-submission-policy.ts";

test("anonymous submission status is strictly whitelisted", () => {
  assert.equal(parseAnonymousCareSubmissionStatus(null), "completed");
  assert.equal(parseAnonymousCareSubmissionStatus(" completed "), "completed");
  assert.equal(parseAnonymousCareSubmissionStatus("note"), "note");
  assert.equal(parseAnonymousCareSubmissionStatus("exception"), "exception");
  assert.equal(parseAnonymousCareSubmissionStatus("owner_id=123"), null);
});

test("anonymous submission notes are trimmed and length bounded", () => {
  assert.equal(normalizeAnonymousCareSubmissionNote("  door locked  "), "door locked");
  assert.equal(normalizeAnonymousCareSubmissionNote("   "), null);
  assert.equal(
    normalizeAnonymousCareSubmissionNote(
      "x".repeat(anonymousCareSubmissionNoteMaxLength + 1)
    ),
    undefined
  );
});

test("only note and exception statuses require a note", () => {
  assert.equal(requiresAnonymousCareSubmissionNote("completed"), false);
  assert.equal(requiresAnonymousCareSubmissionNote("note"), true);
  assert.equal(requiresAnonymousCareSubmissionNote("exception"), true);
});

test("anonymous service dates cover each plan day", () => {
  assert.deepEqual(getAnonymousCarePlanServiceDates("2026-07-07", "2026-07-10"), [
    "2026-07-07",
    "2026-07-08",
    "2026-07-09",
    "2026-07-10"
  ]);
  assert.deepEqual(getAnonymousCarePlanServiceDates(null, null, "2026-07-07"), [
    "2026-07-07"
  ]);
});

test("anonymous service dates are format and plan bounded", () => {
  assert.equal(isAnonymousCareServiceDate("2026-07-07"), true);
  assert.equal(isAnonymousCareServiceDate("2026/07/07"), false);
  assert.equal(
    isAnonymousCareServiceDateInPlan(
      "2026-07-08",
      "2026-07-07",
      "2026-07-10"
    ),
    true
  );
  assert.equal(
    isAnonymousCareServiceDateInPlan(
      "2026-07-11",
      "2026-07-07",
      "2026-07-10"
    ),
    false
  );
  assert.equal(
    isAnonymousCareServiceDateInPlan("2026-07-07", null, null, "2026-07-07"),
    true
  );
});

test("anonymous today uses the configured product timezone", () => {
  assert.equal(
    getAnonymousCareTodayIsoDate(new Date("2026-07-06T17:00:00.000Z")),
    "2026-07-07"
  );
});
