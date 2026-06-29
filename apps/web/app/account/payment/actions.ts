"use server";

import { redirect } from "next/navigation";

import {
  isBillingCheckoutPriceId,
  isPaymentCheckoutResultStatus,
  type ServiceResult
} from "@xwlc/core";

import {
  createPaymentCheckoutFromFormData,
  processSandboxCheckoutResult,
  reviewPaymentQuotaLimit
} from "@/lib/services/payment";

export type PaymentCheckoutActionState =
  | ServiceResult<{ redirectTo: string }>
  | null;

export async function startPaymentCheckoutAction(formData: FormData) {
  const result = await createPaymentCheckoutFromFormData(formData);

  if (result.ok) {
    redirect(result.data.redirectTo);
  }

  redirect("/account/payment?checkout_error=1");
}

export async function completeSandboxCheckoutAction(formData: FormData) {
  const checkoutSessionId = String(
    formData.get("checkoutSessionId") ?? ""
  ).trim();
  const priceId = String(formData.get("priceId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (
    !checkoutSessionId ||
    !isBillingCheckoutPriceId(priceId) ||
    !isPaymentCheckoutResultStatus(status)
  ) {
    redirect("/account/payment/result?status=failure");
  }

  const result = await processSandboxCheckoutResult({
    checkoutSessionId,
    priceId,
    returnTo,
    status
  });

  if (result.ok) {
    redirect(result.data.redirectTo);
  }

  console.error("Sandbox checkout confirmation failed", result.error);

  redirect(
    `/account/payment/result?status=failure&price_id=${encodeURIComponent(
      priceId
    )}&checkout_session_id=${encodeURIComponent(checkoutSessionId)}`
  );
}

export async function reviewPaymentQuotaLimitAction() {
  const result = await reviewPaymentQuotaLimit();

  if (!result.ok) {
    redirect("/account/payment?quota_review=error");
  }

  const params = new URLSearchParams({
    allowed: result.data.allowed ? "true" : "false",
    feature_key: result.data.featureKey,
    plan: result.data.planId,
    reason: result.data.reason,
    remaining:
      result.data.remaining === null ? "none" : String(result.data.remaining),
    requested: String(result.data.requestedQuantity),
    quota_review: "1"
  });

  redirect(`/account/payment?${params.toString()}`);
}
