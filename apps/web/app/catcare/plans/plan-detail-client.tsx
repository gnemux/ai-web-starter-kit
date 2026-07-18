"use client";

import { useState } from "react";

import {
  CatCareArrowLeftIcon,
  CatCareCalendarIcon,
  CatCareCopyIcon,
  CatCareLinkIcon,
  CatCareSaveIcon,
  CatCareXIcon
} from "../catcare-action-icons";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import {
  CatCareButton,
  CatCarePanel,
  CatCareStepBar
} from "../owner-flow-components";
import {
  closeCatCarePlanLocalAction,
  createCarePlanShareLinkLocalAction,
  revokeCarePlanShareLinkLocalAction,
  saveAndPublishCatCarePlanLocalAction,
  updateCatCarePlanTasksLocalAction
} from "../actions";
import type {
  CarePlanShareLinkMutation,
  CarePlanShareLinkState,
  CatCareAuditActivity,
  CatCarePlan,
  CatCareTask
} from "@/lib/catcare/product-service";
import { PlanScheduleView } from "./plan-schedule-view";
import {
  AuditActivityList,
  ShareLinkPanel,
  createImmediateShareActivity,
  getShareLinkStatusMeta
} from "./plan-detail-security";
import {
  PlanMetricCard,
  TaskCard,
  formatPlanDateRange,
  formatPlanDisplayTitle,
  formatScenario,
  getPlanStatusMeta,
  isLegacyPrepareTask
} from "./plan-detail-summary";
import { PlanConfirmationSummary } from "./plan-confirmation-summary";
import { PlanTaskSaveForm } from "./plan-task-save-form-client";
import { formatPlanCatNames } from "./plan-cat-names";

type PlanMutationResult =
  | { data: CatCarePlan; ok: true }
  | { error: { message: string }; ok: false };

type ShareLinkMutationResult =
  | { data: CarePlanShareLinkMutation; ok: true }
  | { error: { message: string }; ok: false };

