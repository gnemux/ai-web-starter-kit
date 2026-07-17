import "server-only";

import {
  serviceError,
  serviceOk,
  type ServiceResult
} from "@xwlc/core";

import { getSupabasePublicConfig } from "../supabase/config";
import type { SocialOAuthProvider } from "./oauth";

const providerSettingsCacheTtlMs = 5 * 60_000;
const providerSettingsCache = new Map<
  SocialOAuthProvider,
  { enabled: boolean; expiresAt: number }
>();

export async function getSocialOAuthProviderAvailability(
  provider: SocialOAuthProvider
): Promise<ServiceResult<boolean>> {
  const cached = providerSettingsCache.get(provider);
  if (cached && cached.expiresAt > Date.now()) {
    return serviceOk(cached.enabled);
  }

  const configResult = getSupabasePublicConfig();
  if (!configResult.ok) {
    return configResult;
  }

  let settingsUrl: URL;
  try {
    settingsUrl = new URL("/auth/v1/settings", configResult.data.url);
  } catch {
    return serviceError(
      "configuration_error",
      "Social sign-in is not configured."
    );
  }

  try {
    const response = await fetch(settingsUrl, {
      cache: "no-store",
      headers: { apikey: configResult.data.publishableKey },
      signal: AbortSignal.timeout(1_500)
    });

    if (!response.ok) {
      return providerSettingsError();
    }

    const payload = (await response.json()) as {
      external?: Record<string, unknown>;
    };
    const enabled = payload.external?.[provider] === true;
    providerSettingsCache.set(provider, {
      enabled,
      expiresAt: Date.now() + providerSettingsCacheTtlMs
    });

    return serviceOk(enabled);
  } catch {
    return providerSettingsError();
  }
}

function providerSettingsError(): ServiceResult<never> {
  return serviceError(
    "system_error",
    "Social sign-in availability could not be verified."
  );
}
