"use client";

import { useState } from "react";

import {
  CatCareCalendarIcon,
  CatCareSaveIcon,
  CatCareXIcon
} from "../catcare-action-icons";
import { CatCareShareLinkIcon } from "@/components/catcare-icons";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import {
  CatCareButton,
  CatCarePanel
} from "../owner-flow-components";
import {
  closeCatCarePlanLocalAction,
  createCarePlanShareLinkLocalAction,
  publishCatCarePlanLocalAction,
  revokeCarePlanShareLinkLocalAction,
  updateCatCarePlanTasksLocalAction
} from "../actions";
import type {
  CarePlanShareLinkMutation,
  CarePlanShareLinkState,
  CatCarePlan,
  CatCareTask
} from "@/lib/catcare/product-service";
import { PlanScheduleView } from "./plan-schedule-view";
import { PlanConfirmationSummary } from "./plan-confirmation-summary";
import { PlanTaskSaveForm } from "./plan-task-save-form-client";

type PlanMutationResult =
  | { data: CatCarePlan; ok: true }
  | { error: { message: string }; ok: false };

type ShareLinkMutationResult =
  | { data: CarePlanShareLinkMutation; ok: true }
  | { error: { message: string }; ok: false };

export function PlanDetailClient({
  itemOptions = [],
  justClosed,
  justPublished,
  justSaved,
  plan,
  shareLinkState
}: {
  itemOptions?: string[];
  justClosed: boolean;
  justPublished: boolean;
  justSaved: boolean;
  plan: CatCarePlan;
  shareLinkState: CarePlanShareLinkState;
}) {
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [currentShareLink, setCurrentShareLink] = useState(shareLinkState);
  const [copyableShareUrl, setCopyableShareUrl] = useState<string | null>(null);
  const toast = useCatCareToast();
  const [pendingAction, setPendingAction] = useState<
    "close" | "publish" | "share" | "revoke-share" | null
  >(null);
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
        ? "计划已发布。每日任务已按到访时间排好，可在分享入口发送给照看者。"
        : "计划已关闭，历史清单和照护结果已保留。"
    );
  }

  async function runShareAction(
    formData: FormData,
    action: (formData: FormData) => Promise<ShareLinkMutationResult>,
    actionName: "share" | "revoke-share"
  ) {
    setPendingAction(actionName);

    const result = await action(formData);

    setPendingAction(null);

    if (!result.ok) {
      toast.showError(result.error.message);
      return;
    }

    setCurrentShareLink({
      expiresAt: result.data.expiresAt,
      generatedAt: result.data.generatedAt,
      revokedAt: result.data.revokedAt,
      status: result.data.status
    });

    if (result.data.token) {
      const nextUrl = `${window.location.origin}/s/${result.data.token}`;
      setCopyableShareUrl(nextUrl);
      const copied = await copyShareUrl(nextUrl);

      if (!copied) {
        toast.showSuccess("分享链接已生成，请手动复制输入框中的链接。");
      }

      return;
    }

    setCopyableShareUrl(null);
    toast.showSuccess("分享链接已撤销，照看者将无法继续访问。");
  }

  async function copyShareUrl(url = copyableShareUrl) {
    if (!url) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.showSuccess("分享链接已复制。");
      return true;
    } catch {
      toast.showError("浏览器未允许自动复制，请手动复制输入框中的链接。");
      return false;
    }
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
                ? "计划已发布。每日任务已按到访时间排好，可在分享入口发送给照看者。"
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
                <dt>计划来源</dt>
                <dd className="text-[#101a32]">智能照护助手</dd>
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
            <ShareLinkPanel
              copyableShareUrl={copyableShareUrl}
              isPending={pendingAction === "share" || pendingAction === "revoke-share"}
              onCopy={() => copyShareUrl()}
              onRunShareAction={runShareAction}
              plan={currentPlan}
              shareLink={currentShareLink}
            />
          </CatCarePanel>
        </aside>
      </div>
    </div>
  );
}