export function PlanDetailClient({
  auditActivities,
  itemOptions = [],
  justClosed,
  justPublished,
  justSaved,
  plan,
  shareLinkState
}: {
  auditActivities: CatCareAuditActivity[];
  itemOptions?: string[];
  justClosed: boolean;
  justPublished: boolean;
  justSaved: boolean;
  plan: CatCarePlan;
  shareLinkState: CarePlanShareLinkState;
}) {
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [currentShareLink, setCurrentShareLink] = useState(shareLinkState);
  const [currentAuditActivities, setCurrentAuditActivities] = useState(auditActivities);
  const [copyableShareUrl, setCopyableShareUrl] = useState<string | null>(null);
  const toast = useCatCareToast();
  const [pendingAction, setPendingAction] = useState<
    "close" | "publish" | "save" | "share" | "revoke-share" | null
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
  const taskFormId = `catcare-plan-tasks-${currentPlan.id}`;

  async function runPlanAction(
    formData: FormData,
    action: (formData: FormData) => Promise<PlanMutationResult>,
    actionName: "close"
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
    toast.showSuccess("计划已关闭，历史清单和照护结果已保留");
  }

  async function runShareAction(
    formData: FormData,
    action: (formData: FormData) => Promise<ShareLinkMutationResult>,
    actionName: "share" | "revoke-share"
  ) {
    setPendingAction(actionName);

    let result: ShareLinkMutationResult;

    try {
      result = await action(formData);
    } catch {
      setPendingAction(null);
      toast.showError("分享操作暂时没有完成，请稍后重试");
      return;
    }

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
    setCurrentAuditActivities((activities) => [
      createImmediateShareActivity(
        actionName,
        actionName === "share" && currentShareLink.status === "active",
        result.data
      ),
      ...activities
    ]);

    if (result.data.token) {
      const nextUrl = `${window.location.origin}/s/${result.data.token}`;
      setCopyableShareUrl(nextUrl);
      const copied = await copyShareUrl(nextUrl);

      if (!copied) {
        toast.showSuccess("分享链接已生成，请手动复制输入框中的链接");
      }

      return;
    }

    setCopyableShareUrl(null);
    toast.showSuccess("分享链接已撤销，照看者将无法继续访问");
  }

  async function copyShareUrl(url = copyableShareUrl) {
    if (!url) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.showSuccess("分享链接已复制");
      return true;
    } catch {
      toast.showError("浏览器未允许自动复制，请手动复制输入框中的链接");
      return false;
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
      <CatCareToast
        message={
          justClosed
            ? "计划已关闭，历史清单和照护结果已保留"
            : justSaved
              ? "清单微调已保存，确认无误后可以发布"
              : justPublished
                ? "计划已发布，每日任务已按到访时间排好，可在分享入口发送给照看者"
                : null
        }
        toast={toast.toast}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-semibold text-[#101a32]">
            {canPublish ? "智能生成与清单确认" : "照护计划总览"}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            {canPublish
              ? "先检查生成清单，必要时微调任务，再发布给照看者。"
              : "先确认执行日历和交接说明，再生成私密链接给照看者。"}
          </p>
        </div>
        <CatCareButton href="/catcare/plans" variant="secondary">
          <CatCareArrowLeftIcon />
          返回计划记录
        </CatCareButton>
      </div>
      {canPublish ? (
        <CatCareStepBar
          steps={[
            { label: "选择场景" },
            { label: "时间与频率" },
            { label: "智能输入总结" },
            { active: true, label: "生成清单" }
          ]}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CatCarePanel>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start">
            <div className="min-w-0">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-[#101a32]">
                {displayTitle}
              </h2>
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
                <CatCareButton
                  disabled={pendingAction !== null}
                  form={taskFormId}
                  name="intent"
                  type="submit"
                  value="publish"
                >
                  <CatCareSaveIcon />
                  {pendingAction === "publish" ? "正在保存并发布…" : "保存并发布"}
                </CatCareButton>
              ) : (
                <CatCareButton href={`/catcare/plans/${currentPlan.id}/results`}>
                  <CatCareCalendarIcon />
                  查看照护反馈
                </CatCareButton>
              )}
              {canClose ? (
                <form
                  action={(formData) =>
                    runPlanAction(formData, closeCatCarePlanLocalAction, "close")
                  }
                  className={pendingAction ? "pointer-events-none opacity-70" : ""}
                >
                  <input name="planId" type="hidden" value={currentPlan.id} />
                  <CatCareButton disabled={pendingAction !== null} type="submit" variant="ghost">
                    <CatCareXIcon />
                    结束计划
                  </CatCareButton>
                </form>
              ) : null}
            </div>
          </div>

          <PlanConfirmationSummary canEdit={canPublish} plan={visiblePlan} />

          {!canPublish ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <PlanMetricCard
                label="执行日期"
                value={formatPlanDateRange(currentPlan)}
              />
              <PlanMetricCard
                label="任务数量"
                value={`${visiblePlan.tasks.length} 项`}
              />
              <PlanMetricCard
                label="照护对象"
                value={formatPlanCatNames(currentPlan)}
              />
            </div>
          ) : null}

          {canPublish ? (
            <PlanTaskSaveForm
              action={updateCatCarePlanTasksLocalAction}
              blocked={pendingAction !== null}
              formId={taskFormId}
              itemOptions={itemOptions}
              onPendingChange={setPendingAction}
              onPublished={(publishedPlan) =>
                setCurrentPlan((previous) => ({
                  ...previous,
                  ...publishedPlan,
                  submissions: previous.submissions,
                  tasks: publishedPlan.tasks
                }))
              }
              onSaved={(result) =>
                setCurrentPlan((previous) => ({
                  ...previous,
                  handoffNotes: result.handoffNotes,
                  tasks: result.tasks
                }))
              }
              plan={visiblePlan}
              planId={currentPlan.id}
              publishAction={saveAndPublishCatCarePlanLocalAction}
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
            <h2 className="text-xl font-semibold text-[#101a32]">
              {canPublish ? "生成摘要" : "计划状态"}
            </h2>
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
              {!canPublish ? (
                <div className="flex justify-between gap-4">
                  <dt>分享状态</dt>
                  <dd className="text-[#101a32]">
                    {getShareLinkStatusMeta(currentShareLink.status).label}
                  </dd>
                </div>
              ) : null}
            </dl>
          </CatCarePanel>

          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">
              分享入口
            </h2>
            <ShareLinkPanel
              copyableShareUrl={copyableShareUrl}
              onCopy={() => copyShareUrl()}
              onRunShareAction={runShareAction}
              pendingAction={
                pendingAction === "share" || pendingAction === "revoke-share"
                  ? pendingAction
                  : null
              }
              plan={currentPlan}
              shareLink={currentShareLink}
            />
          </CatCarePanel>

          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">
              分享与安全记录
            </h2>
            <AuditActivityList activities={currentAuditActivities} />
          </CatCarePanel>
        </aside>
      </div>
    </div>
  );
}
