"use client";

import { useState, type ReactNode } from "react";

import { EmptyState } from "@xwlc/ui";

import {
  CatCareCalendarIcon,
  CatCareSaveIcon
} from "../catcare-action-icons";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import { CatCareButton } from "../owner-flow-components";
import type { CatCarePlan } from "@/lib/catcare/product-service";
import { DeletePlanButton } from "./delete-plan-button";
import { formatPlanCatNames } from "./plan-cat-names";

export function PlansListClient({
  activePlans,
  historyPlans
}: {
  activePlans: CatCarePlan[];
  historyPlans: CatCarePlan[];
}) {
  const toast = useCatCareToast();
  const [deletedPlanIds, setDeletedPlanIds] = useState<string[]>([]);
  const visibleActivePlans = activePlans.filter(
    (plan) => !deletedPlanIds.includes(plan.id)
  );
  const visibleHistoryPlans = historyPlans.filter(
    (plan) => !deletedPlanIds.includes(plan.id)
  );

  function handleDeleted(planId: string) {
    setDeletedPlanIds((current) =>
      current.includes(planId) ? current : [...current, planId]
    );
    toast.showDanger("计划已删除。");
  }

  return (
    <>
      <CatCareToast message={null} toast={toast.toast} />
      <h3 className="text-lg font-semibold text-[#101a32]">进行中计划</h3>
      {visibleActivePlans.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {visibleActivePlans.map((plan) => (
            <PlanCard key={plan.id} onDeleted={handleDeleted} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            description="生成后会先进入草稿确认页，确认后再发布。"
            title="暂无进行中计划"
          />
        </div>
      )}
      {visibleHistoryPlans.length > 0 ? (
        <div className="mt-8 border-t border-[#e2e6ee] pt-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#101a32]">
              历史计划
            </h3>
            <p className="text-sm font-semibold leading-6 text-[#526177]">
              已执行过的计划保留结果；未执行的草稿或已关闭计划可删除，避免测试计划堆积。
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {visibleHistoryPlans.map((plan) => (
              <PlanCard key={plan.id} onDeleted={handleDeleted} plan={plan} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function PlanCard({
  onDeleted,
  plan
}: {
  onDeleted: (planId: string) => void;
  plan: CatCarePlan;
}) {
  const displayTitle = formatPlanDisplayTitle(plan);
  const status = getPlanStatusMeta(plan.status);
  const action = getPlanAction(plan);
  const canDelete = canDeletePlan(plan);

  return (
    <article
      className="grid gap-4 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4 transition hover:border-[#07847f]/40 hover:bg-white"
      data-catcare-plan-card={plan.id}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-[#101a32]">
            {displayTitle}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#526177]">
            {plan.startOn ?? "未设日期"}
            {plan.endOn ? ` 至 ${plan.endOn}` : ""}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#526177]">
            照护猫咪：{formatPlanCatNames(plan)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#e2e6ee] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#526177]">
          <CatCareCalendarIcon className="h-4 w-4 text-[#07847f]" />
          {plan.taskCount ?? plan.tasks.length} 项清单任务
        </p>
        <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-max">
          <CatCareButton href={action.href} variant={action.variant}>
            {action.icon}
            {action.label}
          </CatCareButton>
          {canDelete ? (
            <DeletePlanButton
              onDeleted={onDeleted}
              planId={plan.id}
              planTitle={displayTitle}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function canDeletePlan(plan: CatCarePlan) {
  const submissionCount = plan.submissionCount ?? plan.submissions.length;

  return (
    (plan.status === "draft" || plan.status === "closed") &&
    submissionCount === 0
  );
}

function getPlanStatusMeta(status: CatCarePlan["status"]) {
  if (status === "closed") {
    return { className: "bg-[#f2f4f7] text-[#526177]", label: "已关闭" };
  }

  if (status === "reviewed") {
    return { className: "bg-[#eef4ff] text-[#315a9f]", label: "已复盘" };
  }

  if (status === "published") {
    return { className: "bg-[#e6f7f2] text-[#07847f]", label: "已发布" };
  }

  return { className: "bg-[#fff8e6] text-[#8a5a00]", label: "草稿" };
}

function getPlanAction(plan: CatCarePlan): {
  href: string;
  icon: ReactNode;
  label: string;
  variant: "primary" | "secondary" | "ghost";
} {
  if (plan.status === "draft") {
    return {
      href: `/catcare/plans/${plan.id}`,
      icon: <CatCareSaveIcon />,
      label: "继续确认",
      variant: "primary"
    };
  }

  if (plan.status === "published") {
    return {
      href: `/catcare/plans/${plan.id}`,
      icon: <CatCareCalendarIcon />,
      label: "查看执行日历",
      variant: "primary"
    };
  }

  return {
    href: `/catcare/plans/${plan.id}/results`,
    icon: <CatCareCalendarIcon />,
    label: "查看结果",
    variant: "ghost"
  };
}

function formatPlanDisplayTitle(plan: CatCarePlan) {
  const range = plan.startOn
    ? ` ${plan.startOn}${plan.endOn ? ` 至 ${plan.endOn}` : ""}`
    : "";

  return range && plan.title.endsWith(range)
    ? plan.title.slice(0, -range.length)
    : plan.title;
}
