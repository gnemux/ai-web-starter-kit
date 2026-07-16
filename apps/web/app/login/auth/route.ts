import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import type { AuthActionPayload, ServiceResult } from "@xwlc/core";

import {
  requestPasswordResetFromFormData,
  signInWithPasswordFromFormData,
  signUpWithPasswordFromFormData
} from "@/lib/services/auth";

import type { AuthFormState } from "../actions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const requestedMode = String(formData.get("mode") ?? "signin");
  const mode = requestedMode === "signup" ? "signup" : "signin";

  if (requestedMode === "reset") {
    const state: AuthFormState = {
      mode: "reset",
      result: await requestPasswordResetFromFormData(formData)
    };

    return NextResponse.json(state);
  }

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
