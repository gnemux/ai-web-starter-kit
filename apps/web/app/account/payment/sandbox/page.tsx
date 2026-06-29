import { Button, ErrorState, Panel, StatusBadge } from "@xwlc/ui";
import {
  getBillingPlan,
  getBillingPrice,
  type BillingAllowance,
  type BillingFeatureKey,
  type BillingPlan
} from "@xwlc/core";

import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSandboxCheckoutState } from "@/lib/services/payment";
import type { Dictionary } from "@/lib/i18n";

import { completeSandboxCheckoutAction } from "../actions";
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
    failureUrl: getParam(params.failure_url),
    returnUrl: getParam(params.return_url)
  });

  return (
    <PaymentShell nextPath={buildCurrentPath("/account/payment/sandbox", params)}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
          <p className="text-sm font-medium text-cyan-700">
            {copy.account.payment.sandboxEyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
            {getCheckoutTitle(stateResult.ok ? stateResult.data.priceId : null, copy)}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {copy.account.payment.sandboxDescription}
          </p>
        </section>

        {!stateResult.ok ? (
          <ErrorState
            badgeLabel={copy.account.payment.statusNeedsReview}
            description={copy.account.payment.errorDescription}
            title={copy.account.payment.errorTitle}
          />
        ) : (
          <CheckoutCard
            checkoutSessionId={stateResult.data.checkoutSessionId}
            copy={copy}
            priceId={stateResult.data.priceId}
            returnUrl={stateResult.data.returnUrl}
          />
        )}
      </div>
    </PaymentShell>
  );
}

function CheckoutCard({
  checkoutSessionId,
  copy,
  priceId,
  returnUrl
}: {
  checkoutSessionId: string;
  copy: Dictionary;
  priceId: string;
  returnUrl: string;
}) {
  const price = getBillingPrice(priceId as never);
  const plan = price?.planId ? getBillingPlan(price.planId) : null;
  const isCreditPack = priceId === "ai_credit_pack_100k";

  return (
    <Panel>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={copy.account.payment.sandboxMode}
              status="in-progress"
            />
            <span className="text-sm font-medium text-slate-500">
              {copy.account.payment.entitlementSource}:{" "}
              {copy.account.payment.resultNoGrant}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">
            {isCreditPack
              ? copy.account.payment.creditCheckoutTitle
              : copy.account.payment.planCheckoutTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {copy.account.payment.sandboxActionDescription}
          </p>

          {plan ? (
            <PlanSummary copy={copy} plan={plan} />
          ) : price ? (
            <CreditSummary copy={copy} priceId={priceId} />
          ) : null}
        </div>

        <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">
            {copy.account.payment.price}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            {formatPrice(priceId)}
          </p>
          {price?.interval ? (
            <p className="mt-1 text-sm text-slate-500">/ {price.interval}</p>
          ) : null}
          <dl className="mt-5 grid gap-3 border-t border-slate-200 pt-4">
            <Fact
              label={copy.account.payment.priceId}
              value={priceId}
            />
            <Fact
              label={copy.account.payment.checkoutSession}
              value={checkoutSessionId}
            />
          </dl>
          <div className="mt-5 grid gap-2">
            <ResultForm
              checkoutSessionId={checkoutSessionId}
              label={copy.account.payment.confirmPayment}
              priceId={priceId}
              returnTo={returnUrl}
              status="success"
            />
            <ResultForm
              checkoutSessionId={checkoutSessionId}
              label={copy.account.payment.chooseCancel}
              priceId={priceId}
              returnTo={returnUrl}
              status="cancel"
              variant="secondary"
            />
          </div>
        </aside>
      </div>
    </Panel>
  );
}

function PlanSummary({
  copy,
  plan
}: {
  copy: Dictionary;
  plan: BillingPlan;
}) {
  const visibleFeatures: BillingFeatureKey[] = [
    "projects",
    "pages",
    "leads",
    "custom_domain",
    "ai_tokens",
  ];

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {visibleFeatures.map((featureKey) => (
        <div
          className="rounded-md border border-slate-200 bg-white p-3"
          key={featureKey}
        >
          <p className="text-sm font-medium text-slate-500">
            {copy.account.billing.features[featureKey]}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {formatAllowance(plan.entitlements[featureKey], copy)}
          </p>
        </div>
      ))}
    </div>
  );
}

function CreditSummary({
  copy,
  priceId
}: {
  copy: Dictionary;
  priceId: string;
}) {
  const price = getBillingPrice(priceId as never);

  return (
    <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">
        {copy.account.billing.creditAmount}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950">
        {formatNumber(price?.creditQuantity ?? 0)}{" "}
        {copy.account.billing.units.credit}
      </p>
    </div>
  );
}

function ResultForm({
  checkoutSessionId,
  label,
  priceId,
  returnTo,
  status,
  variant = "primary"
}: {
  checkoutSessionId: string;
  label: string;
  priceId: string;
  returnTo: string;
  status: "success" | "cancel" | "failure";
  variant?: "primary" | "secondary";
}) {
  return (
    <form action={completeSandboxCheckoutAction}>
      <input name="checkoutSessionId" type="hidden" value={checkoutSessionId} />
      <input name="priceId" type="hidden" value={priceId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <input name="status" type="hidden" value={status} />
      <Button className="w-full" type="submit" variant={variant}>{label}</Button>
    </form>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-xs font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCurrentPath(
  pathname: string,
  params: Record<string, string | string[] | undefined>
) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
      return;
    }

    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getCheckoutTitle(
  priceId: string | null,
  copy: ReturnType<typeof getDictionary>
) {
  if (priceId === "ai_credit_pack_100k") {
    return copy.account.payment.creditCheckoutTitle;
  }

  return copy.account.payment.planCheckoutTitle;
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

function formatAllowance(allowance: BillingAllowance, copy: Dictionary) {
  if (allowance.kind === "boolean") {
    return allowance.enabled
      ? copy.account.billing.enabled
      : copy.account.billing.disabled;
  }

  return `${formatNumber(allowance.quantity)} ${
    copy.account.billing.units[allowance.unit]
  }`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
