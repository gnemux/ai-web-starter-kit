"use server";

import { revalidatePath } from "next/cache";

import type { AuthActionPayload, AuthMode, ServiceResult } from "@xwlc/core";

import {
  signInWithPasswordFromFormData,
  signUpWithPasswordFromFormData
} from "@/lib/services/auth";

export type AuthFormState = {
  mode: AuthMode;
  result: ServiceResult<AuthActionPayload>;
} | null;

export async function submitAuthAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const mode = String(formData.get("mode") ?? "signin") as AuthMode;
  const result =
    mode === "signup"
      ? await signUpWithPasswordFromFormData(formData)
      : await signInWithPasswordFromFormData(formData);

  if (result.ok && result.data.status === "authenticated") {
    revalidatePath("/dashboard");
    revalidatePath("/account");
  }

  return {
    mode,
    result
  };
}