function ShareLinkPanel({
  copyableShareUrl,
  isPending,
  onCopy,
  onRunShareAction,
  plan,
  shareLink
}: {
  copyableShareUrl: string | null;
  isPending: boolean;
  onCopy: () => void;
  onRunShareAction: (
    formData: FormData,
    action: (formData: FormData) => Promise<ShareLinkMutationResult>,
    actionName: "share" | "revoke-share"
  ) => Promise<void>;
  plan: CatCarePlan;
  shareLink: CarePlanShareLinkState;
}) {
  const status = getShareLinkStatusMeta(shareLink.status);
  const canGenerate = plan.status === "published";
  const canRevoke = shareLink.status === "active";

  return (
    <div className="mt-4 grid gap-4">
      <div className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          {shareLink.expiresAt ? (
            <span className="text-xs font-semibold text-[#526177]">
              过期：{formatShareDate(shareLink.expiresAt)}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#526177]">
          {getShareLinkDescription(plan.status, shareLink.status)}
        </p>
      </div>

      {copyableShareUrl ? (
        <div className="grid gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#526177]">
            本次生成的链接
          </label>
          <input
            className="w-full rounded-xl border border-[#d9e0ea] bg-white px-3 py-3 text-sm font-semibold text-[#101a32]"
            readOnly
            value={copyableShareUrl}
          />
          <CatCareButton onClick={onCopy} type="button" variant="ghost">
            复制链接
          </CatCareButton>
        </div>
      ) : null}

      <div className="grid gap-3">
        {canGenerate ? (
          <form
            action={(formData) =>
              onRunShareAction(formData, createCarePlanShareLinkLocalAction, "share")
            }
            className={isPending ? "pointer-events-none opacity-70" : ""}
          >
            <input name="planId" type="hidden" value={plan.id} />
            <CatCareButton type="submit">
              <CatCareShareLinkIcon className="h-5 w-5" />
              {shareLink.status === "active" ? "重新生成链接" : "生成分享链接"}
            </CatCareButton>
          </form>
        ) : null}
        {canRevoke ? (
          <form
            action={(formData) =>
              onRunShareAction(formData, revokeCarePlanShareLinkLocalAction, "revoke-share")
            }
            className={isPending ? "pointer-events-none opacity-70" : ""}
          >
            <input name="planId" type="hidden" value={plan.id} />
            <CatCareButton type="submit" variant="ghost">
              <CatCareXIcon />
              撤销链接
            </CatCareButton>
          </form>
        ) : null}
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

function getShareLinkStatusMeta(status: CarePlanShareLinkState["status"]) {
  if (status === "active") {
    return { className: "bg-[#e6f7f2] text-[#07847f]", label: "已生成" };
  }

  if (status === "expired") {
    return { className: "bg-[#fff8e6] text-[#8a5a00]", label: "已过期" };
  }

  if (status === "revoked") {
    return { className: "bg-[#f2f4f7] text-[#526177]", label: "已撤销" };
  }

  return { className: "bg-[#eef4ff] text-[#315a9f]", label: "未生成" };
}

function getShareLinkDescription(
  planStatus: CatCarePlan["status"],
  shareStatus: CarePlanShareLinkState["status"]
) {
  if (planStatus === "draft") {
    return "计划发布后才能生成私密分享链接。";
  }

  if (planStatus === "closed") {
    return "计划已关闭，不能生成新的分享链接；已撤销链接不会再允许照看者访问。";
  }

  if (shareStatus === "active") {
    return "链接已可分享。重新生成会撤销旧链接，并只显示一次新的可复制链接。";
  }

  if (shareStatus === "revoked") {
    return "链接已撤销，照看者无法继续访问。可以重新生成一个新链接。";
  }

  if (shareStatus === "expired") {
    return "链接已过期，照看者无法继续访问。可以重新生成一个新链接。";
  }

  return "生成后会得到一次性可复制链接；系统只保留安全校验信息，不保存完整链接。";
}

function formatShareDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
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
