import {
  Badge,
  Button,
  ErrorState,
  Panel,
  SectionHeader
} from "@starter/ui";
import {
  compareBillingPlans,
  defaultBillingPlans,
  defaultBillingPrices,
  getBillingPlan,
  type BillingAllowance,
  type BillingEntitlementSnapshot,
  type BillingFeatureKey,
  type BillingPlan,
  type BillingPrice,
  type ServiceResult
} from "@starter/core";

import type { Dictionary } from "@/lib/i18n";
import type { BillingActivity } from "@/lib/services/billing";

const featureOrder: BillingFeatureKey[] = [
  "projects",
  "pages",
  "leads",
  "custom_domain",
  "ai_tokens"
];

export type UsageReviewState = {
  consumed: string;
  featureKey: string;
  plan: string;
  reason: string;
  remaining: string;
  result: string;
} | null;

export function BillingOverview({
  activityResult,
  billingResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  labels: Dictionary["account"]["billing"];
}) {
  const billingReturnTo = encodeURIComponent("/account/billing");
  const currentSnapshot = billingResult.ok ? billingResult.data : undefined;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3" id="plans">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {labels.planOptionsTitle}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {labels.planOptionsDescription}
          </p>
        </div>
        {!billingResult.ok ? (
          <ErrorState
            badgeLabel={labels.statusNeedsReview}
            description={billingResult.error.message}
            title={labels.errorTitle}
          />
        ) : null}
        <div className="grid gap-4 lg:grid-cols-3">
          {defaultBillingPlans.map((plan) => (
            <PlanReviewCard
              currentSnapshot={currentSnapshot}
              key={plan.id}
              labels={labels}
              plan={plan}
              price={getPlanPrice(plan.id)}
              returnTo={billingReturnTo}
            />
          ))}
        </div>
      </section>

      <PlanRecords
        activityResult={activityResult}
        billingResult={billingResult}
        labels={labels}
      />
    </div>
  );
}

export function UsageOverview({
  activityResult,
  billingResult,
  labels,
  usageReview
}: {
  activityResult: ServiceResult<BillingActivity>;
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  labels: Dictionary["account"]["billing"];
  usageReview: UsageReviewState;
}) {
  const creditPack = defaultBillingPrices.find(
    (price) => price.id === "ai_credit_pack_100k"
  );
  const usageReturnTo = encodeURIComponent(buildUsageReturnTo(usageReview));

  return (
    <div className="flex flex-col gap-4">
      <AiCreditOverviewCard
        billingResult={billingResult}
        labels={labels}
      />

      {creditPack ? (
        <CreditPackReview
          labels={labels}
          price={creditPack}
          returnTo={usageReturnTo}
        />
      ) : null}

      <AiRecords activityResult={activityResult} labels={labels} />
    </div>
  );
}

function AiCreditOverviewCard({
  billingResult,
  labels
}: {
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  labels: Dictionary["account"]["billing"];
}) {
  if (!billingResult.ok) {
    return (
      <ErrorState
        badgeLabel={labels.statusNeedsReview}
        description={billingResult.error.message}
        title={labels.errorTitle}
      />
    );
  }

  const credit = getAiCreditBreakdown(billingResult.data);
  return (
    <Panel>
      <SectionHeader
        description={labels.creditOverviewDescription}
        title={labels.creditOverviewTitle}
      />

      <dl className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-md bg-slate-950 p-4 text-white">
          <dt className="text-sm font-medium text-slate-300">
            {labels.creditAvailable}
          </dt>
          <dd className="mt-3 text-4xl font-semibold tracking-normal">
            {formatNumber(credit.totalRemaining)}
          </dd>
          <p className="mt-2 text-sm text-slate-300">{labels.units.credit}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <CreditBreakdownFact
            label={labels.planCreditRemaining}
            value={`${formatNumber(credit.planRemaining)} ${
              labels.units.credit
            }`}
          />
          <CreditBreakdownFact
            label={labels.packCreditRemaining}
            value={`${formatNumber(credit.packRemaining)} ${
              labels.units.credit
            }`}
          />
          <CreditBreakdownFact
            label={labels.creditConsumed}
            value={`${formatNumber(credit.used)} ${labels.units.credit}`}
          />
        </div>
      </dl>
    </Panel>
  );
}

function buildUsageReturnTo(
  usageReview: UsageReviewState
) {
  if (usageReview?.result !== "blocked") {
    return "/account/usage";
  }

  const params = new URLSearchParams({
    consumed: usageReview.consumed,
    feature_key: usageReview.featureKey,
    plan: usageReview.plan,
    reason: usageReview.reason,
    remaining: usageReview.remaining,
    usage_result: usageReview.result
  });

  return `/account/usage?${params.toString()}`;
}

