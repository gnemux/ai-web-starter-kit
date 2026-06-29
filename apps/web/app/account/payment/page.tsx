import {
  Badge,
  Button,
  ErrorState,
  Panel,
  SectionHeader,
  StatusBadge
} from "@xwlc/ui";
import {
  defaultBillingPlans,
  compareBillingPlans,
  type BillingAllowance,
  type BillingPlanId,
  type PaymentCheckoutOption
} from "@xwlc/core";

import type { Dictionary } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPaymentPageState } from "@/lib/services/payment";

import { startPaymentCheckoutAction } from "./actions";
import { PaymentShell } from "./payment-shell";

export default async function PaymentPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const stateResult = await getPaymentPageState();

  return (
    <PaymentShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
          <p className="text-sm font-medium text-cyan-700">
            {copy.account.payment.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
            {copy.account.payment.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {copy.account.payment.description}
          </p>
        </section>

        {!stateResult.ok ? (
          <ErrorState
            badgeLabel={copy.account.payment.statusNeedsReview}
            description={stateResult.error.message}
            title={copy.account.payment.errorTitle}
          />
        ) : (
          <>
            <Panel>
              <SectionHeader
                action={
                  <StatusBadge
                    label={copy.account.payment.statusReady}
                    status="ready"
                  />
                }
                description={copy.account.payment.providerDescription}
                title={copy.account.payment.providerTitle}
              />
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <Fact
                  label={copy.account.payment.provider}
                  value={stateResult.data.provider}
                />
                <Fact
                  label={copy.account.payment.mode}
                  value={formatPaymentMode(stateResult.data, copy)}
                />
                <Fact
                  label={copy.account.payment.entitlementSource}
                  value={copy.account.payment.billingFacts}
                />
              </dl>
            </Panel>

            <div className="grid gap-4 lg:grid-cols-2">
              {stateResult.data.checkoutOptions.map((option) => (
                <CheckoutOptionCard
                  currentPlanId={
                    stateResult.data.billing.ok
                      ? stateResult.data.billing.data.planId
                      : undefined
                  }
                  key={option.price.id}
                  labels={copy.account.payment}
                  option={option}
                />
              ))}
            </div>

            <Panel>
              <SectionHeader
                description={copy.account.payment.currentBillingDescription}
                title={copy.account.payment.currentBillingTitle}
              />
              {stateResult.data.billing.ok ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Fact
                    label={copy.account.billing.currentPlan}
                    value={
                      copy.account.billing.planNames[
                        stateResult.data.billing.data.planId
                      ]
                    }
                  />
                  <Fact
                    label={copy.account.billing.entitlements}
                    value={formatAllowance(
                      stateResult.data.billing.data.entitlements.ai_tokens,
                      copy.account.billing
                    )}
                  />
                </div>
              ) : (
                <div className="mt-5">
                  <ErrorState
                    badgeLabel={copy.account.billing.statusNeedsReview}
                    description={stateResult.data.billing.error.message}
                    title={copy.account.billing.errorTitle}
                  />
                </div>
              )}
            </Panel>
          </>
        )}
      </div>
    </PaymentShell>
  );
}

function formatPaymentMode(
  state: {
    mode: string;
    provider: string;
  },
  copy: Dictionary
) {
  if (state.provider === "creem" && state.mode === "real") {
    return copy.account.payment.realAdapterTestModeOnly;
  }

  return state.mode;
}

function CheckoutOptionCard({
  currentPlanId,
  labels,
  option
}: {
  currentPlanId?: BillingPlanId;
  labels: Dictionary["account"]["payment"];
  option: PaymentCheckoutOption;
}) {
  const plan = option.price.planId
    ? defaultBillingPlans.find((item) => item.id === option.price.planId)
    : null;
  const isCurrentPlan =
    option.checkoutKind === "subscription" &&
    option.price.planId === currentPlanId;
  const isIncludedLowerPlan =
    option.checkoutKind === "subscription" &&
    option.price.planId !== null &&
    currentPlanId !== undefined &&
    compareBillingPlans(option.price.planId, currentPlanId) < 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">
            {plan?.name ?? labels.creditPackName}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {option.checkoutKind === "subscription"
              ? labels.subscriptionDescription
              : labels.creditPackDescription}
          </p>
        </div>
        <Badge tone={option.checkoutKind === "subscription" ? "ready" : "planned"}>
          {option.checkoutKind === "subscription"
            ? labels.subscription
            : labels.creditPack}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Fact label={labels.priceId} value={option.price.id} />
        <Fact label={labels.price} value={formatMoney(option.price.amountCents)} />
        <Fact
          label={labels.providerMapping}
          value={option.price.providerPriceId ?? labels.sandboxOnly}
        />
      </dl>

      {isCurrentPlan || isIncludedLowerPlan ? (
        <div className="mt-4">
          <StatusBadge
            label={
              isCurrentPlan
                ? labels.currentPlanSelected
                : labels.includedInCurrentPlan
            }
            status="ready"
          />
        </div>
      ) : (
        <form action={startPaymentCheckoutAction} className="mt-4">
          <input name="priceId" type="hidden" value={option.price.id} />
          <input name="returnTo" type="hidden" value="/account/payment" />
          <Button type="submit">{labels.startCheckout}</Button>
        </form>
      )}
    </section>
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

function formatAllowance(
  allowance: BillingAllowance,
  labels: Dictionary["account"]["billing"]
) {
  if (allowance.kind === "boolean") {
    return allowance.enabled ? labels.enabled : labels.disabled;
  }

  return `${formatNumber(allowance.quantity - (allowance.used ?? 0))} ${
    labels.units[allowance.unit]
  }`;
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency"
  }).format(amountCents / 100);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
