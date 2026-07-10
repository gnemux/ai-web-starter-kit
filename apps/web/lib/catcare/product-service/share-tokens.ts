import "server-only";

import { randomUUID } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";
import { createAnonymousTokenScope } from "@xwlc/db";

import {
  createShareTokenCredential,
  hashShareTokenSecret,
  resolveShareTokenGate,
  verifyShareTokenSecret,
  type AnonymousShareTokenActorContext,
  type RejectedShareTokenGateOutcome
} from "../../access/share-token-gate";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import {
  getAuthenticatedOwnerId,
  mapDbBoundaryError,
  mapSupabaseError,
  trackCatCareProductEvent
} from "./core";
import { recordCatCareAuditEvent } from "./audit";

export { hashShareTokenSecret };

export type ShareTokenRow = Database["public"]["Tables"]["share_tokens"]["Row"];
export type ShareTokenScope = "care_plan";
export type ShareTokenResourceType = "care_plan";

export type ShareTokenActorContext = AnonymousShareTokenActorContext<
  ShareTokenResourceType,
  ShareTokenScope
>;

export type CarePlanShareLinkState = {
  expiresAt: string | null;
  generatedAt: string | null;
  revokedAt: string | null;
  status: "not_generated" | "active" | "expired" | "revoked";
};

export type CarePlanShareLinkMutation = CarePlanShareLinkState & {
  token: string | null;
};

export const shareTokenScope: ShareTokenScope = "care_plan";
export const shareTokenResourceType: ShareTokenResourceType = "care_plan";
export const shareTokenTtlDays = 14;

export function createShareTokenSecret(): string {
  return createShareTokenCredential().secret;
}

export function createShareTokenExpiry(now = new Date()): string {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + shareTokenTtlDays);
  return expiresAt.toISOString();
}

export function isShareTokenHashMatch(secret: string, hash: string): boolean {
  return verifyShareTokenSecret(secret, hash);
}

export async function getCarePlanShareLinkState(
  planId: string
): Promise<ServiceResult<CarePlanShareLinkState>> {
  const contextResult = await getOwnerPlanShareContext(planId);

  if (!contextResult.ok) {
    return contextResult;
  }

  const tokenResult = await contextResult.data.client
    .from("share_tokens")
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .eq("owner_id", contextResult.data.ownerId)
    .eq("resource_type", shareTokenResourceType)
    .eq("resource_id", planId)
    .eq("scope", shareTokenScope)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenResult.error) {
    return mapSupabaseError(tokenResult.error);
  }

  return serviceOk(mapShareTokenState(tokenResult.data));
}

export async function createCarePlanShareLink(
  planId: string
): Promise<ServiceResult<CarePlanShareLinkMutation>> {
  const correlationId = randomUUID();
  const contextResult = await getOwnerPlanShareContext(planId);

  if (!contextResult.ok) {
    return contextResult;
  }

  if (contextResult.data.planStatus !== "published") {
    return serviceError(
      "validation_error",
      "Only published care plans can be shared."
    );
  }

  const now = new Date().toISOString();
  const revokeResult = await contextResult.data.client
    .from("share_tokens")
    .update({ revoked_at: now })
    .eq("owner_id", contextResult.data.ownerId)
    .eq("resource_type", shareTokenResourceType)
    .eq("resource_id", planId)
    .eq("scope", shareTokenScope)
    .is("revoked_at", null)
    .select("id, revoked_at");

  if (revokeResult.error) {
    return mapSupabaseError(revokeResult.error);
  }

  const credential = createShareTokenCredential();

  const insertResult = await contextResult.data.client
    .from("share_tokens")
    .insert({
      expires_at: createShareTokenExpiry(),
      owner_id: contextResult.data.ownerId,
      resource_id: planId,
      resource_type: shareTokenResourceType,
      scope: shareTokenScope,
      token_hash: credential.tokenHash
    })
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .single();

  if (insertResult.error) {
    return mapSupabaseError(insertResult.error);
  }

  for (const revokedToken of revokeResult.data ?? []) {
    void recordCatCareAuditEvent({
      actorType: "user",
      correlationId,
      eventName: "share_link_revoked",
      ownerId: contextResult.data.ownerId,
      properties: { revoked_at: revokedToken.revoked_at ?? now },
      resourceId: planId,
      resourceType: shareTokenResourceType,
      tokenRecordId: revokedToken.id
    });
  }

  void recordCatCareAuditEvent({
    actorType: "user",
    correlationId,
    eventName: "share_link_created",
    ownerId: contextResult.data.ownerId,
    properties: { expires_at: insertResult.data.expires_at },
    resourceId: planId,
    resourceType: shareTokenResourceType,
    tokenRecordId: insertResult.data.id
  });
  void trackCatCareProductEvent(
    contextResult.data.ownerId,
    "catcare_share_link_created",
    {
      result: (revokeResult.data?.length ?? 0) > 0 ? "updated" : "created"
    },
    {
      correlation_id: correlationId,
      request_source: "catcare_share_link",
      resource_id: planId,
      resource_type: shareTokenResourceType
    }
  );

  return serviceOk({
    ...mapShareTokenState(insertResult.data),
    token: credential.secret
  });
}

