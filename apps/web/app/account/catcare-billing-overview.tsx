import { Badge, ErrorState } from "@xwlc/ui";
import {
  defaultBillingPrices,
  type BillingEntitlementSnapshot,
  type ServiceResult
} from "@xwlc/core";
import type { ReactNode } from "react";

import {
  CatCareAiChecklistIcon,
  CatCareAiCreditIcon,
  CatCareBillingEntitlementsIcon,
  CatCareCreditPack5Icon
} from "@/components/catcare-icons";
import { CatCareIconFrame } from "@/components/catcare-ui";
import { getCatCarePlanLimits } from "@/lib/catcare/plan-limits";
import type { Dictionary } from "@/lib/i18n";
import {
  getAiCreditAllowanceUsage,
  type BillingActivity
} from "@/lib/services/billing";

import {
  CatCarePlanComparison,
  formatPlanPriceLabel,
  getCatCarePlanFacts
} from "./catcare-billing-plan-comparison";
import { CatCareBillingRecords } from "./catcare-billing-records";

const aiBillingRobotCatSrc = "/catcare/illustrations/ai-billing-robot-cat.png";

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

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_0.92fr]">
        <CurrentPlanCard
          labels={labels}
          planId={planId}
          snapshot={snapshot}
        />
        <AiCreditsCard
          allowance={snapshot?.entitlements.ai_tokens ?? null}
          labels={labels}
          planId={planId}
        />
        <CreditPackCard
          creditPackId={creditPack?.id}
          isPro={isPro}
          labels={labels}
          returnTo={returnTo}
        />
      </section>

      <CatCarePlanComparison
        currentPlanId={planId}
        labels={labels}
        returnTo={returnTo}
        snapshot={snapshot}
      />

      <CatCareBillingRecords
        activityResult={activityResult}
        labels={labels}
      />
    </div>
  );
}

function SandboxBanner({
  labels
}: {
  labels: Dictionary["account"]["billing"];
}) {
  return (
    <section className="rounded-[18px] border border-teal-100 bg-[#f4fbf8] px-5 py-4">
      <div className="flex items-center gap-3">
        <CatCareIconFrame className="!h-10 !w-10 !ring-0 text-teal-700 [&_img]:!h-5 [&_img]:!w-5 [&_svg]:!h-5 [&_svg]:!w-5">
          <CatCareBillingEntitlementsIcon />
        </CatCareIconFrame>
        <p className="text-sm font-semibold leading-6 text-teal-900">
          {labels.catcareSandboxNotice}
        </p>
      </div>
    </section>
  );
}

function CurrentPlanCard({
  labels,
  planId,
  snapshot
}: {
  labels: Dictionary["account"]["billing"];
  planId: BillingEntitlementSnapshot["planId"];
  snapshot: BillingEntitlementSnapshot | null;
}) {
  return (
    <ProductCard className="relative">
      <div className="grid min-h-[17rem] gap-4 sm:grid-cols-[minmax(12.5rem,15rem)_minmax(10rem,13rem)] sm:items-center sm:justify-start">
        <div className="relative z-10">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <h2 className="text-lg font-semibold sm:text-xl">
              {labels.catcareCurrentPlanTitle}
            </h2>
            <Badge tone={planId === "pro" ? "ready" : "neutral"}>
              {labels.planNames[planId]}
            </Badge>
          </div>
          <p className="mt-5 text-4xl font-semibold leading-none sm:text-[2.75rem]">
            {formatPlanPriceLabel(planId, labels)}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {snapshot
              ? labels.subscriptionStatuses[snapshot.subscriptionStatus]
              : labels.statusNeedsReview}
          </p>
          <ul className="mt-5 grid gap-2 text-sm font-semibold leading-6 text-slate-700">
            {getCatCarePlanFacts(planId).slice(0, 3).map((fact) => (
              <CheckItem key={fact}>{fact}</CheckItem>
            ))}
          </ul>
        </div>
        <div className="grid min-h-[16rem] w-full place-items-center sm:justify-items-start">
          <img
            alt=""
            className="block h-auto w-full max-w-[13rem] object-contain"
            loading="eager"
            src={aiBillingRobotCatSrc}
          />
        </div>
      </div>
    </ProductCard>
  );
}

function AiCreditsCard({
  allowance,
  labels,
  planId
}: {
  allowance: BillingEntitlementSnapshot["entitlements"]["ai_tokens"] | null;
  labels: Dictionary["account"]["billing"];
  planId: BillingEntitlementSnapshot["planId"];
}) {
  const usage = allowance ? getAiCreditAllowanceUsage(allowance) : null;
  const planQuantity = getCatCarePlanLimits(planId).aiSummaryUses;
  const used = Math.min(usage?.used ?? 0, planQuantity);
  const remaining = Math.max(planQuantity - used, 0);
  const progress = planQuantity > 0 ? (used / planQuantity) * 100 : 0;

  return (
    <ProductCard>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{labels.catcareCreditTitle}</h2>
        <span className="grid h-12 w-12 shrink-0 place-items-center text-teal-700">
          <CatCareAiCreditIcon className="h-8 w-8" />
        </span>
      </div>
      <div className="mt-5 grid min-h-[13rem] content-between gap-5">
        <div>
          <p className="text-sm font-medium text-slate-500">
            套餐内可用次数
          </p>
          <p className="mt-3 text-5xl font-semibold leading-none">
            {remaining} / {planQuantity} <span className="text-2xl">次</span>
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            已用 {used} 次，剩余 {remaining} 次
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <QuotaStat
            icon={<CatCareAiChecklistIcon className="h-6 w-6" />}
            label="本月次数"
            value={`${planQuantity} 次`}
          />
          <QuotaStat
            icon={<CatCareAiCreditIcon className="h-6 w-6" />}
            label="已使用次数"
            value={`${used} 次`}
          />
        </div>
      </div>
    </ProductCard>
  );
}

function CreditPackCard({
  creditPackId,
  isPro,
  labels,
  returnTo
}: {
  creditPackId?: string;
  isPro: boolean;
  labels: Dictionary["account"]["billing"];
  returnTo: string;
}) {
  return (
    <ProductCard>
      <div>
        <h2 className="text-xl font-semibold leading-tight">临时增加摘要</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          偶尔需要多生成几次计划或复盘时，再单独补 10 次。
          {isPro ? " 专业版日常够用，额度包只做临时加量。" : ""}
        </p>
      </div>
      <div className="mt-4">
        <CreditPackTile
          href={
            creditPackId
              ? `/account/payment/checkout?price_id=${creditPackId}&return_to=${returnTo}`
              : null
          }
          labels={labels}
          option={labels.catcareDisplay.creditPackOptions[0]}
        />
      </div>
    </ProductCard>
  );
}

function ProductCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.04] ${className}`}>
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

function QuotaStat({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center text-teal-700">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function CreditPackTile({
  href,
  labels,
  option
}: {
  href: string | null;
  labels: Dictionary["account"]["billing"];
  option: { description: string; price: string };
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <Badge tone="planned">推荐</Badge>
        <CatCareIconFrame
          className="!h-10 !w-10 !bg-teal-50 !ring-teal-50 [&_img]:!h-6 [&_img]:!w-6"
          size="sm"
        >
          <CatCareCreditPack5Icon />
        </CatCareIconFrame>
      </div>
      <h3 className="mt-3 text-3xl font-semibold text-slate-950">
        {option.price}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {option.description}
      </p>
      <span className="mt-4 flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white">
        {labels.buyCreditPack}
      </span>
    </>
  );

  return (
    <section className="rounded-[18px] border border-teal-700 bg-white p-4">
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
