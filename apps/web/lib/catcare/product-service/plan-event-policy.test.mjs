import assert from "node:assert/strict";
import test from "node:test";

import {
  getCareEventInfluenceDays,
  isCareEventRelevantToPlan
} from "./plan-event-policy.ts";

function event(overrides = {}) {
  return {
    ended_on: null,
    event_type: "behavior",
    occurred_on: "2026-07-03",
    severity: "watch",
    started_on: null,
    ...overrides
  };
}

test("watch events use a 14-day plan-start window", () => {
  assert.equal(isCareEventRelevantToPlan(event(), "2026-07-17"), true);
  assert.equal(
    isCareEventRelevantToPlan(event({ occurred_on: "2026-07-02" }), "2026-07-17"),
    false
  );
});

test("health, medicine, and urgent events use a 30-day window", () => {
  for (const candidate of [
    event({ event_type: "health", occurred_on: "2026-06-17" }),
    event({ event_type: "medicine", occurred_on: "2026-06-17" }),
    event({ occurred_on: "2026-06-17", severity: "urgent" })
  ]) {
    assert.equal(getCareEventInfluenceDays(candidate), 30);
    assert.equal(isCareEventRelevantToPlan(candidate, "2026-07-17"), true);
  }

  assert.equal(
    isCareEventRelevantToPlan(
      event({ event_type: "health", occurred_on: "2026-06-16" }),
      "2026-07-17"
    ),
    false
  );
});

test("normal and future events never influence a generated plan", () => {
  assert.equal(
    isCareEventRelevantToPlan(event({ severity: "normal" }), "2026-07-17"),
    false
  );
  assert.equal(
    isCareEventRelevantToPlan(event({ occurred_on: "2026-07-18" }), "2026-07-17"),
    false
  );
});

test("an explicitly ongoing ranged event remains relevant until it ends", () => {
  assert.equal(
    isCareEventRelevantToPlan(
      event({ occurred_on: null, started_on: "2026-01-01" }),
      "2026-07-17"
    ),
    true
  );
  assert.equal(
    isCareEventRelevantToPlan(
      event({
        ended_on: "2026-07-20",
        occurred_on: null,
        started_on: "2026-01-01"
      }),
      "2026-07-17"
    ),
    true
  );
  assert.equal(
    isCareEventRelevantToPlan(
      event({
        ended_on: "2026-06-01",
        occurred_on: null,
        started_on: "2026-01-01"
      }),
      "2026-07-17"
    ),
    false
  );
});
