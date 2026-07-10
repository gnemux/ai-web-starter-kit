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

    const pathname = url.pathname.replace(
      /^\/s\/[^/]+/,
      "/s/[token]"
    );

    return `${url.protocol}//${url.host}${pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
