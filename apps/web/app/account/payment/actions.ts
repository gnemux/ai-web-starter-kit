"use server";

import { redirect } from "next/navigation";

import type { ServiceResult } from "@starter/core";

import { createPaymentCheckoutFromFormData } from "@/lib/services/payment";

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
