export type CapabilityState = "enabled" | "disabled" | "not_configured" | "error";
export type CapabilityContext = { ownerId: string; featureKey: string; requestId: string };
export type PublicAccessDecision = { allowed: boolean; reason: "ok" | "missing" | "expired" | "revoked" | "scope_mismatch" };
export function decidePublicAccess(input: { present: boolean; expiresAt: string | null; revokedAt: string | null; expectedScope: string; actualScope: string }, now = new Date()) : PublicAccessDecision {
  if (!input.present) return { allowed: false, reason: "missing" };
  if (input.revokedAt) return { allowed: false, reason: "revoked" };
  if (input.expiresAt && new Date(input.expiresAt) <= now) return { allowed: false, reason: "expired" };
  if (input.expectedScope !== input.actualScope) return { allowed: false, reason: "scope_mismatch" };
  return { allowed: true, reason: "ok" };
}
