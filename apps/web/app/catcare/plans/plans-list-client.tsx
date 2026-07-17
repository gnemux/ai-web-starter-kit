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
import { isPlanOverdue } from "./plan-list-state";

export function PlansListClient({
  activePlans,
  historyPlans,
  today
}: {
  activePlans: CatCarePlan[];
  historyPlans: CatCarePlan[];
  today: string;
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
    toast.showDanger("计划已删除");
  }

  return (
    <>
      <CatCareToast message={null} toast={toast.toast} />
      <h3 className="text-lg font-semibold text-[#101a32]">进行中计划</h3>
      {visibleActivePlans.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {visibleActivePlans.map((plan) => (
            <PlanCard key={plan.id} onDeleted={handleDeleted} plan={plan} today={today} />
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
              <PlanCard key={plan.id} onDeleted={handleDeleted} plan={plan} today={today} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function PlanCard({
  onDeleted,
  plan,
  today
}: {
  onDeleted: (planId: string) => void;
  plan: CatCarePlan;
  today: string;
}) {
  const displayTitle = formatPlanDisplayTitle(plan);
  const overdue = isPlanOverdue(plan, today);
  const status = getPlanStatusMeta(plan.status, overdue);
  const action = getPlanAction(plan, overdue);
  const canDelete = canDeletePlan(plan);
  const timingNote = getPlanTimingNote(plan, overdue);

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
          {timingNote ? (
            <p className="mt-2 text-xs font-semibold leading-5 text-[#8a5a00]">
              {timingNote}
            </p>
          ) : null}
        </div>
        <span className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="grid gap-3 border-t border-[#e2e6ee] pt-4">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f2fbf8] px-3 py-1.5 text-sm font-semibold text-[#526177] ring-1 ring-[#d9eee7]">
          <CatCareCalendarIcon className="h-4 w-4 text-[#07847f]" />
          {plan.taskCount ?? plan.tasks.length} 项清单任务
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
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

function getPlanTimingNote(plan: CatCarePlan, overdue: boolean) {
  if (plan.status !== "published" || !overdue) {
    return null;
  }

  return "计划已结束；分享链接仍有效时，照看者可以补提交，主人侧在结果页查看。";
}

function canDeletePlan(plan: CatCarePlan) {
  const submissionCount = plan.submissionCount ?? plan.submissions.length;

  return (
    (plan.status === "draft" || plan.status === "closed") &&
    submissionCount === 0
  );
}

function getPlanStatusMeta(status: CatCarePlan["status"], overdue: boolean) {
  if (status === "closed") {
    return { className: "bg-[#f2f4f7] text-[#526177]", label: "已关闭" };
  }

  if (status === "reviewed") {
    return { className: "bg-[#eef4ff] text-[#315a9f]", label: "已复盘" };
  }

  if (overdue) {
    return status === "published"
      ? { className: "bg-[#fff8e6] text-[#8a5a00]", label: "已结束·可补交" }
      : { className: "bg-[#f2f4f7] text-[#526177]", label: "已过期" };
  }

  if (status === "published") {
    return { className: "bg-[#e6f7f2] text-[#07847f]", label: "已发布" };
  }

  return { className: "bg-[#fff8e6] text-[#8a5a00]", label: "草稿" };
}

function getPlanAction(plan: CatCarePlan, overdue: boolean): {
  href: string;
  icon: ReactNode;
  label: string;
  variant: "primary" | "secondary" | "ghost";
} {
  if (plan.status === "draft") {
    return {
      href: `/catcare/plans/${plan.id}`,
      icon: <CatCareSaveIcon />,
      label: overdue ? "查看草稿" : "继续确认",
      variant: overdue ? "ghost" : "primary"
    };
  }

  if (plan.status === "published" && !overdue) {
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
