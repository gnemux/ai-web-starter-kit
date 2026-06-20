"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AuthActionPayload, ServiceResult, UserProfile } from "@starter/core";

import {
  signOutCurrentUser,
  updateCurrentUserProfileFromFormData
} from "@/lib/services/auth";

export type ProfileFormState = ServiceResult<UserProfile> | null;
export type SignOutState = ServiceResult<AuthActionPayload> | null;

export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const result = await updateCurrentUserProfileFromFormData(formData);

  if (result.ok) {
    revalidatePath("/account");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function signOutAction(
  _previousState: SignOutState,
  _formData: FormData
): Promise<SignOutState> {
  const result = await signOutCurrentUser();

  if (result.ok) {
    revalidatePath("/");
    redirect(result.data.redirectTo);
  }

  return result;
}
