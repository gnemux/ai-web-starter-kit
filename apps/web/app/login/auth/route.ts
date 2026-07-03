import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import type { AuthActionPayload, AuthMode, ServiceResult } from "@xwlc/core";

import {
  signInWithPasswordFromFormData,
  signUpWithPasswordFromFormData
} from "@/lib/services/auth";

import type { AuthFormState } from "../actions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const mode = String(formData.get("mode") ?? "signin") as AuthMode;
  const result: ServiceResult<AuthActionPayload> =
    mode === "signup"
      ? await signUpWithPasswordFromFormData(formData)
      : await signInWithPasswordFromFormData(formData);

  if (result.ok && result.data.status === "authenticated") {
    revalidatePath("/dashboard");
    revalidatePath("/account");
    revalidatePath("/catcare");
  }

  const state: AuthFormState = {
    mode,
    result
  };

  return NextResponse.json(state);
}
