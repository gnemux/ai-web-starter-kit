export const safeCapabilityMetadataKeys = [
  "correlation_id",
  "resource_id",
  "resource_type",
  "request_source"
] as const;

export type SafeCapabilityMetadataKey =
  (typeof safeCapabilityMetadataKeys)[number];
export type SafeCapabilityMetadata = Partial<
  Record<SafeCapabilityMetadataKey, string>
>;

export type SafeCapabilityMetadataResult =
  | { data: SafeCapabilityMetadata | undefined; ok: true }
  | {
      error: {
        code: "validation_error";
        message: string;
      };
      ok: false;
    };

export function normalizeSafeCapabilityMetadata(
  value: unknown
): SafeCapabilityMetadataResult {
  if (value === null || value === undefined) {
    return { data: undefined, ok: true };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return invalidMetadata();
  }

  const metadata: SafeCapabilityMetadata = {};

  for (const [key, item] of Object.entries(value)) {
    if (!safeCapabilityMetadataKeys.includes(key as SafeCapabilityMetadataKey)) {
      return invalidMetadata();
    }

    if (typeof item !== "string") {
      return invalidMetadata();
    }

    const normalized = item.trim();

    if (normalized.length > 240) {
      return invalidMetadata();
    }

    if (normalized) {
      metadata[key as SafeCapabilityMetadataKey] = normalized;
    }
  }

  return {
    data: Object.keys(metadata).length > 0 ? metadata : undefined,
    ok: true
  };
}

function invalidMetadata(): SafeCapabilityMetadataResult {
  return {
    error: {
      code: "validation_error",
      message: "Capability metadata contains unsupported fields."
    },
    ok: false
  };
}
