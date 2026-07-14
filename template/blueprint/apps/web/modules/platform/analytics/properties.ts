const eventNamePattern = /^[a-z][a-z0-9_]{0,47}$/;
const slugValuePattern = /^[a-z0-9][a-z0-9_.:-]{0,47}$/;
const stringKeys = new Set(["surface", "action", "status", "variant", "feature", "step"]);
const numberKeys = new Set(["count", "duration_ms"]);
const booleanKeys = new Set(["enabled"]);
const sensitiveKeyPattern = /(?:prompt|result|email|phone|name|token|secret|password|cookie|auth|content|message|payload|url)/i;

export function assertProductEventName(name: string) {
  if (!eventNamePattern.test(name)) throw new TypeError("Analytics event name must be a bounded snake_case identifier");
  return name;
}

export function sanitizeAnalyticsProperties(properties: Record<string, unknown>) {
  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (sensitiveKeyPattern.test(key)) throw new TypeError(`Sensitive analytics property is forbidden: ${key}`);
    if (stringKeys.has(key)) {
      if (typeof value !== "string" || !slugValuePattern.test(value)) throw new TypeError(`Invalid analytics slug property: ${key}`);
      sanitized[key] = value;
      continue;
    }
    if (numberKeys.has(key)) {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1_000_000_000) throw new TypeError(`Invalid analytics number property: ${key}`);
      sanitized[key] = value;
      continue;
    }
    if (booleanKeys.has(key)) {
      if (typeof value !== "boolean") throw new TypeError(`Invalid analytics boolean property: ${key}`);
      sanitized[key] = value;
      continue;
    }
    throw new TypeError(`Unknown analytics property: ${key}`);
  }
  return sanitized;
}
