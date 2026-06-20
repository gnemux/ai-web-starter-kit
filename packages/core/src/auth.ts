import { serviceError, serviceOk, type ServiceResult } from "./api";
import type { UserProfile } from "./data";

export type AuthMode = "signin" | "signup";

export type AuthCredentialsInput = {
  email: string;
  password: string;
  nextPath: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type AccountPayload = {
  user: AuthenticatedUser;
  profile: UserProfile | null;
};

export type AuthActionStatus = "authenticated" | "confirmation_pending";

export type AuthActionPayload = {
  status: AuthActionStatus;
  user: AuthenticatedUser | null;
  redirectTo: string;
  message: string;
};

export type UpdateUserProfileInput = {
  displayName: string | null;
};

export type AuthAnalyticsEvent =
  | "signup_started"
  | "user_signed_up"
  | "login_started"
  | "user_logged_in"
  | "auth_login_failed"
  | "user_logged_out"
  | "user_profile_updated";

export type AnalyticsBaseProperties = {
  app: string;
  mvp_stage: string;
  market: "overseas" | "china";
  env: "local" | "preview" | "production";
  version: string;
  module: "auth";
};

export type AuthAnalyticsProperties = {
  auth_provider: "supabase";
  auth_method?: "password";
  result?: "success" | "failure" | "pending_confirmation";
  error_category?: "validation_error" | "provider_error" | "rate_limited";
  next_path?: string;
  has_display_name?: boolean;
};

export function normalizeAuthCredentials(
  input: Record<string, FormDataEntryValue | null | undefined>
): ServiceResult<AuthCredentialsInput> {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const nextPath = normalizeNextPath(String(input.next ?? "/dashboard"));
  const fields: Record<string, string> = {};

  if (!isValidEmail(email)) {
    fields.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    fields.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(fields).length > 0) {
    return serviceError(
      "validation_error",
      "Please review the highlighted fields.",
      fields
    );
  }

  return serviceOk({
    email,
    password,
    nextPath
  });
}

export function normalizeUserProfileInput(
  input: Record<string, FormDataEntryValue | null | undefined>
): ServiceResult<UpdateUserProfileInput> {
  const displayNameValue = String(input.displayName ?? "").trim();
  const fields: Record<string, string> = {};

  if (displayNameValue.length > 80) {
    fields.displayName = "Display name must be 80 characters or fewer.";
  }

  if (Object.keys(fields).length > 0) {
    return serviceError(
      "validation_error",
      "Please review the highlighted fields.",
      fields
    );
  }

  return serviceOk({
    displayName: displayNameValue.length > 0 ? displayNameValue : null
  });
}

export function normalizeNextPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function isValidEmail(value: string): boolean {
  if (value.length < 3 || value.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
