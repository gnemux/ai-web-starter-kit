export const serverAnalyticsDeliveryTimeoutMs = 1_000;

export async function deliverAnalyticsSafely({
  deliver,
  event,
  onWarning = defaultWarning,
  timeoutMs = serverAnalyticsDeliveryTimeoutMs
}: {
  deliver: (signal: AbortSignal) => Promise<{ ok: boolean; status: number }>;
  event: string;
  onWarning?: (details: {
    event: string;
    message?: string;
    status?: number;
  }) => void;
  timeoutMs?: number;
}): Promise<void> {
  try {
    const response = await deliver(AbortSignal.timeout(timeoutMs));

    if (!response.ok) {
      onWarning({ event, status: response.status });
    }
  } catch (error) {
    onWarning({
      event,
      message: error instanceof Error ? error.message : "unknown_error"
    });
  }
}

function defaultWarning(details: {
  event: string;
  message?: string;
  status?: number;
}) {
  console.warn("Analytics delivery failed", details);
}
