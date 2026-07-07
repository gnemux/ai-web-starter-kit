import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";
import { createAnonymousTokenScope } from "@xwlc/db";

import { createSupabaseAdminClient } from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import { mapDbBoundaryError, mapSupabaseError } from "./core";

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
