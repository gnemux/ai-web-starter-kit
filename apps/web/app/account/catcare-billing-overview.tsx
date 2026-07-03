import { Badge, Button, ErrorState } from "@xwlc/ui";
import {
  defaultBillingPrices,
  type BillingEntitlementSnapshot,
  type ServiceResult
} from "@xwlc/core";
import type { ReactNode } from "react";

import {
  CatCareAiCreditIcon,
  CatCareBillingEntitlementsIcon,
  CatCareCarePlanIcon,
  CatCareCreditPack100Icon,
  CatCareCreditPack15Icon,
  CatCareCreditPack30Icon,
  CatCareCreditPack5Icon
} from "@/components/catcare-icons";
import { CatCareIconFrame } from "@/components/catcare-ui";
import type { Dictionary } from "@/lib/i18n";
import type { BillingActivity } from "@/lib/services/billing";

import { formatMoney, getPlanPrice } from "./billing-overview";

export function CatCareBillingOverview({
  activityResult,
  billingResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  labels: Dictionary["account"]["billing"];
}) {
  const snapshot = billingResult.ok ? billingResult.data : null;
  const planId = snapshot?.planId ?? "free";
  const isPro = planId === "pro";
  const returnTo = encodeURIComponent("/account/billing");
  const proPrice = getPlanPrice("pro");
  const creditPack = defaultBillingPrices.find(
    (price) => price.id === "ai_credit_pack_100k"
  );

  return (
    <div className="flex flex-col gap-5 text-slate-950">
      <SandboxBanner labels={labels} />

      {!billingResult.ok ? (
        <ErrorState
          badgeLabel={labels.statusNeedsReview}
          description={billingResult.error.message}
          title={labels.errorTitle}
        />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_0.8fr]">
        <CurrentPlanCard
          isPro={isPro}
          labels={labels}
          planId={planId}
          proPrice={proPrice}
          returnTo={returnTo}
          snapshot={snapshot}
        />
        <AiCreditsCard isPro={isPro} labels={labels} />
        <ProBenefitsCard
          isPro={isPro}
          labels={labels}
          proPrice={proPrice}
          returnTo={returnTo}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <CreditPacksCard
          creditPackId={creditPack?.id}
          labels={labels}
          returnTo={returnTo}
        />
        <PaymentFlowCard labels={labels} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <OrdersPanel activityResult={activityResult} labels={labels} />
        <CreditLedgerPanel activityResult={activityResult} labels={labels} />
      </section>
    </div>
  );
}

function SandboxBanner({
  labels
}: {
  labels: Dictionary["account"]["billing"];
}) {
  return (
    <section className="rounded-[18px] border border-blue-100 bg-blue-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <CatCareIconFrame className="!h-10 !w-10 !ring-0 text-blue-700 [&_img]:!h-5 [&_img]:!w-5 [&_svg]:!h-5 [&_svg]:!w-5">
          <CatCareBillingEntitlementsIcon />
        </CatCareIconFrame>
        <p className="text-sm font-semibold leading-6 text-blue-900">
          {labels.catcareSandboxNotice}
        </p>
      </div>
    </section>
  );
}

function CurrentPlanCard({
  isPro,
  labels,
  planId,
  proPrice,
  returnTo,
  snapshot
}: {
  isPro: boolean;
  labels: Dictionary["account"]["billing"];
  planId: BillingEntitlementSnapshot["planId"];
  proPrice: ReturnType<typeof getPlanPrice>;
  returnTo: string;
  snapshot: BillingEntitlementSnapshot | null;
}) {
  return (
    <ProductCard>
      <div className="grid min-h-[13rem] grid-cols-[minmax(0,1fr)_8.5rem] gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{labels.catcareCurrentPlanTitle}</h2>
            <Badge tone={isPro ? "ready" : "neutral"}>{labels.planNames[planId]}</Badge>
          </div>
          <p className="mt-3 text-5xl font-semibold leading-none">
            {isPro
              ? labels.catcareDisplay.proPrice
              : labels.catcareDisplay.freePrice}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {snapshot
              ? labels.subscriptionStatuses[snapshot.subscriptionStatus]
              : labels.statusNeedsReview}
          </p>
          <ul className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
            <CheckItem>
              {isPro
                ? labels.catcareDisplay.proAiAllowance
                : labels.catcareDisplay.freeAiAllowance}
            </CheckItem>
            <CheckItem>{labels.planDescriptions[planId]}</CheckItem>
          </ul>
        </div>
        <img
          alt=""
          className="self-end object-contain"
          src={isPro ? "/catcare/card-cat-pro.png" : "/catcare/card-cat-free.png"}
        />
      </div>
      {!isPro && proPrice ? (
        <Button
          className="mt-5 w-full bg-orange-600 hover:bg-orange-700"
          href={`/account/payment/checkout?price_id=${proPrice.id}&return_to=${returnTo}`}
        >
          {labels.upgradePlan} {labels.catcareDisplay.proPrice}
        </Button>
      ) : null}
    </ProductCard>
  );
}

function AiCreditsCard({
  isPro,
  labels
}: {
  isPro: boolean;
  labels: Dictionary["account"]["billing"];
}) {
  return (
    <ProductCard>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{labels.catcareCreditTitle}</h2>
        <CatCareIconFrame size="sm">
          <CatCareAiCreditIcon />
        </CatCareIconFrame>
      </div>
      <div className="mt-5 grid min-h-[10rem] gap-5 sm:grid-cols-[0.8fr_1fr]">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {labels.planCreditRemaining}
          </p>
          <p className="mt-3 text-5xl font-semibold">
            {isPro
              ? labels.catcareDisplay.proCreditSummary
              : labels.catcareDisplay.freeCreditSummary}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full bg-teal-700 ${isPro ? "w-1/2" : "w-full"}`}
            />
          </div>
        </div>
        <div className="grid content-center gap-3 border-l border-slate-100 pl-5 text-sm">
          <CreditLine
            label={labels.features.ai_tokens}
            value={
              isPro
                ? labels.catcareDisplay.proCreditSummary
                : labels.catcareDisplay.freeCreditSummary
            }
          />
          <CreditLine
            label={labels.packCreditRemaining}
            value={labels.catcareDisplay.creditPackEmpty}
          />
          <CreditLine
            label={labels.features.custom_domain}
            value={isPro ? labels.statusReady : labels.statusNeedsReview}
          />
        </div>
      </div>
    </ProductCard>
  );
}

function ProBenefitsCard({
  isPro,
  labels,
  proPrice,
  returnTo
}: {
  isPro: boolean;
  labels: Dictionary["account"]["billing"];
  proPrice: ReturnType<typeof getPlanPrice>;
  returnTo: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-orange-200 bg-[#fff8f0] p-5 shadow-sm shadow-slate-900/[0.04]">
      <div className="flex items-start gap-3">
        <CatCareIconFrame className="!bg-orange-50 !text-orange-600 !ring-orange-50" size="sm">
          <CatCareCarePlanIcon />
        </CatCareIconFrame>
        <h2 className="text-xl font-semibold leading-tight">
          {labels.catcarePaywallTitle}
        </h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {labels.catcarePaywallDescription}
      </p>
      <ul className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
        <CheckItem>{labels.catcareDisplay.proAiAllowance}</CheckItem>
        <CheckItem>{labels.features.custom_domain}</CheckItem>
        <CheckItem>{labels.planDescriptions.pro}</CheckItem>
      </ul>
      <img
        alt=""
        className="mx-auto mt-2 h-24 w-44 object-contain"
        src="/catcare/card-cat-pro.png"
      />
      {!isPro && proPrice ? (
        <Button
          className="mt-4 w-full bg-orange-600 hover:bg-orange-700"
          href={`/account/payment/checkout?price_id=${proPrice.id}&return_to=${returnTo}`}
        >
          {labels.upgradePlan}
        </Button>
      ) : (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600">
          {labels.currentPlanSelected}
        </p>
      )}
    </section>
  );
}

function CreditPacksCard({
  creditPackId,
  labels,
  returnTo
}: {
  creditPackId?: string;
  labels: Dictionary["account"]["billing"];
  returnTo: string;
}) {
  return (
    <ProductCard>
      <h2 className="text-xl font-semibold">{labels.catcareCreditPacksTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {labels.catcareCreditPacksDescription}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {labels.catcareDisplay.creditPackOptions.map((option, index) => (
          <CreditPackTile
            href={
              index === 0 && creditPackId
                ? `/account/payment/checkout?price_id=${creditPackId}&return_to=${returnTo}`
                : null
            }
            key={option.price}
            optionIndex={index}
            option={option}
            selected={index === 0}
          />
        ))}
      </div>
    </ProductCard>
  );
}

function PaymentFlowCard({
  labels
}: {
  labels: Dictionary["account"]["billing"];
}) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-teal-100 bg-[#eefaf6] p-5 shadow-sm shadow-slate-900/[0.04]">
      <h2 className="text-xl font-semibold">{labels.catcareFlowTitle}</h2>
      <ol className="mt-5 grid gap-4">
        {labels.catcareFlowSteps.map((step, index) => (
          <li className="flex items-start gap-3" key={step}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
              {index + 1}
            </span>
            <span className="pt-1 text-sm font-semibold text-slate-700">
              {step}
            </span>
          </li>
        ))}
      </ol>
      <img
        alt=""
        className="absolute bottom-0 right-1 h-28 w-36 object-contain opacity-95"
        src="/catcare/card-cat-credit.png"
      />
    </section>
  );
}

function ProductCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.04]">
      {children}
    </section>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="text-teal-700">✓</span>
      <span>{children}</span>
    </li>
  );
}

function CreditLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function CreditPackTile({
  href,
  option,
  optionIndex,
  selected
}: {
  href: string | null;
  option: { description: string; price: string };
  optionIndex: number;
  selected: boolean;
}) {
  const icons = [
    <CatCareCreditPack5Icon key="5" />,
    <CatCareCreditPack15Icon key="15" />,
    <CatCareCreditPack30Icon key="30" />,
    <CatCareCreditPack100Icon key="100" />
  ];
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        {selected ? <Badge tone="planned">推荐</Badge> : <span />}
        <CatCareIconFrame
          className="!h-10 !w-10 !bg-teal-50 !ring-teal-50 [&_img]:!h-6 [&_img]:!w-6"
          size="sm"
        >
          {icons[optionIndex] ?? icons[0]}
        </CatCareIconFrame>
      </div>
      <h3 className="mt-3 text-3xl font-semibold text-slate-950">
        {option.price}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {option.description}
      </p>
    </>
  );

  return (
    <section
      className={`min-h-36 rounded-[18px] border p-5 ${
        selected ? "border-teal-700 bg-[#f7fffc]" : "border-slate-200 bg-white"
      }`}
    >
      {href ? (
        <a className="block focus:outline-none" href={href}>
          {content}
        </a>
      ) : (
        content
      )}
    </section>
  );
}

function OrdersPanel({
  activityResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  labels: Dictionary["account"]["billing"];
}) {
  const rows = activityResult.ok ? activityResult.data.paymentRecords : [];

  return (
    <TableCard
      error={activityResult.ok ? null : activityResult.error.message}
      errorTitle={labels.recordsErrorTitle}
      labels={labels}
      title={labels.planRecordsTitle}
    >
      <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
        <tr>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.order}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.type}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.amount}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.status}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.time}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.environment}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length > 0 ? (
          rows.slice(0, 5).map((record) => (
            <tr key={record.id}>
              <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-950">
                {record.id.slice(0, 12)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {formatPaymentRecordTitle(record, labels)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-950">
                {formatMoney(record.amountCents, record.currency)}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <Badge tone={record.status === "paid" ? "ready" : "neutral"}>
                  {labels.orderStatuses[record.status]}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                {formatRecordDate(record.occurredAt)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                {labels.catcareDisplay.sandboxTag}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-5 py-6 text-slate-500" colSpan={6}>
              {labels.emptyPlanRecords}
            </td>
          </tr>
        )}
      </tbody>
    </TableCard>
  );
}

function CreditLedgerPanel({
  activityResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  labels: Dictionary["account"]["billing"];
}) {
  const rows = activityResult.ok ? activityResult.data.usageRecords : [];

  return (
    <TableCard
      error={activityResult.ok ? null : activityResult.error.message}
      errorTitle={labels.recordsErrorTitle}
      labels={labels}
      title={labels.aiRecordsTitle}
    >
      <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
        <tr>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.time}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.type}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.change}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.balance}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.description}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length > 0 ? (
          rows.slice(0, 5).map((record) => (
            <tr key={record.id}>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                {formatRecordDate(record.createdAt)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {labels.usageRecordsTitle}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-950">
                -{formatAiSummaryUnits(record.units)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">-</td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {labels.creditConsumptionRecordTitle}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-5 py-6 text-slate-500" colSpan={5}>
              {labels.emptyUsageRecords}
            </td>
          </tr>
        )}
      </tbody>
    </TableCard>
  );
}

function TableCard({
  children,
  error,
  errorTitle,
  labels,
  title
}: {
  children: ReactNode;
  error: string | null;
  errorTitle: string;
  labels: Dictionary["account"]["billing"];
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.04]">
      <div className="p-5 pb-3">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      {error ? (
        <div className="p-5 pt-0">
          <ErrorState
            badgeLabel={labels.statusNeedsReview}
            description={error}
            title={errorTitle}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-slate-100 text-left text-sm">
            {children}
          </table>
        </div>
      )}
    </section>
  );
}

function formatAiSummaryUnits(units: number) {
  return `${Math.max(1, Math.round(units / 10000))}`;
}

function formatRecordDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatPaymentRecordTitle(
  record: BillingActivity["paymentRecords"][number],
  labels: Dictionary["account"]["billing"]
) {
  if (record.priceId === "ai_credit_pack_100k") {
    return labels.catcareCreditPacksTitle;
  }

  if (isPlanNameKey(record.planId, labels)) {
    return labels.planNames[record.planId];
  }

  return record.planId;
}

function isPlanNameKey(
  value: string,
  labels: Dictionary["account"]["billing"]
): value is keyof Dictionary["account"]["billing"]["planNames"] {
  return Object.prototype.hasOwnProperty.call(labels.planNames, value);
}