export async function revokeCarePlanShareLink(
  planId: string
): Promise<ServiceResult<CarePlanShareLinkMutation>> {
  const correlationId = randomUUID();
  const contextResult = await getOwnerPlanShareContext(planId);

  if (!contextResult.ok) {
    return contextResult;
  }

  const revokedAt = new Date().toISOString();
  const revokeResult = await contextResult.data.client
    .from("share_tokens")
    .update({ revoked_at: revokedAt })
    .eq("owner_id", contextResult.data.ownerId)
    .eq("resource_type", shareTokenResourceType)
    .eq("resource_id", planId)
    .eq("scope", shareTokenScope)
    .is("revoked_at", null)
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (revokeResult.error) {
    return mapSupabaseError(revokeResult.error);
  }

  if (revokeResult.data) {
    void recordCatCareAuditEvent({
      actorType: "user",
      correlationId,
      eventName: "share_link_revoked",
      ownerId: contextResult.data.ownerId,
      properties: { revoked_at: revokeResult.data.revoked_at ?? revokedAt },
      resourceId: planId,
      resourceType: shareTokenResourceType,
      tokenRecordId: revokeResult.data.id
    });
    void trackCatCareProductEvent(
      contextResult.data.ownerId,
      "catcare_share_link_revoked",
      { result: "success" },
      {
        correlation_id: correlationId,
        request_source: "catcare_share_link",
        resource_id: planId,
        resource_type: shareTokenResourceType
      }
    );
  }

  return serviceOk({
    ...mapShareTokenState(revokeResult.data),
    token: null
  });
}

export async function resolveCarePlanShareToken(
  secret: string,
  now = new Date(),
  correlationId = randomUUID()
): Promise<ServiceResult<ShareTokenActorContext>> {
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    const outcome = resolveShareTokenGate<
      ShareTokenResourceType,
      ShareTokenScope
    >({ now, record: null, secret });

    return outcome.status === "valid"
      ? hashResult
      : rejectShareTokenOutcome(outcome, correlationId);
  }

  const clientResult = createSupabaseAdminClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const tokenResult = await clientResult.data
    .from("share_tokens")
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .eq("token_hash", hashResult.data)
    .eq("resource_type", shareTokenResourceType)
    .eq("scope", shareTokenScope)
    .maybeSingle();

  if (tokenResult.error) {
    return mapSupabaseError(tokenResult.error);
  }

  const token = tokenResult.data;
  const outcome = resolveShareTokenGate({
    now,
    record: token
      ? {
          expiresAt: token.expires_at,
          ownerId: token.owner_id,
          resourceId: token.resource_id,
          resourceType: token.resource_type,
          revokedAt: token.revoked_at,
          scope: token.scope,
          tokenHash: token.token_hash,
          tokenId: token.id
        }
      : null,
    secret
  });

  if (outcome.status !== "valid") {
    return rejectShareTokenOutcome(outcome, correlationId);
  }

  const scopeResult = createAnonymousTokenScope(outcome.actor.tokenId);

  if (!scopeResult.ok) {
    return mapDbBoundaryError(scopeResult);
  }

  await clientResult.data
    .from("share_tokens")
    .update({ last_used_at: now.toISOString() })
    .eq("id", outcome.actor.tokenId);

  return serviceOk(outcome.actor);
}

function rejectShareTokenOutcome(
  outcome: RejectedShareTokenGateOutcome<
    ShareTokenResourceType,
    ShareTokenScope
  >,
  correlationId: string
): ServiceResult<never> {
  const actor = outcome.actor;
  const status = outcome.status;

  void recordCatCareAuditEvent({
    actorType: "anonymous_token",
    correlationId,
    eventName: "invalid_or_revoked_token_rejected",
    ownerId: actor?.ownerId,
    properties: { reason: status },
    resourceId: actor?.resourceId,
    resourceType: actor?.resourceType ?? shareTokenResourceType,
    tokenRecordId: actor?.tokenId
  });
  void trackCatCareProductEvent(
    "anonymous_token",
    "catcare_share_link_rejected",
    { outcome: status, result: "rejected" },
    {
      correlation_id: correlationId,
      request_source: "catcare_share_token",
      ...(actor?.resourceId ? { resource_id: actor.resourceId } : {}),
      resource_type: actor?.resourceType ?? shareTokenResourceType
    }
  );

  const messages = {
    expired: "Share link has expired.",
    invalid: "Share link is invalid.",
    revoked: "Share link has been revoked.",
    unavailable: "Care plan is no longer available."
  } as const;

  return serviceError(
    status === "invalid" ? "unauthorized" : "forbidden",
    messages[status],
    { token: status }
  );
}

async function getOwnerPlanShareContext(planId: string): Promise<
  ServiceResult<{
    client: AppSupabaseClient;
    ownerId: string;
    planStatus: Database["public"]["Tables"]["care_plans"]["Row"]["status"];
  }>
> {
  const normalizedPlanId = planId.trim();

  if (!normalizedPlanId) {
    return serviceError("validation_error", "Choose a care plan to share.");
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const planResult = await clientResult.data
    .from("care_plans")
    .select("id, owner_id, status")
    .eq("id", normalizedPlanId)
    .eq("owner_id", ownerResult.data)
    .single();

  if (planResult.error) {
    return mapSupabaseError(planResult.error);
  }

  return serviceOk({
    client: clientResult.data,
    ownerId: ownerResult.data,
    planStatus: planResult.data.status
  });
}

function mapShareTokenState(token: ShareTokenRow | null): CarePlanShareLinkState {
  if (!token) {
    return {
      expiresAt: null,
      generatedAt: null,
      revokedAt: null,
      status: "not_generated"
    };
  }

  if (token.revoked_at) {
    return {
      expiresAt: token.expires_at,
      generatedAt: token.created_at,
      revokedAt: token.revoked_at,
      status: "revoked"
    };
  }

  if (new Date(token.expires_at).getTime() <= Date.now()) {
    return {
      expiresAt: token.expires_at,
      generatedAt: token.created_at,
      revokedAt: null,
      status: "expired"
    };
  }

  return {
    expiresAt: token.expires_at,
    generatedAt: token.created_at,
    revokedAt: null,
    status: "active"
  };
}