function PlanReviewCard({
  currentSnapshot,
  labels,
  plan,
  price,
  returnTo
}: {
  currentSnapshot?: BillingEntitlementSnapshot;
  labels: Dictionary["account"]["billing"];
  plan: BillingPlan;
  price?: BillingPrice;
  returnTo: string;
}) {
  const currentPlanId = currentSnapshot?.planId;
  const isCurrentPlan = currentPlanId === plan.id;
  const isIncludedLowerPlan =
    currentPlanId !== undefined &&
    compareBillingPlans(plan.id, currentPlanId) < 0;
  const badgeTone = isCurrentPlan
    ? "in-progress"
    : plan.featured
      ? "ready"
      : "neutral";
  const badgeLabel = isCurrentPlan
    ? labels.currentPlanSelected
    : plan.featured
      ? labels.recommended
    : labels.baseline;
  const entitlements = plan.entitlements;

  return (
    <section
      className={
        isCurrentPlan
          ? "rounded-lg border border-slate-950 bg-white p-4 shadow-sm shadow-slate-900/[0.06]"
          : "rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">
            {formatPlanName(plan.id, labels)}
          </h3>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            {formatPlanPrice(price, labels)}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {labels.planDescriptions[plan.id]}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {labels.planInheritance[plan.id]}
          </p>
        </div>
        <Badge tone={badgeTone}>{badgeLabel}</Badge>
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
              {formatAllowance(entitlements[featureKey], labels)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        {isCurrentPlan && currentSnapshot ? (
          <div className="grid gap-3 border-t border-slate-100 pt-4">
            <PlanCardFact
              label={labels.subscriptionStatusLabel}
              value={formatSubscriptionStatus(
                currentSnapshot.subscriptionStatus,
                labels
              )}
            />
            <PlanCardFact
              label={labels.renewalDate}
              value={formatRenewalDate(currentSnapshot.currentPeriodEnd, labels)}
            />
          </div>
        ) : isIncludedLowerPlan || plan.id === "free" ? (
          <p className="border-t border-slate-100 pt-4 text-sm font-medium text-slate-500">
            {labels.includedInCurrentPlan}
          </p>
        ) : price ? (
          <div className="grid gap-2">
            {currentPlanId && currentPlanId !== "free" ? (
              <p className="text-xs leading-5 text-slate-500">
                {labels.planSwitchNote}
              </p>
            ) : null}
            <Button
              href={`/account/payment/checkout?price_id=${price.id}&return_to=${returnTo}`}
            >
              {currentPlanId === "free" ? labels.upgradePlan : labels.switchPlan}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CreditPackReview({
  labels,
  price,
  returnTo
}: {
  labels: Dictionary["account"]["billing"];
  price: BillingPrice;
  returnTo: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">
            {labels.creditPackTitle}
          </h3>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            {formatMoney(price.amountCents, price.currency)}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {labels.creditPackDescription}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-slate-500">
            {labels.creditAmount}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatNumber(price.creditQuantity ?? 0)} {labels.units.credit}
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
      </dl>
      <div className="mt-4">
        <Button
          href={`/account/payment/checkout?price_id=${price.id}&return_to=${returnTo}`}
          variant="secondary"
        >
          {labels.buyCreditPack}
        </Button>
      </div>
    </section>
  );
}

function PlanRecords({
  activityResult,
  billingResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  labels: Dictionary["account"]["billing"];
}) {
  const paymentRecords = activityResult.ok
    ? activityResult.data.paymentRecords.filter(
        (record) => record.priceId !== "ai_credit_pack_100k"
      )
    : [];

  return (
    <Panel>
      <SectionHeader
        description={labels.planRecordsDescription}
        title={labels.planRecordsTitle}
      />

      {!activityResult.ok ? (
        <div className="mt-5">
          <ErrorState
            badgeLabel={labels.statusNeedsReview}
            description={activityResult.error.message}
            title={labels.recordsErrorTitle}
          />
        </div>
      ) : (
        <>
          {billingResult.ok ? (
            <CurrentPlanPeriod labels={labels} snapshot={billingResult.data} />
          ) : null}
          <div className="mt-5 divide-y divide-slate-100">
            {paymentRecords.length > 0 ? (
              paymentRecords.map((record) => (
                <PaymentRecordRow
                  key={record.id}
                  labels={labels}
                  record={record}
                />
              ))
            ) : (
              <p className="py-3 text-sm text-slate-500">
                {labels.emptyPlanRecords}
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

function CurrentPlanPeriod({
  labels,
  snapshot
}: {
  labels: Dictionary["account"]["billing"];
  snapshot: BillingEntitlementSnapshot;
}) {
  return (
    <dl className="mt-5 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
      <PlanCardFact
        label={labels.currentPlan}
        value={labels.planNames[snapshot.planId]}
      />
      <PlanCardFact
        label={labels.renewalDate}
        value={formatRenewalDate(snapshot.currentPeriodEnd, labels)}
      />
    </dl>
  );
}

function AiRecords({
  activityResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  labels: Dictionary["account"]["billing"];
}) {
  const creditRecords = activityResult.ok
    ? activityResult.data.paymentRecords.filter(
        (record) => record.priceId === "ai_credit_pack_100k"
      )
    : [];

  return (
    <Panel>
      <SectionHeader
        description={labels.aiRecordsDescription}
        title={labels.aiRecordsTitle}
      />

      {!activityResult.ok ? (
        <div className="mt-5">
          <ErrorState
            badgeLabel={labels.statusNeedsReview}
            description={activityResult.error.message}
            title={labels.recordsErrorTitle}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <section className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-950">
              {labels.creditRecordsTitle}
            </h3>
            <div className="mt-3 divide-y divide-slate-100">
              {creditRecords.length > 0 ? (
                creditRecords.map((record) => (
                  <PaymentRecordRow
                    key={record.id}
                    labels={labels}
                    record={record}
                  />
                ))
              ) : (
                <p className="py-3 text-sm text-slate-500">
                  {labels.emptyCreditRecords}
                </p>
              )}
            </div>
          </section>

          <section className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-950">
              {labels.usageRecordsTitle}
            </h3>
            <div className="mt-3 divide-y divide-slate-100">
              {activityResult.data.usageRecords.length > 0 ? (
                activityResult.data.usageRecords.map((record) => (
                  <UsageRecordRow key={record.id} labels={labels} record={record} />
                ))
              ) : (
                <p className="py-3 text-sm text-slate-500">
                  {labels.emptyUsageRecords}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </Panel>
  );
}

function PaymentRecordRow({
  labels,
  record
}: {
  labels: Dictionary["account"]["billing"];
  record: BillingActivity["paymentRecords"][number];
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-950">
          {formatPaymentRecordTitle(record, labels)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatRecordDate(record.occurredAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-slate-950">
          {formatOrderAmount(record.amountCents, record.currency)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {labels.orderStatuses[record.status]}
        </p>
      </div>
    </div>
  );
}

function UsageRecordRow({
  labels,
  record
}: {
  labels: Dictionary["account"]["billing"];
  record: BillingActivity["usageRecords"][number];
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-950">
          {record.featureKey === "ai_tokens"
            ? labels.creditConsumptionRecordTitle
            : labels.features[record.featureKey]}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatRecordDate(record.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-slate-950">
          {formatNumber(record.units)} {formatUsageUnit(record.unit, labels)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {labels.usageStatuses[record.status]}
        </p>
      </div>
    </div>
  );
}

function PlanCardFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="min-w-0 text-sm text-slate-500">{label}</dt>
      <dd className="shrink-0 text-right text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function CreditBreakdownFact({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function getAiCreditBreakdown(snapshot: BillingEntitlementSnapshot) {
  const allowance = snapshot.entitlements.ai_tokens;
  const total = getQuantityTotal(allowance);
  const used = getQuantityUsed(allowance);
  const planAllowance = getBillingPlan(snapshot.planId).entitlements.ai_tokens;
  const planTotal = Math.min(getQuantityTotal(planAllowance), total);
  const packTotal = Math.max(total - planTotal, 0);
  const usedFromPlan = Math.min(used, planTotal);
  const usedFromPack = Math.max(used - planTotal, 0);

  return {
    packRemaining: Math.max(packTotal - usedFromPack, 0),
    planRemaining: Math.max(planTotal - usedFromPlan, 0),
    totalRemaining: Math.max(total - used, 0),
    used
  };
}

function getQuantityTotal(allowance: BillingAllowance) {
  return allowance.kind === "quantity" ? allowance.quantity : 0;
}

function getQuantityUsed(allowance: BillingAllowance) {
  return allowance.kind === "quantity" ? allowance.used ?? 0 : 0;
}

function getPlanPrice(planId: BillingPlan["id"]) {
  return defaultBillingPrices.find((price) => price.planId === planId);
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

function formatOrderAmount(amountCents: number, currency: string) {
  if (amountCents === 0) {
    return "$0";
  }

  return formatMoney(amountCents, currency);
}

function formatPlanPrice(
  price: BillingPrice | undefined,
  labels: Dictionary["account"]["billing"]
) {
  if (!price || price.amountCents === 0) {
    return labels.freePrice;
  }

  const amount = formatMoney(price.amountCents, price.currency);

  return price.interval === "month"
    ? `${amount} ${labels.perMonth}`
    : amount;
}

function formatRenewalDate(
  value: string | null,
  labels: Dictionary["account"]["billing"]
) {
  if (!value) {
    return labels.noRenewalDate;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return labels.noRenewalDate;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatRecordDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPaymentRecordTitle(
  record: BillingActivity["paymentRecords"][number],
  labels: Dictionary["account"]["billing"]
) {
  if (record.priceId === "ai_credit_pack_100k") {
    return labels.creditPackTitle;
  }

  if (isPlanNameKey(record.planId, labels)) {
    return labels.planNames[record.planId];
  }

  return record.planId;
}

function formatUsageUnit(
  unit: string,
  labels: Dictionary["account"]["billing"]
) {
  if (unit === "credit" || unit === "token") {
    return labels.units.credit;
  }

  if (unit === "count") {
    return labels.units[unit];
  }

  return unit;
}

function isPlanNameKey(
  value: string,
  labels: Dictionary["account"]["billing"]
): value is keyof Dictionary["account"]["billing"]["planNames"] {
  return Object.prototype.hasOwnProperty.call(labels.planNames, value);
}
