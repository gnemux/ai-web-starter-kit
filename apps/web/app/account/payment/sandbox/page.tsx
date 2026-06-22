import { Button, ErrorState, Panel, SectionHeader, StatusBadge } from "@starter/ui";
import { getBillingPrice } from "@starter/core";

import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSandboxCheckoutState } from "@/lib/services/payment";

import { PaymentShell } from "../payment-shell";

type SandboxPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SandboxPaymentPage({
  searchParams
}: SandboxPageProps) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const stateResult = getSandboxCheckoutState({
    checkoutSessionId: getParam(params.checkout_session_id),
    priceId: getParam(params.price_id),
    planId: getParam(params.plan_id),
    successUrl: getParam(params.success_url),
    cancelUrl: getParam(params.cancel_url),
    failureUrl: getParam(params.failure_url)
  });

  return (
    <PaymentShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
          <p className="text-sm font-medium text-cyan-700">
            {copy.account.payment.sandboxEyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
            {copy.account.payment.sandboxTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {copy.account.payment.sandboxDescription}
          </p>
        </section>

        {!stateResult.ok ? (
          <ErrorState
            badgeLabel={copy.account.payment.statusNeedsReview}
            description={stateResult.error.message}
            title={copy.account.payment.errorTitle}
          />
        ) : (
          <Panel>
            <SectionHeader
              action={
                <StatusBadge
                  label={copy.account.payment.sandboxMode}
                  status="in-progress"
                />
              }
              description={copy.account.payment.sandboxActionDescription}
              title={copy.account.payment.sandboxActionTitle}
            />
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <Fact
                label={copy.account.payment.checkoutSession}
                value={stateResult.data.checkoutSessionId}
              />
              <Fact
                label={copy.account.payment.priceId}
                value={stateResult.data.priceId}
              />
              <Fact
                label={copy.account.payment.price}
                value={formatPrice(stateResult.data.priceId)}
              />
              <Fact
                label={copy.account.payment.entitlementSource}
                value={copy.account.payment.resultNoGrant}
              />
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={stateResult.data.successUrl}>
                {copy.account.payment.chooseSuccess}
              </Button>
              <Button href={stateResult.data.cancelUrl} variant="secondary">
                {copy.account.payment.chooseCancel}
              </Button>
              <Button href={stateResult.data.failureUrl} variant="secondary">
                {copy.account.payment.chooseFailure}
              </Button>
            </div>
          </Panel>
        )}
      </div>
    </PaymentShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPrice(priceId: string) {
  const price = getBillingPrice(priceId as never);

  if (!price) {
    return priceId;
  }

  return new Intl.NumberFormat("en-US", {
    currency: price.currency.toUpperCase(),
    style: "currency"
  }).format(price.amountCents / 100);
}
