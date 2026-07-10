import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type AnonymousShareTokenActorContext<
  ResourceType extends string = string,
  Scope extends string = string
> = {
  actorType: "anonymous_token";
  expiresAt: string;
  ownerId: string;
  resourceId: string;
  resourceType: ResourceType;
  scope: Scope;
  tokenId: string;
};

export type ShareTokenGateRecord<
  ResourceType extends string = string,
  Scope extends string = string
> = Omit<
  AnonymousShareTokenActorContext<ResourceType, Scope>,
  "actorType"
> & {
  revokedAt: string | null;
  tokenHash: string;
};

export type ShareTokenGateStatus =
  | "valid"
  | "expired"
  | "revoked"
  | "invalid"
  | "unavailable";

export type ShareTokenHashResult =
  | { data: string; ok: true }
  | {
      error: {
        code: "validation_error";
        fields: { token: "invalid" };
        message: string;
      };
      ok: false;
    };

export type ShareTokenGateOutcome<
  ResourceType extends string = string,
  Scope extends string = string
> =
  | ValidShareTokenGateOutcome<ResourceType, Scope>
  | RejectedShareTokenGateOutcome<ResourceType, Scope>;

export type ValidShareTokenGateOutcome<
  ResourceType extends string = string,
  Scope extends string = string
> = {
  actor: AnonymousShareTokenActorContext<ResourceType, Scope>;
  status: "valid";
};

export type RejectedShareTokenGateOutcome<
  ResourceType extends string = string,
  Scope extends string = string
> =
  | { actor: null; status: "invalid" }
  | {
      actor: AnonymousShareTokenActorContext<ResourceType, Scope>;
      status: "expired" | "revoked" | "unavailable";
    };

export function createShareTokenCredential() {
  const secret = randomBytes(32).toString("base64url");
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    throw new Error("Generated share token could not be hashed.");
  }

  return { secret, tokenHash: hashResult.data };
}

export function hashShareTokenSecret(secret: string): ShareTokenHashResult {
  const normalized = secret.trim();

  if (normalized.length < 32) {
    return {
      error: {
        code: "validation_error",
        fields: { token: "invalid" },
        message: "Share token is invalid."
      },
      ok: false
    };
  }

  return {
    data: createHash("sha256")
      .update(normalized, "utf8")
      .digest("base64url"),
    ok: true
  };
}

export function verifyShareTokenSecret(secret: string, hash: string): boolean {
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    return false;
  }

  const actual = Buffer.from(hashResult.data);
  const expected = Buffer.from(hash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function resolveShareTokenGate<
  ResourceType extends string,
  Scope extends string
>({
  now = new Date(),
  record,
  resourceAvailable = true,
  secret
}: {
  now?: Date;
  record: ShareTokenGateRecord<ResourceType, Scope> | null;
  resourceAvailable?: boolean;
  secret: string;
}): ShareTokenGateOutcome<ResourceType, Scope> {
  if (!record || !verifyShareTokenSecret(secret, record.tokenHash)) {
    return { actor: null, status: "invalid" };
  }

  const actor: AnonymousShareTokenActorContext<ResourceType, Scope> = {
    actorType: "anonymous_token",
    expiresAt: record.expiresAt,
    ownerId: record.ownerId,
    resourceId: record.resourceId,
    resourceType: record.resourceType,
    scope: record.scope,
    tokenId: record.tokenId
  };

  if (record.revokedAt) {
    return { actor, status: "revoked" };
  }

  const expiresAt = new Date(record.expiresAt).getTime();

  if (!Number.isFinite(expiresAt)) {
    return { actor, status: "unavailable" };
  }

  if (expiresAt <= now.getTime()) {
    return { actor, status: "expired" };
  }

  return normalizeShareTokenAvailability(actor, resourceAvailable);
}

export function normalizeShareTokenAvailability<
  ResourceType extends string,
  Scope extends string
>(
  actor: AnonymousShareTokenActorContext<ResourceType, Scope>,
  resourceAvailable: boolean
): ShareTokenGateOutcome<ResourceType, Scope> {
  return {
    actor,
    status: resourceAvailable ? "valid" : "unavailable"
  };
}
