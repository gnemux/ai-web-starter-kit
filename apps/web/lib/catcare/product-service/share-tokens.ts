import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";
import { createAnonymousTokenScope } from "@xwlc/db";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import {
  getAuthenticatedOwnerId,
  mapDbBoundaryError,
  mapSupabaseError
} from "./core";

export type ShareTokenRow = Database["public"]["Tables"]["share_tokens"]["Row"];
export type ShareTokenScope = "care_plan";
export type ShareTokenResourceType = "care_plan";

export type ShareTokenActorContext = {
  actorType: "anonymous_token";
  ownerId: string;
  resourceId: string;
  resourceType: ShareTokenResourceType;
  scope: ShareTokenScope;
  tokenId: string;
};

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
  return randomBytes(32).toString("base64url");
}

export function hashShareTokenSecret(secret: string): ServiceResult<string> {
  const normalized = secret.trim();

  if (normalized.length < 32) {
    return serviceError("validation_error", "Share token is invalid.", {
      token: "invalid"
    });
  }

  return serviceOk(
    createHash("sha256").update(normalized, "utf8").digest("base64url")
  );
}

export function createShareTokenExpiry(now = new Date()): string {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + shareTokenTtlDays);
  return expiresAt.toISOString();
}

export function isShareTokenHashMatch(secret: string, hash: string): boolean {
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    return false;
  }

  const actual = Buffer.from(hashResult.data);
  const expected = Buffer.from(hash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
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
    .is("revoked_at", null);

  if (revokeResult.error) {
    return mapSupabaseError(revokeResult.error);
  }

  const token = createShareTokenSecret();
  const hashResult = hashShareTokenSecret(token);

  if (!hashResult.ok) {
    return hashResult;
  }

  const insertResult = await contextResult.data.client
    .from("share_tokens")
    .insert({
      expires_at: createShareTokenExpiry(),
      owner_id: contextResult.data.ownerId,
      resource_id: planId,
      resource_type: shareTokenResourceType,
      scope: shareTokenScope,
      token_hash: hashResult.data
    })
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .single();

  if (insertResult.error) {
    return mapSupabaseError(insertResult.error);
  }

  return serviceOk({
    ...mapShareTokenState(insertResult.data),
    token
  });
}

export async function revokeCarePlanShareLink(
  planId: string
): Promise<ServiceResult<CarePlanShareLinkMutation>> {
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

  return serviceOk({
    ...mapShareTokenState(revokeResult.data),
    token: null
  });
}

export async function resolveCarePlanShareToken(
  secret: string,
  now = new Date()
): Promise<ServiceResult<ShareTokenActorContext>> {
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    return hashResult;
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

  if (!tokenResult.data) {
    return serviceError("unauthorized", "Share link is invalid.", {
      token: "invalid"
    });
  }

  const token = tokenResult.data;

  if (token.revoked_at) {
    return serviceError("forbidden", "Share link has been revoked.", {
      token: "revoked"
    });
  }

  if (new Date(token.expires_at).getTime() <= now.getTime()) {
    return serviceError("forbidden", "Share link has expired.", {
      token: "expired"
    });
  }

  const scopeResult = createAnonymousTokenScope(token.id);

  if (!scopeResult.ok) {
    return mapDbBoundaryError(scopeResult);
  }

  await clientResult.data
    .from("share_tokens")
    .update({ last_used_at: now.toISOString() })
    .eq("id", token.id);

  return serviceOk({
    actorType: "anonymous_token",
    ownerId: token.owner_id,
    resourceId: token.resource_id,
    resourceType: token.resource_type,
    scope: token.scope,
    tokenId: token.id
  });
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
