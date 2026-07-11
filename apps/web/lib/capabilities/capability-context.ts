import {
  normalizeSafeCapabilityContext,
  type SafeCapabilityContext
} from "@xwlc/platform";

export function fanOutSafeCapabilityContext(
  value: unknown,
  consumers: ReadonlyArray<(context: SafeCapabilityContext) => void>
): SafeCapabilityContext {
  const result = normalizeSafeCapabilityContext(value);

  if (!result.ok || !result.data) {
    throw new Error("A valid capability context is required.");
  }

  for (const consumer of consumers) {
    consumer(result.data);
  }

  return result.data;
}
