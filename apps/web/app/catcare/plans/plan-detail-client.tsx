"use client";

import { useState } from "react";

import {
  CatCareCalendarIcon,
  CatCareSaveIcon,
  CatCareXIcon
} from "../catcare-action-icons";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import {
  CatCareButton,
  CatCarePanel
} from "../owner-flow-components";
import {
  closeCatCarePlanLocalAction,
  publishCatCarePlanLocalAction,
  updateCatCarePlanTasksLocalAction
} from "../actions";
import type { CatCarePlan, CatCareTask } from "@/lib/catcare/product-service";
import { PlanScheduleView } from "./plan-schedule-view";
import { PlanConfirmationSummary } from "./plan-confirmation-summary";
import { PlanTaskSaveForm } from "./plan-task-save-form-client";

type PlanMutationResult =
  | { data: CatCarePlan; ok: true }
  | { error: { message: string }; ok: false };

export function PlanDetailClient({
  itemOptions = [],
  justClosed,
  justPublished,
  justSaved,
  plan
}: {
  itemOptions?: string[];
  justClosed: boolean;
  justPublished: boolean;
  justSaved: boolean;
  plan: CatCarePlan;
}) {
  const [currentPlan, setCurrentPlan] = useState(plan);
  const toast = useCatCareToast();
  const [pendingAction, setPendingAction] = useState<"close" | "publish" | null>(null);
  const status = getPlanStatusMeta(currentPlan.status);
  const canClose = currentPlan.status !== "closed";
  const displayTitle = formatPlanDisplayTitle(currentPlan);
  const visiblePlan = {
    ...currentPlan,
    tasks: currentPlan.tasks.filter((task) => !isLegacyPrepareTask(task))
  };
  const canPublish =
    currentPlan.status === "draft" && visiblePlan.tasks.length > 0;

  async function runPlanAction(
    formData: FormData,
    action: (formData: FormData) => Promise<PlanMutationResult>,
    actionName: "close" | "publish"
  ) {
    setPendingAction(actionName);

    const result = await action(formData);

    setPendingAction(null);

    if (!result.ok) {
      toast.showError(result.error.message);
      return;
    }

    setCurrentPlan((previous) => ({
      ...previous,
      ...result.data,
      submissions: previous.submissions,
      tasks: previous.tasks
    }));
    toast.showSuccess(
      actionName === "publish"
        ? "计划已发布。每日任务已按到访时间排好；照看者分享链接将在后续阶段接入。"
        : "计划已关闭，历史清单和照护结果已保留。"
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
      <CatCareToast
        message={
          justClosed
            ? "计划已关闭，历史清单和照护结果已保留。"
            : justSaved
              ? "清单微调已保存，确认无误后可以发布。"
              : justPublished
                ? "计划已发布。每日任务已按到访时间排好；照看者分享链接将在后续阶段接入。"
                : null
        }
        toast={toast.toast}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CatCarePanel>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start">
            <div className="min-w-0">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-[#101a32]">
                {displayTitle}
              </h1>
              <p className="mt-2 text-sm font-semibold text-[#526177]">
                {currentPlan.startOn ?? "未设日期"}
                {currentPlan.endOn ? ` 至 ${currentPlan.endOn}` : ""}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#526177]">
                照护猫咪：{formatPlanCatNames(currentPlan)}
              </p>
            </div>
            <div className="grid gap-3 [&_a]:w-full [&_a]:whitespace-nowrap [&_button]:w-full [&_button]:whitespace-nowrap">
              {canPublish ? (
                <form
                  action={(formData) =>
                    runPlanAction(formData, publishCatCarePlanLocalAction, "publish")
                  }
                  className={pendingAction === "publish" ? "pointer-events-none opacity-70" : ""}
                >
                  <input name="planId" type="hidden" value={currentPlan.id} />
                  <CatCareButton type="submit">
                    <CatCareSaveIcon />
                    发布计划
                  </CatCareButton>
                </form>
              ) : (
                <CatCareButton href={`/catcare/plans/${currentPlan.id}/results`}>
                  <CatCareCalendarIcon />
                  查看结果
                </CatCareButton>
              )}
              {canClose ? (
                <form
                  action={(formData) =>
                    runPlanAction(formData, closeCatCarePlanLocalAction, "close")
                  }
                  className={pendingAction === "close" ? "pointer-events-none opacity-70" : ""}
                >
                  <input name="planId" type="hidden" value={currentPlan.id} />
                  <CatCareButton type="submit" variant="ghost">
                    <CatCareXIcon />
                    结束计划
                  </CatCareButton>
                </form>
              ) : null}
            </div>
          </div>

          <PlanConfirmationSummary canEdit={canPublish} plan={visiblePlan} />

          {canPublish ? (
            <PlanTaskSaveForm
              action={updateCatCarePlanTasksLocalAction}
              itemOptions={itemOptions}
              onSaved={(result) =>
                setCurrentPlan((previous) => ({
                  ...previous,
                  handoffNotes: result.handoffNotes,
                  tasks: result.tasks
                }))
              }
              plan={visiblePlan}
              planId={currentPlan.id}
              tasks={visiblePlan.tasks}
            />
          ) : (
            <div className="mt-6">
              <PlanScheduleView
                description="已按计划日期和到访时间展开任务。系统会把未填写时间的任务归入默认到访批次。"
                plan={visiblePlan}
              />
            </div>
          )}

          {!canPublish ? (
            <details className="mt-6 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
              <summary className="cursor-pointer text-base font-semibold text-[#101a32]">
                查看生成明细（{visiblePlan.tasks.length} 项）
              </summary>
              <div className="mt-4 grid gap-3">
                {visiblePlan.tasks.map((task, index) => (
                  <TaskCard index={index} key={task.id} task={task} />
                ))}
              </div>
            </details>
          ) : null}
        </CatCarePanel>

        <aside className="grid content-start gap-5">
          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">生成摘要</h2>
            <dl className="mt-4 grid gap-3 text-sm font-semibold text-[#526177]">
              <div className="flex justify-between gap-4">
                <dt>生成来源</dt>
                <dd className="text-[#101a32]">CatCare mock</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{canPublish ? "待确认任务" : "生成任务"}</dt>
                <dd className="text-[#101a32]">{visiblePlan.tasks.length} 项</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>场景</dt>
                <dd className="text-[#101a32]">{formatScenario(currentPlan.scenario)}</dd>
              </div>
            </dl>
          </CatCarePanel>

          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">
              分享入口
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#526177]">
              真实照看者分享页和匿名提交将在 ACCESS 阶段接入；本阶段只保留主人侧确认与结果查看。
            </p>
          </CatCarePanel>
        </aside>
      </div>
    </div>
  );
}

function isLegacyPrepareTask(task: CatCareTask) {
  return task.source === "care_item" || task.title.includes("：准备 ");
}

function formatPlanDisplayTitle(plan: CatCarePlan) {
  const range = plan.startOn
    ? ` ${plan.startOn}${plan.endOn ? ` 至 ${plan.endOn}` : ""}`
    : "";

  return range && plan.title.endsWith(range)
    ? plan.title.slice(0, -range.length)
    : plan.title;
}

function formatPlanCatNames(plan: CatCarePlan) {
  const summary = plan.aiInputSummary;

  if (
    summary &&
    typeof summary === "object" &&
    !Array.isArray(summary) &&
    Array.isArray(summary.cat_names)
  ) {
    return summary.cat_names.filter((name) => typeof name === "string").join("、");
  }

  return "当前猫咪";
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

  return { className: "bg-[#fff8e6] text-[#8a5a00]", label: "待确认" };
}

function TaskCard({
  index,
  task
}: {
  index: number;
  task: CatCareTask;
}) {
  return (
    <article className="grid gap-3 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto]">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f7f2] text-sm font-semibold text-[#07847f]">
        {index + 1}
      </span>
      <div>
        <h3 className="text-lg font-semibold text-[#101a32]">{task.title}</h3>
        <p className="mt-1 text-sm font-semibold text-[#526177]">
          {[task.timeHint, formatFrequency(task.frequency)].filter(Boolean).join(" · ") ||
            "按现场情况执行"}
        </p>
        {task.instructions ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#526177]">
            {task.instructions}
          </p>
        ) : null}
      </div>
      <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
        {task.required ? "必做" : "可选"}
      </span>
    </article>
  );
}

function formatScenario(scenario: CatCarePlan["scenario"]) {
  return {
    business_trip: "出差",
    friend_visit: "朋友上门",
    other: "其它",
    weekend_away: "周末出门"
  }[scenario];
}

function formatFrequency(value: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value);
  const count = match?.[2] ?? "1";

  if (match?.[1] === "weekly") {
    return `每周 ${count} 次`;
  }

  if (match?.[1] === "every_2_days") {
    return `每 2 日 ${count} 次`;
  }

  return `每日 ${count} 次`;
}
