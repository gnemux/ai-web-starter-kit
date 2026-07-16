"use server";

import type { ServiceResult } from "@xwlc/core";

import { updateCurrentUserPasswordFromFormData } from "@/lib/services/auth";
import type { PasswordUpdatePayload } from "@/lib/services/password-recovery";

export type PasswordUpdateState = ServiceResult<PasswordUpdatePayload> | null;

export async function updatePasswordAction(
  _previousState: PasswordUpdateState,
  formData: FormData
): Promise<PasswordUpdateState> {
  return updateCurrentUserPasswordFromFormData(formData);
}
