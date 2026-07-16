"use server";

import { redirect } from "next/navigation";

import { exchangeAuthConfirmationForSession } from "@/lib/services/auth";
import { normalizeInternalReturnTo } from "@/lib/services/internal-return";
import { normalizeRecoveryTokenHash } from "@/lib/services/password-recovery";

export type RecoveryContinuationState =
  | {
      error: {
        code: "invalid_recovery";
        message: string;
      };
      ok: false;
    }
  | null;

export async function continuePasswordRecoveryAction(
  _previousState: RecoveryContinuationState,
  formData: FormData
): Promise<RecoveryContinuationState> {
  const tokenResult = normalizeRecoveryTokenHash(formData.get("tokenHash"));

  if (!tokenResult.ok) {
    return recoveryFailure();
  }

  const nextPath = normalizeInternalReturnTo(
    String(formData.get("next") ?? ""),
    "/catcare"
  );
  const passwordPath = `/account/password?next=${encodeURIComponent(nextPath)}`;
  const result = await exchangeAuthConfirmationForSession({
    code: null,
    nextPath: passwordPath,
    tokenHash: tokenResult.data,
    type: "recovery"
  });

  if (!result.ok) {
    return recoveryFailure();
  }

  redirect(result.data.redirectTo);
}

function recoveryFailure(): Exclude<RecoveryContinuationState, null> {
  return {
    error: {
      code: "invalid_recovery",
      message: "Request a fresh password reset email and try again."
    },
    ok: false
  };
}
