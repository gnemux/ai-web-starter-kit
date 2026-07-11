export function buildPostHogCaptureRequest({
  apiKey,
  distinctId,
  event,
  host,
  properties
}: {
  apiKey: string;
  distinctId: string;
  event: string;
  host: string;
  properties: Record<string, unknown>;
}) {
  return {
    body: JSON.stringify({
      api_key: apiKey,
      distinct_id: distinctId,
      event,
      properties
    }),
    url: `${host.replace(/\/$/, "")}/i/v0/e/`
  };
}
