export function resolveSafeAnalyticsCurrentUrl({
  host,
  path,
  protocol,
  referer
}: {
  host?: string | null;
  path?: string | null;
  protocol?: string | null;
  referer?: string | null;
}): string | null {
  if (referer) {
    return sanitizeAnalyticsUrl(referer);
  }

  if (!host || !path) {
    return null;
  }

  const safeProtocol =
    protocol === "http" || protocol === "https"
      ? protocol
      : host.includes("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return sanitizeAnalyticsUrl(`${safeProtocol}://${host}${normalizedPath}`);
}

const uuidPathSegmentPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tokenLikePathSegmentPattern = /^[A-Za-z0-9_-]{24,}$/;
const dangerousPathSegmentPattern =
  /^(?:api[-_]?key|auth|authorization|bearer|credential|github_pat_|gh[pousr]_|phx_|secret|sk_(?:live|test)_|token|xox[baprs]-)/i;

function sanitizeAnalyticsUrl(value: string): string | null {
  try {
    const url = new URL(value);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }

    const pathname = url.pathname
      .split("/")
      .map(sanitizeAnalyticsPathSegment)
      .join("/");

    return `${url.protocol}//${url.host}${pathname}`;
  } catch {
    return null;
  }
}

function sanitizeAnalyticsPathSegment(segment: string): string {
  if (!segment) {
    return segment;
  }

  let decoded: string;

  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return "[redacted]";
  }

  if (uuidPathSegmentPattern.test(decoded)) {
    return decoded;
  }

  if (
    dangerousPathSegmentPattern.test(decoded) ||
    tokenLikePathSegmentPattern.test(decoded)
  ) {
    return "[redacted]";
  }

  return segment;
}
