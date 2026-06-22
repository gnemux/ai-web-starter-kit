import {
  Badge,
  Button,
  ErrorState,
  Panel,
  SectionHeader,
  StatusBadge
} from "@starter/ui";
import {
  defaultBillingPlans,
  defaultBillingPrices,
  type BillingAllowance,
  type BillingEntitlementSnapshot,
  type BillingFeatureKey,
  type BillingPlan,
  type BillingPrice,
  type ServiceResult
} from "@starter/core";

import type { Dictionary } from "@/lib/i18n";
import { consumeAiUsageDemoAction } from "./actions";

const featureOrder: BillingFeatureKey[] = [
  "projects",
  "pages",
  "leads",
  "ai_tokens",
  "custom_domain"
];

export function BillingOverview({
  billingResult,
  labels,
  usageReview
}: {
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  labels: Dictionary["account"]["billing"];
  usageReview: {
    consumed: string;
    featureKey: string;
    plan: string;
    reason: string;
    remaining: string;
    result: string;
  } | null;
}) {
  const creditPack = defaultBillingPrices.find(
    (price) => price.id === "ai_credit_pack_100k"
  );

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <SectionHeader
          action={<StatusBadge label={labels.statusReady} status="ready" />}
          description={labels.description}
          title={labels.title}
        />

        {!billingResult.ok ? (
          <div className="mt-5">
            <ErrorState
              badgeLabel={labels.statusNeedsReview}
              description={billingResult.error.message}
              title={labels.errorTitle}
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="min-w-0 border-r-0 border-slate-200 lg:border-r lg:pr-5">
              <p className="text-xs font-medium uppercase text-slate-500">
                {labels.currentPlan}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-semibold tracking-normal text-slate-950">
                  {formatPlanName(billingResult.data.planId, labels)}
                </h3>
                <Badge tone="in-progress">
                  {formatSubscriptionStatus(
                    billingResult.data.subscriptionStatus,
                    labels
                  )}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {billingResult.data.planId === "pro"
                  ? labels.currentProDescription
                  : labels.currentDescription}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase text-slate-500">
                {labels.entitlements}
              </p>
              <dl className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">
                {featureOrder.map((featureKey) => (
                  <div className="min-w-0" key={featureKey}>
                    <dt className="text-sm font-medium text-slate-500">
                      {labels.features[featureKey]}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-950">
                      {formatAllowance(
                        billingResult.data.entitlements[featureKey],
                        labels
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </Panel>

      <UsageDemoCard
        billingResult={billingResult}
        creditPack={creditPack}
        labels={labels}
        usageReview={usageReview}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {defaultBillingPlans.map((plan) => (
          <PlanReviewCard
            currentPlanId={billingResult.ok ? billingResult.data.planId : undefined}
            key={plan.id}
            labels={labels}
            plan={plan}
          />
        ))}
      </div>

      {creditPack ? (
        <CreditPackReview labels={labels} price={creditPack} />
      ) : null}
    </div>
  );
}

function UsageDemoCard({
  billingResult,
  creditPack,
  labels,
  usageReview
}: {
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  creditPack?: BillingPrice;
  labels: Dictionary["account"]["billing"];
  usageReview: {
    consumed: string;
    featureKey: string;
    plan: string;
    reason: string;
    remaining: string;
    result: string;
  } | null;
}) {
  const aiAllowance = billingResult.ok
    ? billingResult.data.entitlements.ai_tokens
    : null;
  const remaining =
    aiAllowance?.kind === "quantity"
      ? Math.max(aiAllowance.quantity - (aiAllowance.used ?? 0), 0)
      : 0;
  const canConsume = billingResult.ok && remaining >= labels.usageDemoCost;
  const wasBlocked = usageReview?.result === "blocked";
  const canAttemptUsage = billingResult.ok && !wasBlocked;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={canConsume ? "ready" : "in-progress"}>
              {canConsume ? labels.usageDemoReady : labels.usageDemoBlocked}
            </Badge>
            <span className="text-sm font-medium text-slate-500">
              {labels.usageDemoCostLabel}:{" "}
              {formatNumber(labels.usageDemoCost)} {labels.units.token}
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-950">
            {labels.usageDemoTitle}
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            {labels.usageDemoDescription}
          </p>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 lg:grid-cols-1">
          {canAttemptUsage ? (
            <form action={consumeAiUsageDemoAction}>
              <Button className="w-full" type="submit">
                {labels.usageDemoRun}
              </Button>
            </form>
          ) : (
            <>
              {billingResult.ok && billingResult.data.planId !== "pro" ? (
                <Button
                  className="w-full"
                  href="/account/payment/checkout?price_id=pro_monthly&return_to=%2Faccount"
                >
                  {labels.upgradePro}
                </Button>
              ) : null}
              {creditPack ? (
                <Button
                  className="w-full"
                  href={`/account/payment/checkout?price_id=${creditPack.id}&return_to=%2Faccount`}
                  variant="secondary"
                >
                  {labels.buyCreditPack}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-medium uppercase text-slate-500">
            {labels.usageDemoRemaining}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatNumber(remaining)} {labels.units.token}
          </dd>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-medium uppercase text-slate-500">
            {labels.currentPlan}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {billingResult.ok
              ? formatPlanName(billingResult.data.planId, labels)
              : labels.statusNeedsReview}
          </dd>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-medium uppercase text-slate-500">
            {labels.usageDemoLastResult}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatUsageReview(usageReview, labels)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function PlanReviewCard({
  currentPlanId,
  labels,
  plan
}: {
  currentPlanId?: BillingPlan["id"];
  labels: Dictionary["account"]["billing"];
  plan: BillingPlan;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">
            {formatPlanName(plan.id, labels)}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {labels.planDescriptions[plan.id]}
          </p>
        </div>
        <Badge tone={plan.featured ? "ready" : "neutral"}>
          {plan.featured ? labels.recommended : labels.baseline}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3">
        {featureOrder.map((featureKey) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 pt-3"
            key={featureKey}
          >
            <dt className="min-w-0 text-sm text-slate-500">
              {labels.features[featureKey]}
            </dt>
            <dd className="text-right text-sm font-semibold text-slate-950">
              {formatAllowance(plan.entitlements[featureKey], labels)}
            </dd>
          </div>
        ))}
      </dl>

      {plan.id === "pro" && currentPlanId !== "pro" ? (
        <div className="mt-4">
          <Button href="/account/payment/checkout?price_id=pro_monthly&return_to=%2Faccount">
            {labels.upgradePro}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function CreditPackReview({
  labels,
  price
}: {
  labels: Dictionary["account"]["billing"];
  price: BillingPrice;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">
            {labels.creditPackTitle}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {labels.creditPackDescription}
          </p>
        </div>
        <Badge tone="planned">{labels.sandboxOnly}</Badge>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-slate-500">
            {labels.creditAmount}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatNumber(price.creditQuantity ?? 0)}{" "}
            {labels.units.token}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">
            {labels.price}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatMoney(price.amountCents, price.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">
            {labels.providerMapping}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {labels.notMapped}
          </dd>
        </div>
      </dl>
      <div className="mt-4">
        <Button
          href={`/account/payment/checkout?price_id=${price.id}&return_to=%2Faccount`}
          variant="secondary"
        >
          {labels.buyCreditPack}
        </Button>
      </div>
    </section>
  );
}

function formatPlanName(
  planId: BillingPlan["id"],
  labels: Dictionary["account"]["billing"]
) {
  return labels.planNames[planId];
}

function formatSubscriptionStatus(
  status: BillingEntitlementSnapshot["subscriptionStatus"],
  labels: Dictionary["account"]["billing"]
) {
  return labels.subscriptionStatuses[status];
}

function formatAllowance(
  allowance: BillingAllowance,
  labels: Dictionary["account"]["billing"]
) {
  if (allowance.kind === "boolean") {
    return allowance.enabled ? labels.enabled : labels.disabled;
  }

  const used = allowance.used ?? 0;
  const remaining = Math.max(allowance.quantity - used, 0);
  const unit = labels.units[allowance.unit];

  if (used > 0) {
    return `${formatNumber(remaining)} / ${formatNumber(
      allowance.quantity
    )} ${unit}`;
  }

  return `${formatNumber(allowance.quantity)} ${unit}`;
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency"
  }).format(amountCents / 100);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUsageReview(
  usageReview: {
    consumed: string;
    featureKey: string;
    plan: string;
    reason: string;
    remaining: string;
    result: string;
  } | null,
  labels: Dictionary["account"]["billing"]
) {
  if (!usageReview) {
    return labels.usageDemoNoResult;
  }

  if (usageReview.result === "consumed") {
    return `${labels.usageDemoConsumed}: ${formatNumber(
      Number(usageReview.consumed)
    )} ${labels.units.token}`;
  }

  if (usageReview.result === "blocked") {
    return `${labels.usageDemoLimitReached}: ${usageReview.reason}`;
  }

  return labels.statusNeedsReview;
}
