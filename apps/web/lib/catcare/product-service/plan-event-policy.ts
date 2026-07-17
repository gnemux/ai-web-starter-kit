import type { CareEventRow } from "./types";

const extendedEventTypes = new Set<CareEventRow["event_type"]>([
  "health",
  "medicine"
]);

export const extendedEventInfluenceDays = 30;
export const watchEventInfluenceDays = 14;

export function getCareEventReferenceDate(event: CareEventRow) {
  return event.ended_on ?? event.occurred_on ?? event.started_on;
}

export function getCareEventInfluenceDays(event: CareEventRow) {
  return event.severity === "urgent" || extendedEventTypes.has(event.event_type)
    ? extendedEventInfluenceDays
    : watchEventInfluenceDays;
}

export function isCareEventRelevantToPlan(
  event: CareEventRow,
  planStartOn: string
) {
  if (event.severity === "normal") {
    return false;
  }

  const eventStart = event.started_on ?? event.occurred_on;

  if (eventStart && eventStart > planStartOn) {
    return false;
  }

  if (
    event.started_on &&
    (!event.ended_on || event.ended_on >= planStartOn)
  ) {
    return true;
  }

  const referenceDate = getCareEventReferenceDate(event);

  if (!referenceDate || referenceDate > planStartOn) {
    return false;
  }

  return referenceDate >= subtractIsoDays(
    planStartOn,
    getCareEventInfluenceDays(event)
  );
}

function subtractIsoDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
