export const safeCapabilityContextKeys = ["correlation_id", "resource_id", "resource_type", "request_source"] as const;
export type SafeCapabilityContextKey = (typeof safeCapabilityContextKeys)[number];
export type SafeCapabilityContext = Readonly<Partial<Record<SafeCapabilityContextKey, string>>>;
export type SafeCapabilityContextResult =
  | Readonly<{ data: SafeCapabilityContext | undefined; ok: true }>
  | Readonly<{ error: Readonly<{ code: "validation_error"; message: string }>; ok: false }>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const namespacedIdentifierPattern = /^([a-z][a-z0-9._-]{0,31}):(.+)$/;
const shortBusinessSlugPattern = /^[a-z0-9][a-z0-9._-]{0,23}$/;
const safeSlugPattern = /^[a-z][a-z0-9._-]{0,63}$/;
const dangerousIdentifierSemanticPattern = /(^|[._:-])(api[-_]?key|auth(?:orization)?|bearer|credential|password|private|secret|token)([._:-]|$)/i;
const knownSecretPrefixPattern = /(?:^|[._:-])(?:github_pat_|gh[pousr]_|phx_|sk_(?:live|test)_|xox[baprs]-|AIza)/i;

export function normalizeSafeCapabilityContext(value: unknown): SafeCapabilityContextResult {
  if (value === null || value === undefined) return { data: undefined, ok: true };
  if (typeof value !== "object" || Array.isArray(value)) return invalidCapabilityContext();
  const context: Partial<Record<SafeCapabilityContextKey, string>> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!safeCapabilityContextKeys.includes(key as SafeCapabilityContextKey) || typeof item !== "string") return invalidCapabilityContext();
    const normalized = item.trim();
    const valid = key === "correlation_id" || key === "resource_id" ? isSafeCapabilityIdentifier(normalized) : safeSlugPattern.test(normalized);
    if (!valid) return invalidCapabilityContext();
    context[key as SafeCapabilityContextKey] = normalized;
  }
  return { data: Object.keys(context).length > 0 ? context : undefined, ok: true };
}

function isSafeCapabilityIdentifier(value: string): boolean {
  if (dangerousIdentifierSemanticPattern.test(value) || knownSecretPrefixPattern.test(value)) return false;
  if (uuidPattern.test(value)) return true;
  const namespaced = namespacedIdentifierPattern.exec(value);
  if (!namespaced) return false;
  const [, namespace, suffix] = namespaced;
  if (dangerousIdentifierSemanticPattern.test(namespace) || dangerousIdentifierSemanticPattern.test(suffix) || knownSecretPrefixPattern.test(suffix)) return false;
  return uuidPattern.test(suffix) || isLowEntropyBusinessSlug(suffix);
}

function isLowEntropyBusinessSlug(value: string): boolean {
  if (!shortBusinessSlugPattern.test(value) || (value.length >= 16 && !/[._-]/.test(value))) return false;
  return value.length < 20 || new Set(value).size / value.length <= 0.6;
}

function invalidCapabilityContext(): SafeCapabilityContextResult {
  return { error: { code: "validation_error", message: "Capability context contains unsupported values." }, ok: false };
}
