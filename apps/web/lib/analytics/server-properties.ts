export type SafeAnalyticsPrimitive = string | number | boolean | null | undefined;
export type SafeAnalyticsProperties = Record<string, SafeAnalyticsPrimitive>;

const propertyNamePattern = /^[a-z$][a-z0-9_$]{0,63}$/;
const sensitivePropertyPattern =
  /(authorization|cookie|credential|password|prompt|secret|token|private|handoff|note|content|body|email)/i;
const safeAnalyticsStringPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/;
const authHeaderValuePattern = /^(?:basic|bearer)\s+/i;
const sensitiveValueSemanticPattern =
  /(^|[._:/-])(api[-_]?key|auth(?:orization)?|bearer|credential|password|private|secret|token)([._:/-]|$)/i;
const knownSecretValuePrefixPattern =
  /(?:^|[._:-])(?:github_pat_|gh[pousr]_|phx_|sk_(?:live|test)_|xox[baprs]-|AIza)/i;
const urlValuePattern = /(?:^[a-z][a-z0-9+.-]*:\/\/|www\.)/i;
const reservedEnvelopeProperties = new Set([
  "$current_url",
  "$lib",
  "app",
  "correlation_id",
  "current_url",
  "env",
  "host",
  "market",
  "module",
  "mvp_stage",
  "request_source",
  "resource_id",
  "resource_type",
  "version"
]);

export function sanitizeServerProperties(
  properties: object
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (
      !propertyNamePattern.test(key) ||
      reservedEnvelopeProperties.has(key) ||
      sensitivePropertyPattern.test(key)
    ) {
      continue;
    }

    if (typeof value === "string") {
      const normalized = value.trim();

      if (
        normalized &&
        safeAnalyticsStringPattern.test(normalized) &&
        !authHeaderValuePattern.test(normalized) &&
        !sensitiveValueSemanticPattern.test(normalized) &&
        !knownSecretValuePrefixPattern.test(normalized) &&
        !urlValuePattern.test(normalized) &&
        !looksLikeHighEntropyToken(normalized)
      ) {
        safe[key] = normalized;
      }
    } else if (typeof value === "number" && Number.isFinite(value)) {
      safe[key] = value;
    } else if (typeof value === "boolean") {
      safe[key] = value;
    }
  }

  return safe;
}

function looksLikeHighEntropyToken(value: string): boolean {
  if (
    value.length < 32 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    return false;
  }

  return true;
}
