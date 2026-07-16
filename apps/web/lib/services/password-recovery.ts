import type { ServiceResult } from "@xwlc/core";

import { normalizeInternalReturnTo } from "./internal-return.ts";

export type PasswordResetRequestInput = {
  email: string;
  nextPath: string;
};

export type PasswordUpdateInput = {
  nextPath: string;
  password: string;
};

export type PasswordResetRequestPayload = {
  message: string;
  status: "reset_requested";
};

export type PasswordUpdatePayload = {
  message: string;
  nextPath: string;
};

type PasswordRecoveryProviderError = {
  code?: string;
  message?: string;
  status?: number;
} | null;

export type PasswordRecoveryAuthClient = {
  getUser(): Promise<{
    data: { user: { id: string } | null };
    error: PasswordRecoveryProviderError;
  }>;
  resetPasswordForEmail(
    email: string,
    options: { redirectTo: string }
  ): Promise<{ error: PasswordRecoveryProviderError }>;
  updateUser(input: {
    password: string;
  }): Promise<{ error: PasswordRecoveryProviderError }>;
};

export function normalizePasswordResetRequest(
  emailValue: FormDataEntryValue | null,
  nextValue: FormDataEntryValue | null
): ServiceResult<PasswordResetRequestInput> {
  const email = String(emailValue ?? "").trim().toLowerCase();
  const nextPath = normalizeInternalReturnTo(String(nextValue ?? ""), "/catcare");

  if (!isValidEmail(email)) {
    return recoveryError(
      "validation_error",
      "Enter a valid email address.",
      { email: "invalid" }
    );
  }

  return recoveryOk({ email, nextPath });
}

export function normalizePasswordUpdate(
  passwordValue: FormDataEntryValue | null,
  confirmationValue: FormDataEntryValue | null,
  nextValue: FormDataEntryValue | null
): ServiceResult<PasswordUpdateInput> {
  const password = String(passwordValue ?? "");
  const confirmation = String(confirmationValue ?? "");
  const nextPath = normalizeInternalReturnTo(String(nextValue ?? ""), "/catcare");
  const fields: Record<string, string> = {};

  if (password.length < 8) {
    fields.password = "too_short";
  }

  if (confirmation !== password) {
    fields.confirmPassword = "mismatch";
  }

  if (Object.keys(fields).length > 0) {
    return recoveryError(
      "validation_error",
      "Review the highlighted password fields.",
      fields
    );
  }

  return recoveryOk({ nextPath, password });
}

export function buildPasswordRecoveryCallbackUrl(
  appUrl: string,
  nextPath: string
): ServiceResult<string> {
  let origin: URL;

  try {
    origin = new URL(appUrl);
  } catch {
    return recoveryError("configuration_error", "The Auth callback URL is invalid.");
  }

  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password
  ) {
    return recoveryError("configuration_error", "The Auth callback URL is invalid.");
  }

  const safeNextPath = normalizeInternalReturnTo(nextPath, "/catcare");
  const passwordPath = new URL("/account/password", origin.origin);
  passwordPath.searchParams.set("next", safeNextPath);

  const callback = new URL("/auth/confirm", origin.origin);
  callback.searchParams.set(
    "next",
    `${passwordPath.pathname}${passwordPath.search}`
  );

  return recoveryOk(callback.toString());
}

export async function requestPasswordResetWithAuth(
  auth: PasswordRecoveryAuthClient,
  email: string,
  redirectTo: string
): Promise<ServiceResult<PasswordResetRequestPayload>> {
  const { error } = await auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return mapPasswordRecoveryProviderError(error);
  }

  return recoveryOk({
    message: "If that account exists, a password reset email is on its way.",
    status: "reset_requested"
  });
}

export async function updatePasswordWithAuth(
  auth: PasswordRecoveryAuthClient,
  input: PasswordUpdateInput
): Promise<ServiceResult<PasswordUpdatePayload>> {
  const { data, error: userError } = await auth.getUser();

  if (userError || !data.user) {
    return recoveryError(
      "unauthorized",
      "Request a fresh password reset link and try again."
    );
  }

  const { error } = await auth.updateUser({ password: input.password });

  if (error) {
    return mapPasswordRecoveryProviderError(error);
  }

  return recoveryOk({
    message: "Password updated.",
    nextPath: input.nextPath
  });
}

function recoveryOk<T>(data: T): ServiceResult<T> {
  return { data, ok: true };
}

function recoveryError(
  code:
    | "configuration_error"
    | "system_error"
    | "unauthorized"
    | "validation_error",
  message: string,
  fields?: Record<string, string>
): ServiceResult<never> {
  return {
    error: {
      code,
      fields,
      message
    },
    ok: false
  };
}

function mapPasswordRecoveryProviderError(
  error: PasswordRecoveryProviderError
): ServiceResult<never> {
  if (error?.status === 429 || error?.code === "over_email_send_rate_limit") {
    return recoveryError(
      "system_error",
      "Too many attempts. Wait a moment and try again."
    );
  }

  return recoveryError(
    "system_error",
    "Password recovery is temporarily unavailable."
  );
}

function isValidEmail(value: string) {
  return (
    value.length >= 3 &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}
