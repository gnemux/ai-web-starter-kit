export type CapabilityState = "enabled" | "disabled" | "not_configured" | "error";
export type AnalyticsMode = "disabled" | "external";
export type PaymentMode = "disabled" | "sandbox" | "external";
export type AiMode = "disabled" | "mock" | "external";
export type CapabilityModes = { analytics: AnalyticsMode; payment: PaymentMode; ai: AiMode };
export type CapabilityRegistryEntry = {
  id: keyof CapabilityModes;
  mode: CapabilityModes[keyof CapabilityModes];
  state: CapabilityState;
  requiredEnvironment: readonly string[];
  reason: "disabled" | "safe_adapter" | "configured" | "missing_environment";
};

const requiredEnvironment = {
  analytics: ["NEXT_PUBLIC_POSTHOG_KEY"],
  payment: ["PAYMENT_PROVIDER_SECRET"],
  ai: ["AI_PROVIDER_KEY"]
} as const;

export function resolveCapabilityRegistry(modes: CapabilityModes, environment: Record<string, string | undefined>): CapabilityRegistryEntry[] {
  return (Object.keys(modes) as Array<keyof CapabilityModes>).map((id) => {
    const mode = modes[id];
    if (mode === "disabled") return { id, mode, state: "disabled", requiredEnvironment: [], reason: "disabled" };
    if (mode === "sandbox" || mode === "mock") return { id, mode, state: "enabled", requiredEnvironment: [], reason: "safe_adapter" };
    const required = requiredEnvironment[id];
    const configured = required.every((key) => Boolean(environment[key]?.trim()));
    return { id, mode, state: configured ? "enabled" : "not_configured", requiredEnvironment: required, reason: configured ? "configured" : "missing_environment" };
  });
}

export function assertCapabilityConfiguration(modes: CapabilityModes, environment: Record<string, string | undefined>) {
  const missing = resolveCapabilityRegistry(modes, environment).filter((entry) => entry.state === "not_configured");
  if (missing.length > 0) throw new Error(`External capabilities are missing required environment: ${missing.map((entry) => `${entry.id}(${entry.requiredEnvironment.join(",")})`).join("; ")}`);
  return true;
}
export type CapabilityContext = { ownerId: string; featureKey: string; requestId: string };
export type PublicAccessDecision = { allowed: boolean; reason: "ok" | "missing" | "expired" | "revoked" | "scope_mismatch" };
export function decidePublicAccess(input: { present: boolean; expiresAt: string | null; revokedAt: string | null; expectedScope: string; actualScope: string }, now = new Date()) : PublicAccessDecision {
  if (!input.present) return { allowed: false, reason: "missing" };
  if (input.revokedAt) return { allowed: false, reason: "revoked" };
  if (input.expiresAt && new Date(input.expiresAt) <= now) return { allowed: false, reason: "expired" };
  if (input.expectedScope !== input.actualScope) return { allowed: false, reason: "scope_mismatch" };
  return { allowed: true, reason: "ok" };
}
