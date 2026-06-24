import { redirect } from "next/navigation";

import type { ServiceErrorCode } from "@starter/core";

import { createPaymentCheckout } from "@/lib/services/payment";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentCheckoutPage({
  searchParams
}: CheckoutPageProps) {
  const params = await searchParams;
  const priceId = getParam(params.price_id);
  const returnTo = getParam(params.return_to);
  const result = await createPaymentCheckout(priceId ?? "", { returnTo });

  if (result.ok) {
    redirect(result.data.redirectTo);
  }

  redirect(buildCheckoutErrorRedirect(returnTo, mapCheckoutErrorCode(result.error.code)));
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCheckoutErrorRedirect(
  returnTo: string | undefined,
  code: "configuration" | "unavailable" | "unsupported_price"
) {
  const fallbackPath = "/account";
  const safeReturnTo = returnTo?.startsWith("/account") ? returnTo : fallbackPath;
  const [pathname, search = ""] = safeReturnTo.split("?");
  const params = new URLSearchParams(search);

  params.set("checkout_result", "error");
  params.set("checkout_error", code);

  return `${pathname}?${params.toString()}`;
}

function mapCheckoutErrorCode(
  code: ServiceErrorCode
): "configuration" | "unavailable" | "unsupported_price" {
  if (code === "configuration_error") {
    return "configuration";
  }

  if (code === "validation_error") {
    return "unsupported_price";
  }

  return "unavailable";
}
