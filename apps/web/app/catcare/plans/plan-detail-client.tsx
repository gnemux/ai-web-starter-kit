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

function createImmediateShareActivity(
  actionName: "share" | "revoke-share",
  regenerated: boolean,
  result: CarePlanShareLinkMutation
): CatCareAuditActivity {
  const occurredAt =
    actionName === "share"
      ? result.generatedAt ?? new Date().toISOString()
      : result.revokedAt ?? new Date().toISOString();

  if (actionName === "share") {
    return {
      description: "拿到有效链接的人可以查看授权照护信息。",
      id: `local-share-${occurredAt}`,
      kind: "success",
      occurredAt,
      title: regenerated ? "私密链接已重新生成" : "私密链接已生成"
    };
  }

  return {
    description: "旧链接不能继续访问，已提交结果仍保留。",
    id: `local-revoke-${occurredAt}`,
    kind: "warning",
    occurredAt,
    title: "私密链接已撤销"
  };
}

function AuditActivityList({
  activities
}: {
  activities: CatCareAuditActivity[];
}) {
  if (activities.length === 0) {
    return (
      <p className="mt-3 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] px-4 py-3 text-sm font-semibold leading-6 text-[#526177]">
        暂无分享访问记录。生成链接、撤销链接或照看者提交后，这里会显示给主人看的安全活动。
      </p>
    );
  }

  return (
    <ol className="mt-4 grid gap-3">
      {activities.map((activity) => (
        <li
          className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-3"
          key={activity.id}
        >
          <span
            className={`mt-1 h-3 w-3 rounded-full ${getAuditActivityDotClass(activity.kind)}`}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#101a32]">
                {activity.title}
              </h3>
              <time className="text-xs font-semibold text-[#75839a]">
                {formatShareDate(activity.occurredAt)}
              </time>
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
              {activity.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function getAuditActivityDotClass(kind: CatCareAuditActivity["kind"]) {
  if (kind === "success") {
    return "bg-[#07847f]";
  }

  if (kind === "warning") {
    return "bg-[#d1662f]";
  }

  return "bg-[#6f7fa3]";
}

function PlanMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9eee7] bg-[#f2fbf8] px-4 py-3">
      <p className="text-xs font-semibold text-[#526177]">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-[#101a32]">
        {value}
      </p>
    </div>
  );
}

function ShareLinkPanel({
  copyableShareUrl,
  onCopy,
  onRunShareAction,
  pendingAction,
  plan,
  shareLink
}: {
  copyableShareUrl: string | null;
  onCopy: () => void;
  onRunShareAction: (
    formData: FormData,
    action: (formData: FormData) => Promise<ShareLinkMutationResult>,
    actionName: "share" | "revoke-share"
  ) => Promise<void>;
  pendingAction: "share" | "revoke-share" | null;
  plan: CatCarePlan;
  shareLink: CarePlanShareLinkState;
}) {
  const status = getShareLinkStatusMeta(shareLink.status);
  const canGenerate = plan.status === "published";
  const canRevoke = shareLink.status === "active";
  const hasCopyableShareUrl = Boolean(copyableShareUrl);
  const isActiveShareLink = shareLink.status === "active";

  return (
    <div className="mt-4 grid gap-4">
      <div className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          {shareLink.expiresAt && shareLink.status !== "revoked" ? (
            <span className="text-xs font-semibold text-[#526177]">
              {shareLink.status === "active" ? "有效期至" : "过期"}：
              {formatShareDate(shareLink.expiresAt)}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#526177]">
          {getShareLinkDescription(plan.status, shareLink.status)}
        </p>
      </div>

      {copyableShareUrl ? (
        <div className="grid gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#526177]">
            本次生成的链接
          </span>
          <div className="rounded-xl border border-[#d9e0ea] bg-white px-3 py-3 text-sm font-semibold text-[#101a32]">
            <span className="block truncate">{formatShareUrlPreview(copyableShareUrl)}</span>
          </div>
        </div>
      ) : null}

      <div className="grid w-full gap-3 [&_form]:w-full [&_button]:w-full">
        {isActiveShareLink ? (
          hasCopyableShareUrl ? (
            <CatCareButton fullWidth onClick={onCopy} type="button">
              <CatCareCopyIcon />
              分享链接
            </CatCareButton>
          ) : (
            <div className="grid gap-2">
              <span
                aria-disabled="true"
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#d9e0ea] bg-[#f7f9fb] px-5 text-base font-semibold leading-none text-[#98a4b5] [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5"
              >
                <CatCareLinkIcon />
                分享链接
              </span>
              <span className="text-xs font-semibold leading-5 text-[#66758c]">
                完整链接只在生成后显示一次；需要再次分享时请重新生成。
              </span>
            </div>
          )
        ) : null}
        <div
          className={`grid gap-3 ${
            isActiveShareLink && canGenerate && canRevoke ? "grid-cols-2" : "sm:max-w-[18rem]"
          }`}
        >
        {canGenerate ? (
          <form
            action={(formData) =>
              onRunShareAction(formData, createCarePlanShareLinkLocalAction, "share")
            }
            aria-busy={pendingAction === "share"}
            className={pendingAction ? "pointer-events-none opacity-70" : ""}
          >
            <input name="planId" type="hidden" value={plan.id} />
            <CatCareButton
              disabled={pendingAction !== null}
              fullWidth
              type="submit"
              variant={isActiveShareLink && hasCopyableShareUrl ? "secondary" : "primary"}
            >
              <CatCareLinkIcon />
              {pendingAction === "share"
                ? isActiveShareLink
                  ? "正在重新生成…"
                  : "正在生成链接…"
                : isActiveShareLink
                  ? "重新生成"
                  : "生成分享链接"}
            </CatCareButton>
          </form>
        ) : null}
        {canRevoke ? (
          <form
            action={(formData) =>
              onRunShareAction(formData, revokeCarePlanShareLinkLocalAction, "revoke-share")
            }
            aria-busy={pendingAction === "revoke-share"}
            className={pendingAction ? "pointer-events-none opacity-70" : ""}
          >
            <input name="planId" type="hidden" value={plan.id} />
            <CatCareButton
              disabled={pendingAction !== null}
              fullWidth
              type="submit"
              variant="ghost"
            >
              <CatCareXIcon />
              {pendingAction === "revoke-share" ? "正在撤销…" : "撤销链接"}
            </CatCareButton>
          </form>
        ) : null}
        </div>
      </div>
      <p className="rounded-xl bg-[#fff4e8] px-4 py-3 text-sm font-semibold leading-6 text-[#b85d00] ring-1 ring-[#efd1ad]">
        安全提醒：这是私密链接，任何拿到有效链接的人都能查看授权照护信息并提交结果，请只发给可信照看者。重新生成会撤销旧链接，已提交结果仍保留。
      </p>
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

function formatPlanDateRange(plan: CatCarePlan) {
  if (!plan.startOn) {
    return "未设日期";
  }

  return plan.endOn && plan.endOn !== plan.startOn
    ? `${plan.startOn} 至 ${plan.endOn}`
    : plan.startOn;
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

function formatShareUrlPreview(value: string) {
  const [origin, token] = value.split("/s/");

  if (!origin || !token || token.length <= 14) {
    return value;
  }

  return `${origin}/s/${token.slice(0, 6)}...${token.slice(-6)}`;
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
      <div className="flex flex-wrap justify-end gap-2 self-start">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
          {task.required ? "必做" : "可选"}
        </span>
        {task.photoRequired ? (
          <span className="rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
            需照片
          </span>
        ) : null}
      </div>
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
