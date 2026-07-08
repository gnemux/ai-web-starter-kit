export const anonymousCareSubmissionNoteMaxLength = 2000;
export const anonymousCareSubmissionTimeZone = "Asia/Shanghai";
export const anonymousCareSubmissionStatusValues = [
  "completed",
  "note",
  "exception"
] as const;

export type AnonymousCareSubmissionStatus =
  (typeof anonymousCareSubmissionStatusValues)[number];

export function parseAnonymousCareSubmissionStatus(
  value: unknown
): AnonymousCareSubmissionStatus | null {
  const status = String(value ?? "completed").trim();

  return anonymousCareSubmissionStatusValues.includes(
    status as AnonymousCareSubmissionStatus
  )
    ? (status as AnonymousCareSubmissionStatus)
    : null;
}

export function normalizeAnonymousCareSubmissionNote(value: unknown) {
  const note = String(value ?? "").trim();

  if (!note) {
    return null;
  }

  if (note.length > anonymousCareSubmissionNoteMaxLength) {
    return undefined;
  }

  return note;
}

export function requiresAnonymousCareSubmissionNote(
  status: AnonymousCareSubmissionStatus
) {
  return status === "note" || status === "exception";
}

export function getAnonymousCarePlanServiceDates(
  startOn: string | null,
  endOn: string | null,
  today = getAnonymousCareTodayIsoDate()
) {
  if (!startOn) {
    return [today];
  }

  const dates: string[] = [];
  const finalDate = endOn && endOn >= startOn ? endOn : startOn;
  const cursor = new Date(`${startOn}T00:00:00Z`);
  const end = new Date(`${finalDate}T00:00:00Z`);

  while (cursor.getTime() <= end.getTime() && dates.length < 31) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export function getAnonymousCareTodayIsoDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: anonymousCareSubmissionTimeZone,
    year: "numeric"
  }).format(now);
}

export function isAnonymousCareServiceDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isAnonymousCareServiceDateInPlan(
  serviceDate: string,
  startOn: string | null,
  endOn: string | null,
  today = getAnonymousCareTodayIsoDate()
) {
  if (!startOn) {
    return serviceDate === today;
  }

  const finalDate = endOn && endOn >= startOn ? endOn : startOn;

  return serviceDate >= startOn && serviceDate <= finalDate;
}

export function parseAnonymousCareSubmissionSlotKey(
  idempotencyKey: string | null
) {
  const match = /^anonymous:[^:]+:(\d{4}-\d{2}-\d{2}):([0-2]\d[0-5]\d)/.exec(
    idempotencyKey ?? ""
  );
  const serviceDate = match?.[1] ?? "";
  const encodedVisitTime = match?.[2] ?? "";

  if (!isAnonymousCareServiceDate(serviceDate)) {
    return null;
  }

  if (!/^([01]\d|2[0-3])[0-5]\d$/.test(encodedVisitTime)) {
    return null;
  }

  const visitTime = `${encodedVisitTime.slice(0, 2)}:${encodedVisitTime.slice(2)}`;

  return {
    key: `${serviceDate}:${visitTime}`,
    serviceDate,
    visitTime
  };
}
