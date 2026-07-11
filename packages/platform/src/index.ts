export type PlatformActorType = "user" | "anonymous_token" | "system";

export type PlatformAuthState =
  | "anonymous"
  | "authenticated"
  | "email_unverified"
  | "expired";

export type PlatformActor = Readonly<{
  id: string;
  type: PlatformActorType;
  email?: string;
  emailVerified?: boolean;
  displayName?: string | null;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}>;

export type SessionSummary = Readonly<{
  actor: PlatformActor;
  state: PlatformAuthState;
  sessionId?: string;
  expiresAt?: string;
  provider?: string;
}>;

export type PlatformErrorCode =
  | "anonymous_required"
  | "authentication_required"
  | "email_verification_required"
  | "owner_required"
  | "scope_denied"
  | "invalid_token"
  | "adapter_unavailable";

export type PlatformResult<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; code: PlatformErrorCode; message: string }>;

export type PlatformAdapterContext = Readonly<{
  requestId?: string;
  correlationId?: string;
  headers?: Readonly<Record<string, string | undefined>>;
  cookies?: Readonly<Record<string, string | undefined>>;
  env?: Readonly<Record<string, string | undefined>>;
}>;

export type OwnerScopedResource = Readonly<{
  ownerId: string;
  resourceId?: string;
  resourceType?: string;
}>;

export type AuthResult = PlatformResult<SessionSummary>;

export function requireAuthenticatedActor(
  actor: PlatformActor | null | undefined,
): PlatformResult<PlatformActor> {
  if (!actor || actor.type === "anonymous_token") {
    return {
      ok: false,
      code: "authentication_required",
      message: "A signed-in user is required.",
    };
  }

  return { ok: true, data: actor };
}

export function requireVerifiedEmail(actor: PlatformActor): PlatformResult<PlatformActor> {
  if (!actor.emailVerified) {
    return {
      ok: false,
      code: "email_verification_required",
      message: "A verified email address is required.",
    };
  }

  return { ok: true, data: actor };
}

export function requireOwner(
  actor: PlatformActor,
  resource: OwnerScopedResource,
): PlatformResult<PlatformActor> {
  if (actor.type !== "user" || actor.id !== resource.ownerId) {
    return {
      ok: false,
      code: "owner_required",
      message: "The current actor does not own this resource.",
    };
  }

  return { ok: true, data: actor };
}

export type EmailVerificationSendInput = Readonly<{
  email: string;
  redirectTo: string;
  locale?: string;
  correlationId?: string;
}>;

export type EmailVerificationConfirmInput = Readonly<{
  tokenHash: string;
  type: "signup" | "email_change" | "recovery";
  redirectTo?: string;
  correlationId?: string;
}>;

export type EmailVerificationPort = Readonly<{
  send(input: EmailVerificationSendInput): Promise<PlatformResult<{ sent: boolean }>>;
  confirm(input: EmailVerificationConfirmInput): Promise<PlatformResult<SessionSummary>>;
}>;

export type PlatformEvent = Readonly<{
  name: string;
  occurredAt: string;
  actor?: PlatformActor;
  module: string;
  correlationId?: string;
  properties?: Readonly<Record<string, string | number | boolean | null>>;
}>;

export type AnalyticsPort = Readonly<{
  track(event: PlatformEvent): Promise<PlatformResult<{ recorded: boolean }>>;
}>;

export type OutboxEvent = PlatformEvent &
  Readonly<{
    idempotencyKey: string;
    destination: "email" | "analytics" | "webhook" | "internal";
  }>;

export type OutboxPort = Readonly<{
  enqueue(event: OutboxEvent): Promise<PlatformResult<{ enqueued: boolean }>>;
}>;

export const safeCapabilityContextKeys = [
  "correlation_id",
  "resource_id",
  "resource_type",
  "request_source",
] as const;

export type SafeCapabilityContextKey =
  (typeof safeCapabilityContextKeys)[number];
export type SafeCapabilityContext = Readonly<
  Partial<Record<SafeCapabilityContextKey, string>>
>;

export type SafeCapabilityContextResult =
  | Readonly<{ data: SafeCapabilityContext | undefined; ok: true }>
  | Readonly<{
      error: Readonly<{
        code: "validation_error";
        message: string;
      }>;
      ok: false;
    }>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const namespacedIdentifierPattern = /^([a-z][a-z0-9._-]{0,31}):(.+)$/;
const shortBusinessSlugPattern = /^[a-z0-9][a-z0-9._-]{0,23}$/;
const safeSlugPattern = /^[a-z][a-z0-9._-]{0,63}$/;
const dangerousIdentifierSemanticPattern =
  /(^|[._:-])(api[-_]?key|auth(?:orization)?|bearer|credential|password|private|secret|token)([._:-]|$)/i;
const knownSecretPrefixPattern =
  /(?:^|[._:-])(?:github_pat_|gh[pousr]_|phx_|sk_(?:live|test)_|xox[baprs]-|AIza)/i;

