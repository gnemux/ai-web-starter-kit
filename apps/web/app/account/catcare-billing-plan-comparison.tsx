import { Button } from "@xwlc/ui";
import {
  defaultBillingPlans,
  type BillingEntitlementSnapshot,
  type BillingPlan
} from "@xwlc/core";
import type { ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";

import { getPlanPrice } from "./billing-overview";

export function CatCarePlanComparison({
  currentPlanId,
  labels,
  returnTo,
  snapshot
}: {
  currentPlanId: BillingEntitlementSnapshot["planId"];
  labels: Dictionary["account"]["billing"];
  returnTo: string;
  snapshot: BillingEntitlementSnapshot | null;
}) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.04]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">套餐能力对比</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            免费版、进阶版和专业版按猫咪数量、用品库容量、照护计划和智能照护次数区分。
          </p>
        </div>
        <p className="text-sm font-semibold text-teal-700">
          当前：{labels.planNames[currentPlanId]}
        </p>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {defaultBillingPlans.map((plan) => (
          <PlanCard
            currentPlanId={currentPlanId}
            key={plan.id}
            labels={labels}
            plan={plan}
            returnTo={returnTo}
            snapshot={snapshot}
          />
        ))}
      </div>
    </section>
  );
}

function PlanCard({
  currentPlanId,
  labels,
  plan,
  returnTo,
  snapshot
}: {
  currentPlanId: BillingEntitlementSnapshot["planId"];
  labels: Dictionary["account"]["billing"];
  plan: BillingPlan;
  returnTo: string;
  snapshot: BillingEntitlementSnapshot | null;
}) {
  const isCurrent = plan.id === currentPlanId;
  const isNextPlan = getPlanRank(plan.id) === getPlanRank(currentPlanId) + 1;
  const isCovered = getPlanRank(plan.id) < getPlanRank(currentPlanId);
  const price = getPlanPrice(plan.id);

  return (
    <section
      className={`flex min-h-[15rem] flex-col gap-4 rounded-[18px] border p-4 ${
        isCurrent
          ? "border-teal-700 bg-[#f2fbf8]"
          : "border-slate-200 bg-[#fbfcfd]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            {labels.planNames[plan.id]}
          </h3>
          <p className="mt-2 text-2xl font-semibold">
            {formatPlanPriceLabel(plan.id, labels)}
          </p>
        </div>
      </div>
      <ul className="grid gap-2 text-sm font-semibold leading-6 text-slate-700">
        {getCatCarePlanFacts(plan.id).map((fact) => (
          <CheckItem key={fact}>{fact}</CheckItem>
        ))}
      </ul>
      <div className="mt-auto border-t border-slate-100 pt-4">
        {isCovered ? (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">
            {labels.includedInCurrentPlan}
          </p>
        ) : null}
        {isCurrent ? (
          <p className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-teal-700 ring-1 ring-teal-100">
            {snapshot?.currentPeriodEnd
              ? `有效期至 ${formatRecordDate(snapshot.currentPeriodEnd)}`
              : labels.subscriptionStatuses[snapshot?.subscriptionStatus ?? "none"]}
          </p>
        ) : null}
        {isNextPlan && price && price.type !== "free" ? (
          <Button
            className="min-h-11 w-full bg-teal-700 text-white hover:bg-teal-800"
            href={`/account/payment/checkout?price_id=${price.id}&return_to=${returnTo}`}
            variant="primary"
          >
            {labels.upgradePlan}
          </Button>
        ) : null}
      </div>
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

export function formatPlanPriceLabel(
  planId: BillingEntitlementSnapshot["planId"],
  labels: Dictionary["account"]["billing"]
) {
  const price = getPlanPrice(planId);

  if (!price || price.amountCents === 0) {
    return labels.freePrice;
  }

  return `$${Math.round(price.amountCents / 100)} ${labels.perMonth}`;
}

export function getCatCarePlanFacts(
  planId: BillingEntitlementSnapshot["planId"]
) {
  if (planId === "free") {
    return ["先照顾 1 只猫咪", "记录 20 件常用用品", "每月 2 次生成计划或复盘"];
  }

  if (planId === "plus") {
    return ["适合 3 只猫咪家庭", "用品库扩到 80 件", "每月 12 次生成计划或复盘"];
  }

  return ["多猫家庭不用删档", "用品库可以继续积累", "每月 25 次生成计划或复盘"];
}

function getPlanRank(planId: BillingEntitlementSnapshot["planId"]) {
  return planId === "free" ? 0 : planId === "plus" ? 1 : 2;
}

function formatRecordDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}
