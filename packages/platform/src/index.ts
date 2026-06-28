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
