import { redirect } from "next/navigation";

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

  redirect(returnTo?.startsWith("/account") ? returnTo : "/account");
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
