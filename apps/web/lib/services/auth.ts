import {
  normalizeAuthCredentials,
  normalizeNextPath,
  normalizeUserProfileInput,
  serviceError,
  serviceOk,
  type AccountPayload,
  type AuthActionPayload,
  type AuthenticatedUser,
  type ServiceResult,
  type UpdateUserProfileInput,
  type UserProfile
} from "@xwlc/core";
import {
  requireVerifiedEmail,
  type PlatformActor,
  type PlatformResult
} from "@xwlc/platform";
import { cookies } from "next/headers";
import { cache } from "react";

import {
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../supabase/server";
import type { Database } from "../supabase/database.types";
import {
  buildPasswordRecoveryCallbackUrl,
  normalizePasswordResetRequest,
  normalizePasswordUpdate,
  requestPasswordResetWithAuth,
  updatePasswordWithAuth,
  type PasswordResetRequestPayload,
  type PasswordUpdatePayload
} from "./password-recovery";

type ProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];
type AuthVerificationError = Awaited<
  ReturnType<AppSupabaseClient["auth"]["verifyOtp"]>
>["error"];
type AuthEmailOtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";
type AuthConfirmationInput = {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  nextPath: string;
};

const profileCacheTtlMs = 5 * 60_000;
const profileCache = new Map<
  string,
  {
    expiresAt: number;
    value: UserProfile | null;
  }
>();

const EMAIL_OTP_TYPES = new Set<AuthEmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
]);

export const getCurrentAccount = cache(async function getCurrentAccount(): Promise<
  ServiceResult<AccountPayload>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const userResult = await getAuthenticatedUser();

  if (!userResult.ok) {
    return userResult;
  }

  const profileResult = await getProfileForUser(
    clientResult.data,
    userResult.data.id
  );

  if (!profileResult.ok) {
    return profileResult;
  }

  return serviceOk({
    user: userResult.data,
    profile: profileResult.data
  });
});

export const getCurrentUserClaims = cache(async function getCurrentUserClaims(): Promise<
  ServiceResult<{ email: string; id: string }>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const { data, error } = await clientResult.data.auth.getClaims();
  const claims = data?.claims as { sub?: string; email?: string } | undefined;

  if (error || !claims?.sub) {
    return serviceError("unauthorized", "Sign in to continue.");
  }

  return serviceOk({
    email: claims.email ?? "",
    id: claims.sub
  });
});

export async function getCurrentAccountForPublicShell(): Promise<
  AccountPayload | null
> {
  if (!(await hasSupabaseAuthCookie())) {
    return null;
  }

  const result = await withTimeout(getCurrentAccount(), 1200);

  return result?.ok ? result.data : null;
}

