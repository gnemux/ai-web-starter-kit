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
} from "@starter/core";

import {
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../supabase/server";
import type { Database } from "../supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export async function getCurrentAccount(): Promise<
  ServiceResult<AccountPayload>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const userResult = await getAuthenticatedUser(clientResult.data);

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

  const user = mapAuthUser({
    id: data.user.id,
    email: data.user.email ?? inputResult.data.email
  });
  const profileResult = await ensureProfile(clientResult.data, user.id);

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

  const { data, error } = await clientResult.data.auth.signUp({
    email: inputResult.data.email,
    password: inputResult.data.password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/confirm?next=${encodeURIComponent(
        inputResult.data.nextPath
      )}`
    }
  });

  if (error || !data.user) {
    return mapAuthError(error);
  }

  const user = mapAuthUser({
    id: data.user.id,
    email: data.user.email ?? inputResult.data.email
  });

  if (data.session) {
    const profileResult = await ensureProfile(clientResult.data, user.id);

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

  return serviceOk({
    status: "confirmation_pending",
    user,
    redirectTo: "/login",
    message: "Check your email to confirm this account before signing in."
  });
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
    redirectTo: "/login",
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

  const userResult = await getAuthenticatedUser(clientResult.data);

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

  return serviceOk(mapProfile(data));
}

export async function exchangeAuthCodeForSession(
  code: string | null,
  nextPath: string
): Promise<ServiceResult<{ redirectTo: string }>> {
  if (!code) {
    return serviceError("validation_error", "Missing Auth confirmation code.");
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const { error } = await clientResult.data.auth.exchangeCodeForSession(code);

  if (error) {
    return mapAuthError(error);
  }

  return serviceOk({
    redirectTo: normalizeNextPath(nextPath)
  });
}

async function getAuthenticatedUser(
  supabase: AppSupabaseClient
): Promise<ServiceResult<AuthenticatedUser>> {
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string; email?: string } | undefined;

  if (error || !claims?.sub) {
    return serviceError("unauthorized", "Sign in to continue.");
  }

  const { data: userData } = await supabase.auth.getUser();

  return serviceOk(
    mapAuthUser({
      id: claims.sub,
      email: userData.user?.email ?? claims.email ?? ""
    })
  );
}

async function getProfileForUser(
  supabase: AppSupabaseClient,
  userId: string
): Promise<ServiceResult<UserProfile | null>> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk(data ? mapProfile(data) : null);
}

async function ensureProfile(
  supabase: AppSupabaseClient,
  userId: string
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

  return serviceOk(mapProfile(data));
}

function mapAuthUser(user: { id: string; email: string }): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email
  };
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

function mapAuthError(error: { status?: number; code?: string } | null) {
  if (error?.status === 429 || error?.code === "over_email_send_rate_limit") {
    return serviceError(
      "system_error",
      "Too many attempts. Please wait a moment and try again."
    );
  }

  return serviceError(
    "unauthorized",
    "The email or password could not be verified."
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

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}
