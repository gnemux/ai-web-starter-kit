const allowedInternalReturnBases = ["/account", "/catcare"] as const;

type AllowedInternalReturnBase = (typeof allowedInternalReturnBases)[number];

export function normalizeInternalReturnTo(
  value: string | null | undefined,
  fallback: string
) {
  const trimmed = String(value ?? "").trim();

  return isAllowedInternalReturnTo(trimmed) ? trimmed : fallback;
}

export function isAllowedInternalReturnTo(value: string | null | undefined) {
  const trimmed = String(value ?? "").trim();

  if (
    !trimmed ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return false;
  }

  return allowedInternalReturnBases.some((basePath) =>
    isInternalReturnPathWithin(trimmed, basePath)
  );
}

export function isInternalReturnPathWithin(
  value: string,
  basePath: AllowedInternalReturnBase
) {
  return (
    value === basePath ||
    value.startsWith(`${basePath}/`) ||
    value.startsWith(`${basePath}?`)
  );
}
