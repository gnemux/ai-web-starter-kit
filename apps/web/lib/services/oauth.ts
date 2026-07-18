import type { ServiceResult } from "@xwlc/core";

import { normalizeInternalReturnTo } from "./internal-return.ts";

export const SOCIAL_OAUTH_PROVIDERS = ["google", "apple"] as const;

export type SocialOAuthProvider = (typeof SOCIAL_OAUTH_PROVIDERS)[number];

type OAuthProviderError = {
  code?: string;
  message?: string;
  status?: number;
} | null;

type SocialOAuthUser = {
  email?: string;
  id: string;
  identities?: Array<{ provider?: string }> | null;
  user_metadata?: Record<string, unknown>;
};

export type SocialOAuthAuthClient = {
  exchangeCodeForSession(code: string): Promise<{
    data: { user: SocialOAuthUser | null };
    error: OAuthProviderError;
  }>;
  signInWithOAuth(input: {
    options: {
      redirectTo: string;
      skipBrowserRedirect: true;
    };
    provider: SocialOAuthProvider;
  }): Promise<{
    data: { url: string | null };
    error: OAuthProviderError;
  }>;
};

export type SocialOAuthSessionSwitchClient = {
  getSession(): Promise<{
    data: { session: { user: { id: string } } | null };
    error: OAuthProviderError;
  }>;
  signOut(input: { scope: "local" }): Promise<{
    error: OAuthProviderError;
  }>;
};

export type SocialOAuthCompletion = {
  displayNameCandidate: string | null;
  email: string;
  provider: SocialOAuthProvider;
  userId: string;
};

export function normalizeSocialOAuthProvider(
  value: FormDataEntryValue | string | null | undefined
): ServiceResult<SocialOAuthProvider> {
  const provider = String(value ?? "").trim().toLowerCase();

  if (provider === "google" || provider === "apple") {
    return oauthOk(provider);
  }

  return oauthError("validation_error", "Choose a supported sign-in provider.");
}

export function normalizeSocialOAuthStartInput(
  providerValue: FormDataEntryValue | null,
  nextValue: FormDataEntryValue | null
): ServiceResult<{ nextPath: string; provider: SocialOAuthProvider }> {
  const providerResult = normalizeSocialOAuthProvider(providerValue);

  if (!providerResult.ok) {
    return providerResult;
  }

  return oauthOk({
    nextPath: normalizeInternalReturnTo(String(nextValue ?? ""), "/catcare"),
    provider: providerResult.data
  });
}

export function normalizeSocialOAuthCode(
  value: string | null | undefined
): ServiceResult<string> {
  const code = String(value ?? "");

  if (
    code.length < 16 ||
    code.length > 2048 ||
    !/^[A-Za-z0-9._~-]+$/.test(code)
  ) {
    return oauthError(
      "validation_error",
      "The sign-in callback is invalid or has expired."
    );
  }

  return oauthOk(code);
}

export function buildSocialOAuthCallbackUrl(
  appUrl: string,
  provider: SocialOAuthProvider,
  nextPath: string
): ServiceResult<string> {
  let origin: URL;

  try {
    origin = new URL(appUrl);
  } catch {
    return oauthError("configuration_error", "Social sign-in is not configured.");
  }

  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password
  ) {
    return oauthError("configuration_error", "Social sign-in is not configured.");
  }

  const callback = new URL("/auth/oauth/callback", origin.origin);
  callback.searchParams.set("provider", provider);
  callback.searchParams.set(
    "next",
    normalizeInternalReturnTo(nextPath, "/catcare")
  );

  return oauthOk(callback.toString());
}

export async function startSocialOAuthWithAuth(
  auth: SocialOAuthAuthClient,
  input: { provider: SocialOAuthProvider; redirectTo: string }
): Promise<ServiceResult<{ provider: SocialOAuthProvider; url: string }>> {
  const { data, error } = await auth.signInWithOAuth({
    options: {
      redirectTo: input.redirectTo,
      skipBrowserRedirect: true
    },
    provider: input.provider
  });

  if (error || !isSafeProviderAuthorizeUrl(data.url)) {
    return oauthError(
      "system_error",
      "Social sign-in is temporarily unavailable."
    );
  }

  return oauthOk({ provider: input.provider, url: data.url });
}

export async function clearCurrentSessionForSocialOAuth(
  auth: SocialOAuthSessionSwitchClient
): Promise<ServiceResult<{ cleared: boolean }>> {
  const { data, error } = await auth.getSession();

  if (error) {
    return oauthError(
      "system_error",
      "Social sign-in is temporarily unavailable."
    );
  }

  if (!data.session) {
    return oauthOk({ cleared: false });
  }

  const { error: signOutError } = await auth.signOut({ scope: "local" });

  if (signOutError) {
    return oauthError(
      "system_error",
      "Social sign-in is temporarily unavailable."
    );
  }

  return oauthOk({ cleared: true });
}

export async function completeSocialOAuthWithAuth(
  auth: SocialOAuthAuthClient,
  input: { code: string; provider: SocialOAuthProvider }
): Promise<ServiceResult<SocialOAuthCompletion>> {
  const codeResult = normalizeSocialOAuthCode(input.code);

  if (!codeResult.ok) {
    return codeResult;
  }

  const { data, error } = await auth.exchangeCodeForSession(codeResult.data);
  const user = data.user;

  if (error || !user?.id || !hasExpectedProviderIdentity(user, input.provider)) {
    return oauthError(
      "unauthorized",
      "Social sign-in could not be completed. Start again from the login page."
    );
  }

  return oauthOk({
    displayNameCandidate:
      input.provider === "google"
        ? readBoundedDisplayName(user.user_metadata)
        : null,
    email: normalizeProviderEmail(user.email),
    provider: input.provider,
    userId: user.id
  });
}

function hasExpectedProviderIdentity(
  user: SocialOAuthUser,
  provider: SocialOAuthProvider
) {
  return (
    Array.isArray(user.identities) &&
    user.identities.some((identity) => identity.provider === provider)
  );
}

function isSafeProviderAuthorizeUrl(value: string | null): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

function normalizeProviderEmail(value: string | undefined) {
  const email = String(value ?? "").trim().toLowerCase();
  return email.length <= 254 ? email : "";
}

function readBoundedDisplayName(metadata: Record<string, unknown> | undefined) {
  for (const key of ["full_name", "name"]) {
    const value = metadata?.[key];
    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();
    if (normalized.length > 0 && normalized.length <= 80) {
      return normalized;
    }
  }

  return null;
}

function oauthOk<T>(data: T): ServiceResult<T> {
  return { data, ok: true };
}

function oauthError(
  code:
    | "configuration_error"
    | "system_error"
    | "unauthorized"
    | "validation_error",
  message: string
): ServiceResult<never> {
  return {
    error: { code, message },
    ok: false
  };
}
