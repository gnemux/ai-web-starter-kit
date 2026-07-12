export const aiProviderTimeoutMs = 60_000;

export type AiProviderExecutionFailure = "provider_threw" | "provider_timeout";

export async function executeAiProviderWithTimeout<T>(
  execute: () => Promise<T>,
  timeoutMs = aiProviderTimeoutMs
): Promise<{ ok: true; data: T } | { ok: false; reason: AiProviderExecutionFailure }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(execute).then((data) => ({ data, ok: true as const })).catch(() => ({ ok: false as const, reason: "provider_threw" as const })),
      new Promise<{ ok: false; reason: "provider_timeout" }>((resolve) => {
        timer = setTimeout(() => resolve({ ok: false, reason: "provider_timeout" }), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function buildSafeAiProviderFailureObservation() {
  return { reason: "provider_failed" as const, result: "failed" as const };
}
