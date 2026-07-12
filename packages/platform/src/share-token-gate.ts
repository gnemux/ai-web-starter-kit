export type AnonymousShareTokenActorContext<ResourceType extends string = string, Scope extends string = string> = Readonly<{
  actorType: "anonymous_token"; expiresAt: string; ownerId: string; resourceId: string; resourceType: ResourceType; scope: Scope; tokenId: string;
}>;
export type ShareTokenGateRecord<ResourceType extends string = string, Scope extends string = string> = Readonly<Omit<AnonymousShareTokenActorContext<ResourceType, Scope>, "actorType"> & { revokedAt: string | null }>;
export type ShareTokenGateStatus = "valid" | "expired" | "revoked" | "invalid" | "unavailable";
export type ValidShareTokenGateOutcome<ResourceType extends string = string, Scope extends string = string> = Readonly<{ actor: AnonymousShareTokenActorContext<ResourceType, Scope>; status: "valid" }>;
export type RejectedShareTokenGateOutcome<ResourceType extends string = string, Scope extends string = string> = Readonly<{ actor: null; status: "invalid" }> | Readonly<{ actor: AnonymousShareTokenActorContext<ResourceType, Scope>; status: "expired" | "revoked" | "unavailable" }>;
export type ShareTokenGateOutcome<ResourceType extends string = string, Scope extends string = string> = ValidShareTokenGateOutcome<ResourceType, Scope> | RejectedShareTokenGateOutcome<ResourceType, Scope>;

export function resolveShareTokenGate<ResourceType extends string, Scope extends string>({ now = new Date(), record, resourceAvailable = true, secretVerified }: { now?: Date; record: ShareTokenGateRecord<ResourceType, Scope> | null; resourceAvailable?: boolean; secretVerified: boolean }): ShareTokenGateOutcome<ResourceType, Scope> {
  if (!record || !secretVerified) return { actor: null, status: "invalid" };
  const actor: AnonymousShareTokenActorContext<ResourceType, Scope> = { actorType: "anonymous_token", expiresAt: record.expiresAt, ownerId: record.ownerId, resourceId: record.resourceId, resourceType: record.resourceType, scope: record.scope, tokenId: record.tokenId };
  if (record.revokedAt) return { actor, status: "revoked" };
  const expiresAt = new Date(record.expiresAt).getTime();
  if (!Number.isFinite(expiresAt)) return { actor, status: "unavailable" };
  if (expiresAt <= now.getTime()) return { actor, status: "expired" };
  return normalizeShareTokenAvailability(actor, resourceAvailable);
}

export function normalizeShareTokenAvailability<ResourceType extends string, Scope extends string>(actor: AnonymousShareTokenActorContext<ResourceType, Scope>, resourceAvailable: boolean): ShareTokenGateOutcome<ResourceType, Scope> {
  return { actor, status: resourceAvailable ? "valid" : "unavailable" };
}