export async function signInWithPasswordFromFormData(
  formData: FormData
): Promise<ServiceResult<AuthActionPayload>> {
  const inputResult = normalizeAuthCredentials({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next")
  });

  if (!inputResult.ok) {
    return inputResult;
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const { data, error } = await clientResult.data.auth.signInWithPassword({
    email: inputResult.data.email,
    password: inputResult.data.password
  });

  if (error || !data.user) {
    return mapAuthError(error);
  }

  const actor = mapPlatformActor({
    id: data.user.id,
    email: data.user.email ?? inputResult.data.email,
    emailVerified: Boolean(data.user.email_confirmed_at)
  });
  const verifiedEmailResult = requireVerifiedEmail(actor);

  if (!verifiedEmailResult.ok) {
    await clientResult.data.auth.signOut();

    return mapPlatformAuthError(verifiedEmailResult);
  }

  const user = mapAuthUser({
    id: actor.id,
    email: actor.email ?? inputResult.data.email
  });
  const profileResult = await ensureAuthenticatedUserProfile(
    clientResult.data,
    user.id
  );

  if (!profileResult.ok) {
    return profileResult;
  }

  return serviceOk({
    status: "authenticated",
    user,
    redirectTo: inputResult.data.nextPath,
    message: "Signed in."
  });
}

export async function signUpWithPasswordFromFormData(
  formData: FormData
): Promise<ServiceResult<AuthActionPayload>> {
  const inputResult = normalizeAuthCredentials({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next")
  });

  if (!inputResult.ok) {
    return inputResult;
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const appUrlResult = getAuthAppUrl();

  if (!appUrlResult.ok) {
    return appUrlResult;
  }

  const { data, error } = await clientResult.data.auth.signUp({
    email: inputResult.data.email,
    password: inputResult.data.password,
    options: {
      emailRedirectTo: `${appUrlResult.data}/auth/confirm?next=/login`
    }
  });

  if (error || !data.user) {
    return mapAuthError(error);
  }

  if (isExistingEmailSignup(data.user, data.session)) {
    return serviceError(
      "conflict",
      "This email is already registered."
    );
  }

  const user = mapAuthUser({
    id: data.user.id,
    email: data.user.email ?? inputResult.data.email
  });

  if (data.session && data.user.email_confirmed_at) {
    const profileResult = await ensureAuthenticatedUserProfile(
      clientResult.data,
      user.id
    );

    if (!profileResult.ok) {
      return profileResult;
    }

    return serviceOk({
      status: "authenticated",
      user,
      redirectTo: inputResult.data.nextPath,
      message: "Account created."
    });
  }

  if (data.session) {
    await clientResult.data.auth.signOut();
  }

  return serviceOk({
    status: "confirmation_pending",
    user,
    redirectTo: "/login",
    message: "Check your email to confirm this account before signing in."
  });
}

export async function requestPasswordResetFromFormData(
  formData: FormData
): Promise<ServiceResult<PasswordResetRequestPayload>> {
  const inputResult = normalizePasswordResetRequest(
    formData.get("email"),
    formData.get("next")
  );

  if (!inputResult.ok) {
    return inputResult;
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const appUrlResult = getAuthAppUrl();

  if (!appUrlResult.ok) {
    return appUrlResult;
  }

  const callbackResult = buildPasswordRecoveryCallbackUrl(
    appUrlResult.data,
    inputResult.data.nextPath
  );

  if (!callbackResult.ok) {
    return callbackResult;
  }

  return requestPasswordResetWithAuth(
    clientResult.data.auth,
    inputResult.data.email,
    callbackResult.data
  );
}

export async function updateCurrentUserPasswordFromFormData(
  formData: FormData
): Promise<ServiceResult<PasswordUpdatePayload>> {
  const inputResult = normalizePasswordUpdate(
    formData.get("password"),
    formData.get("confirmPassword"),
    formData.get("next")
  );

  if (!inputResult.ok) {
    return inputResult;
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  return updatePasswordWithAuth(clientResult.data.auth, inputResult.data);
}

export async function signOutCurrentUser(): Promise<
  ServiceResult<AuthActionPayload>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const { error } = await clientResult.data.auth.signOut();

  if (error) {
    return mapAuthError(error);
  }

  return serviceOk({
    status: "authenticated",
    user: null,
    redirectTo: "/",
    message: "Signed out."
  });
}

export async function updateCurrentUserProfileFromFormData(
  formData: FormData
): Promise<ServiceResult<UserProfile>> {
  const inputResult = normalizeUserProfileInput({
    displayName: formData.get("displayName")
  });

  if (!inputResult.ok) {
    return inputResult;
  }

  return updateCurrentUserProfile(inputResult.data);
}

export async function updateCurrentUserProfile(
  input: UpdateUserProfileInput
): Promise<ServiceResult<UserProfile>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const userResult = await getAuthenticatedUser();

  if (!userResult.ok) {
    return userResult;
  }

  const { data, error } = await clientResult.data
    .from("user_profiles")
    .upsert({
      id: userResult.data.id,
      display_name: input.displayName
    })
    .select("id, display_name, avatar_url, created_at, updated_at")
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  const profile = mapProfile(data);
  writeProfileCache(userResult.data.id, profile);

  return serviceOk(profile);
}

export async function exchangeAuthConfirmationForSession(
  input: AuthConfirmationInput
): Promise<ServiceResult<{ redirectTo: string }>> {
  if (!input.code && !input.tokenHash) {
    return serviceError(
      "validation_error",
      "Missing Auth confirmation token."
    );
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  let authError: AuthVerificationError = null;

  if (input.code) {
    authError = (
      await clientResult.data.auth.exchangeCodeForSession(input.code)
    ).error;
  } else {
    const verifyResult = await verifyAuthTokenHash(
      clientResult.data,
      input.tokenHash,
      input.type
    );

    if (!verifyResult.ok) {
      return verifyResult;
    }

    authError = verifyResult.data;
  }

  if (authError) {
    return mapAuthError(authError);
  }

  const redirectTo = normalizeNextPath(input.nextPath);

  if (redirectTo === "/login") {
    await clientResult.data.auth.signOut();
  }

  return serviceOk({ redirectTo });
}

async function verifyAuthTokenHash(
  supabase: AppSupabaseClient,
  tokenHash: string | null,
  type: string | null
): Promise<ServiceResult<AuthVerificationError>> {
  const otpType = normalizeAuthEmailOtpType(type);

  if (!tokenHash || !otpType) {
    return serviceError(
      "validation_error",
      "Missing Auth confirmation token hash or type."
    );
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: otpType
  });

  return serviceOk(error);
}

function normalizeAuthEmailOtpType(type: string | null): AuthEmailOtpType | null {
  if (!type) {
    return null;
  }

  return EMAIL_OTP_TYPES.has(type as AuthEmailOtpType)
    ? (type as AuthEmailOtpType)
    : null;
}

async function getAuthenticatedUser(): Promise<ServiceResult<AuthenticatedUser>> {
  const claimsResult = await getCurrentUserClaims();

  if (!claimsResult.ok) {
    return claimsResult;
  }

  return serviceOk(mapAuthUser(claimsResult.data));
}

async function getProfileForUser(
  supabase: AppSupabaseClient,
  userId: string
): Promise<ServiceResult<UserProfile | null>> {
  const cachedProfile = readProfileCache(userId);

  if (cachedProfile !== undefined) {
    return serviceOk(cachedProfile);
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return mapSupabaseError(error);
  }

  const profile = data ? mapProfile(data) : null;
  writeProfileCache(userId, profile);

  return serviceOk(profile);
}

export async function ensureAuthenticatedUserProfile(
  supabase: AppSupabaseClient,
  userId: string,
  displayNameCandidate: string | null = null
): Promise<ServiceResult<UserProfile>> {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      id: userId
    })
    .select("id, display_name, avatar_url, created_at, updated_at")
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  let resolvedProfile = data;

  if (!data.display_name && displayNameCandidate) {
    const { data: updatedProfile, error: updateError } = await supabase
      .from("user_profiles")
      .update({ display_name: displayNameCandidate })
      .eq("id", userId)
      .is("display_name", null)
      .select("id, display_name, avatar_url, created_at, updated_at")
      .maybeSingle();

    if (updateError) {
      return mapSupabaseError(updateError);
    }

    resolvedProfile = updatedProfile ?? data;
  }

  const profile = mapProfile(resolvedProfile);
  writeProfileCache(userId, profile);

  return serviceOk(profile);
}