export function normalizeSafeCapabilityContext(
  value: unknown,
): SafeCapabilityContextResult {
  if (value === null || value === undefined) {
    return { data: undefined, ok: true };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return invalidCapabilityContext();
  }

  const context: Partial<Record<SafeCapabilityContextKey, string>> = {};

  for (const [key, item] of Object.entries(value)) {
    if (!safeCapabilityContextKeys.includes(key as SafeCapabilityContextKey)) {
      return invalidCapabilityContext();
    }

    if (typeof item !== "string") {
      return invalidCapabilityContext();
    }

    const normalized = item.trim();
    const valid =
      key === "correlation_id"
        ? isSafeCapabilityIdentifier(normalized)
        : key === "resource_id"
          ? isSafeCapabilityIdentifier(normalized)
          : safeSlugPattern.test(normalized);

    if (!valid) {
      return invalidCapabilityContext();
    }

    context[key as SafeCapabilityContextKey] = normalized;
  }

  return {
    data: Object.keys(context).length > 0 ? context : undefined,
    ok: true,
  };
}

function isSafeCapabilityIdentifier(value: string): boolean {
  if (
    dangerousIdentifierSemanticPattern.test(value) ||
    knownSecretPrefixPattern.test(value)
  ) {
    return false;
  }

  if (uuidPattern.test(value)) {
    return true;
  }

  const namespaced = namespacedIdentifierPattern.exec(value);

  if (!namespaced) {
    return false;
  }

  const [, namespace, suffix] = namespaced;

  if (
    dangerousIdentifierSemanticPattern.test(namespace) ||
    dangerousIdentifierSemanticPattern.test(suffix) ||
    knownSecretPrefixPattern.test(suffix)
  ) {
    return false;
  }

  return uuidPattern.test(suffix) || isLowEntropyBusinessSlug(suffix);
}

function isLowEntropyBusinessSlug(value: string): boolean {
  if (!shortBusinessSlugPattern.test(value)) {
    return false;
  }

  if (value.length >= 16 && !/[._-]/.test(value)) {
    return false;
  }

  return value.length < 20 || new Set(value).size / value.length <= 0.6;
}

function invalidCapabilityContext(): SafeCapabilityContextResult {
  return {
    error: {
      code: "validation_error",
      message: "Capability context contains unsupported values.",
    },
    ok: false,
  };
}

export type AnonymousShareTokenActorContext<
  ResourceType extends string = string,
  Scope extends string = string,
> = Readonly<{
  actorType: "anonymous_token";
  expiresAt: string;
  ownerId: string;
  resourceId: string;
  resourceType: ResourceType;
  scope: Scope;
  tokenId: string;
}>;

export type ShareTokenGateRecord<
  ResourceType extends string = string,
  Scope extends string = string,
> = Readonly<
  Omit<AnonymousShareTokenActorContext<ResourceType, Scope>, "actorType"> & {
    revokedAt: string | null;
  }
>;

export type ShareTokenGateStatus =
  | "valid"
  | "expired"
  | "revoked"
  | "invalid"
  | "unavailable";

export type ShareTokenGateOutcome<
  ResourceType extends string = string,
  Scope extends string = string,
> =
  | ValidShareTokenGateOutcome<ResourceType, Scope>
  | RejectedShareTokenGateOutcome<ResourceType, Scope>;

export type ValidShareTokenGateOutcome<
  ResourceType extends string = string,
  Scope extends string = string,
> = Readonly<{
  actor: AnonymousShareTokenActorContext<ResourceType, Scope>;
  status: "valid";
}>;

export type RejectedShareTokenGateOutcome<
  ResourceType extends string = string,
  Scope extends string = string,
> =
  | Readonly<{ actor: null; status: "invalid" }>
  | Readonly<{
      actor: AnonymousShareTokenActorContext<ResourceType, Scope>;
      status: "expired" | "revoked" | "unavailable";
    }>;

export function resolveShareTokenGate<
  ResourceType extends string,
  Scope extends string,
>({
  now = new Date(),
  record,
  resourceAvailable = true,
  secretVerified,
}: {
  now?: Date;
  record: ShareTokenGateRecord<ResourceType, Scope> | null;
  resourceAvailable?: boolean;
  secretVerified: boolean;
}): ShareTokenGateOutcome<ResourceType, Scope> {
  if (!record || !secretVerified) {
    return { actor: null, status: "invalid" };
  }

  const actor: AnonymousShareTokenActorContext<ResourceType, Scope> = {
    actorType: "anonymous_token",
    expiresAt: record.expiresAt,
    ownerId: record.ownerId,
    resourceId: record.resourceId,
    resourceType: record.resourceType,
    scope: record.scope,
    tokenId: record.tokenId,
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
  Scope extends string,
>(
  actor: AnonymousShareTokenActorContext<ResourceType, Scope>,
  resourceAvailable: boolean,
): ShareTokenGateOutcome<ResourceType, Scope> {
  return {
    actor,
    status: resourceAvailable ? "valid" : "unavailable",
  };
}
