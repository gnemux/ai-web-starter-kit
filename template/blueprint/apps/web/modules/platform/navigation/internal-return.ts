export function normalizeInternalReturn(value: string | null | undefined, fallback = "/") {
  const candidate = String(value ?? "").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\") || /[\u0000-\u001f\u007f]/.test(candidate)) return fallback;
  try {
    const origin = "https://app.invalid";
    const resolved = new URL(candidate, origin);
    return resolved.origin === origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : fallback;
  } catch {
    return fallback;
  }
}