function readProfileCache(userId: string) {
  const entry = profileCache.get(userId);

  if (!entry || entry.expiresAt <= Date.now()) {
    profileCache.delete(userId);
    return undefined;
  }

  return entry.value;
}

function writeProfileCache(userId: string, value: UserProfile | null) {
  profileCache.set(userId, {
    expiresAt: Date.now() + profileCacheTtlMs,
    value
  });
}

function mapAuthUser(user: { id: string; email: string }): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email
  };
}

function mapPlatformActor(input: {
  id: string;
  email: string;
  emailVerified: boolean;
}): PlatformActor {
  return {
    id: input.id,
    type: "user",
    email: input.email,
    emailVerified: input.emailVerified
  };
}

function mapPlatformAuthError(
  result: Extract<PlatformResult<unknown>, { ok: false }>
): ServiceResult<never> {
  if (result.code === "email_verification_required") {
    return serviceError(
      "forbidden",
      "Confirm this email before signing in."
    );
  }

  return serviceError("forbidden", result.message);
}

function isExistingEmailSignup(
  user: { identities?: unknown[] } | null,
  session: unknown
) {
  return (
    !session &&
    Array.isArray(user?.identities) &&
    user.identities.length === 0
  );
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAuthError(
  error: { status?: number; code?: string; message?: string } | null
) {
  if (error?.status === 429 || error?.code === "over_email_send_rate_limit") {
    return serviceError(
      "system_error",
      "Too many attempts. Please wait a moment and try again."
    );
  }

  if (isEmailNotConfirmedError(error)) {
    return serviceError(
      "forbidden",
      "Confirm this email before signing in."
    );
  }

  return serviceError(
    "unauthorized",
    "The email or password could not be verified."
  );
}

function isEmailNotConfirmedError(
  error: { code?: string; message?: string } | null
) {
  const code = error?.code?.toLowerCase() ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  return (
    code.includes("email_not_confirmed") ||
    code.includes("email_not_confirm") ||
    message.includes("email not confirmed") ||
    message.includes("email is not confirmed")
  );
}

function mapSupabaseError(error: { code?: string }): ServiceResult<never> {
  if (error.code === "42501") {
    return serviceError(
      "forbidden",
      "This account does not have access to that data."
    );
  }

  if (error.code === "23505") {
    return serviceError("conflict", "A matching record already exists.");
  }

  return serviceError(
    "system_error",
    "The account service is temporarily unavailable."
  );
}

export function getAuthAppUrl(): ServiceResult<string> {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const requiresPublicUrl =
    appEnv === "production" || appEnv === "preview" || process.env.VERCEL === "1";

  if (
    requiresPublicUrl &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(appUrl)
  ) {
    return serviceError(
      "configuration_error",
      "Production Auth confirmation URL is not configured."
    );
  }

  return serviceOk(appUrl);
}

async function hasSupabaseAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();

  return cookieStore.getAll().some(({ name }) => {
    return name.startsWith("sb-") && name.includes("auth-token");
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      () => {
        clearTimeout(timeout);
        resolve(null);
      }
    );
  });
}
