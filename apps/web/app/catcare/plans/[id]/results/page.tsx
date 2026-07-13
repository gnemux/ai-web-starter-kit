import { notFound } from "next/navigation";

import { EmptyState, ErrorState } from "@xwlc/ui";

import { CatCareArrowLeftIcon } from "../../../catcare-action-icons";
import { CatCareTaskCategoryIcon } from "../../../catcare-item-type-icon";
import {
  CatCareButton,
  CatCarePanel
} from "../../../owner-flow-components";
import { getAiTextReviewState } from "@/lib/services/ai";
import {
  getAiCreditAllowanceUsage,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";
import { PaymentReturnNotice } from "@/app/account/payment/payment-return-notice";
import {
  getCatCarePlanDetail,
  type CatCarePlan
} from "@/lib/catcare/product-service";
import { CatCareAiRecapPanel } from "../../plan-ai-recap-client";
import { formatPlanCatNames } from "../../plan-cat-names";
import {
  buildPlanResultSummary,
  type PlanOverdueEntry,
  type PlanResultEntry,
  type PlanResultSummary
} from "../../plan-result-summary";
import { PlanScheduleView } from "../../plan-schedule-view";
import {
  formatOwnerLabel,
  getOwnerTagStyle
} from "../../plan-task-display";

type CatCarePlanResultsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkout_result?: string;
    payment_result?: string;
  }>;
};

export default async function CatCarePlanResultsPage({
  params,
  searchParams
}: CatCarePlanResultsPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [result, billingResult] = await Promise.all([
    getCatCarePlanDetail(id),
    getCurrentBillingEntitlements()
  ]);
  const aiUsage = billingResult.ok
    ? getAiCreditAllowanceUsage(billingResult.data.entitlements.ai_tokens)
    : null;

  if (!result.ok && result.error.code === "not_found") {
    notFound();
  }

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="需检查"
          description={`${result.error.code}: ${result.error.message}`}
          title="计划结果暂时不可用"
        />
      ) : (
        <PlanResults
          hasAiQuota={aiUsage ? aiUsage.remaining > 0 : true}
          paymentResult={query.payment_result ?? query.checkout_result}
          plan={result.data}
        />
      )}
    </>
  );
}

function PlanResults({
  hasAiQuota,
  paymentResult,
  plan
}: {
  hasAiQuota: boolean;
  paymentResult?: string;
  plan: CatCarePlan;
}) {
  const status = getPlanStatusMeta(plan.status);
  const resultSummary = buildPlanResultSummary(plan);
  const aiReviewState = getAiTextReviewState();

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
      <PaymentReturnNotice context="catcare" status={paymentResult} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
              {status.label}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resultSummary.statusClassName}`}>
              {resultSummary.statusLabel}
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-[#101a32]">
            {plan.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#526177]">
            主人侧查看照看者提交状态、异常重点和后续复盘入口。
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
            照护猫咪：{formatPlanCatNames(plan)}
          </p>
        </div>
        <CatCareButton href="/catcare/results" variant="secondary">
          <CatCareArrowLeftIcon />
          返回结果查看
        </CatCareButton>
      </div>

      <div className="grid gap-5">
        <CatCarePanel>
          <PlanResultOverview summary={resultSummary} />
          <PlanResultFocus summary={resultSummary} />
          {aiReviewState.ok ? (
            <CatCareAiRecapPanel
              hasAiQuota={hasAiQuota}
              initialRecapText={getStoredRecapText(plan)}
              isPlanClosed={plan.status === "closed"}
              isPlanDraft={plan.status === "draft"}
              mode={aiReviewState.data.mode}
              planId={plan.id}
              requestedCredits={aiReviewState.data.requestedCredits}
            />
          ) : (
            <div className="mt-6 rounded-2xl border border-[#e2e6ee] bg-white p-4">
              <p className="text-sm font-semibold text-[#101a32]">
                智能复盘暂不可用
              </p>
              <p className="mt-2 text-sm leading-6 text-[#526177]">
                {aiReviewState.error.message}
              </p>
            </div>
          )}
          <PlanOverdueList entries={resultSummary.overdueEntries} />

          {plan.handoffNotes ? (
            <section className="mt-5 rounded-2xl border border-[#f0d2b2] bg-[#fffaf5] p-5">
              <h2 className="text-lg font-semibold text-[#101a32]">
                主人交接说明
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#526177]">
                {plan.handoffNotes}
              </p>
            </section>
          ) : null}

          <PlanResultEntries summary={resultSummary} />

          <details className="mt-6 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
            <summary className="cursor-pointer text-base font-semibold text-[#07847f]">
              查看原计划日历
            </summary>
            <div className="mt-4">
              <PlanScheduleView
                description="用于回看发布时的执行安排；真实结果优先看上方提交状态。"
                plan={plan}
                title="原计划日历"
              />
            </div>
          </details>
        </CatCarePanel>
      </div>
    </div>
  );
}

function PlanOverdueList({ entries }: { entries: PlanOverdueEntry[] }) {
  if (entries.length === 0) {
    return null;
  }

  const visibleEntries = entries.slice(0, 8);
  const remainingCount = entries.length - visibleEntries.length;

  return (
    <section className="mt-5 rounded-2xl border border-[#f3b8ad] bg-[#fff7f5] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#101a32]">
            逾期未提交清单
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            这些日期已经过去，但没有收到对应任务的真实提交。
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#b7342c] ring-1 ring-[#f3b8ad]">
          {entries.length} 项待补交
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visibleEntries.map((entry) => (
          <article
            className="flex min-w-0 gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#f3d0c8]"
            key={entry.id}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-[#f3d0c8]">
              <CatCareTaskCategoryIcon
                category={entry.category}
                className="h-8 w-8"
                treatment="plain"
              />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#b7342c]">
                {formatResultServiceDate(entry.serviceDate)}
              </p>
              <h3 className="mt-1 truncate text-base font-semibold text-[#101a32]">
                {entry.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {entry.ownerLabel ? (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getOwnerTagStyle(entry.ownerLabel)}`}
                  >
                    {formatOwnerLabel(entry.ownerLabel)}
                  </span>
                ) : null}
                <span className="rounded-full bg-[#f2f4f7] px-2.5 py-1 text-xs font-semibold text-[#526177]">
                  {entry.categoryLabel}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {remainingCount > 0 ? (
        <p className="mt-3 text-xs font-semibold text-[#b7342c]">
          还有 {remainingCount} 项未展示，可按原计划日历逐项核对。
        </p>
      ) : null}
    </section>
  );
}

function PlanResultOverview({ summary }: { summary: PlanResultSummary }) {
  const noteCount = getResultNoteCount(summary);
  const reviewedCount = summary.completedCount + summary.attentionCount;
  const progressLabel =
    summary.totalCount > 0
      ? `${reviewedCount}/${summary.totalCount}`
      : String(reviewedCount);
  const riskLabel =
    summary.overdueCount > 0
      ? `${summary.overdueCount} 项逾期`
      : summary.pendingCount > 0
        ? `${summary.pendingCount} 项待提交`
        : "无未完成";
  const attentionLabel =
    summary.attentionCount > 0
      ? `${summary.attentionCount} 项异常`
      : noteCount > 0
        ? `${noteCount} 条备注`
        : "无异常备注";

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold leading-tight text-[#101a32]">
            照护结果概览
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            {summary.headline}
          </p>
        </div>
        <div className="rounded-full bg-[#f2fbf8] px-4 py-2 text-sm font-semibold text-[#07847f]">
          {summary.sourceLabel}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <ResultPriorityCard
          description={`${summary.completedCount} 项完成，${summary.attentionCount} 项需关注。`}
          label="完成概览"
          value={progressLabel}
        />
        <ResultPriorityCard
          description={
            summary.overdueCount > 0
              ? "这些日期已经过去，需要优先提醒补交。"
              : summary.pendingCount > 0
                ? "包含未来日期或仍未收到的结果。"
                : "当前没有待补交任务。"
          }
          label="未完成提醒"
          tone={summary.overdueCount > 0 ? "attention" : "neutral"}
          value={riskLabel}
        />
        <ResultPriorityCard
          description={
            summary.attentionCount > 0
              ? "先看异常说明，再决定是否联系照看者。"
              : noteCount > 0
                ? "备注里可能有食量、精神状态或现场补充。"
                : "没有异常或备注需要额外处理。"
          }
          label="异常备注"
          tone={summary.attentionCount > 0 ? "attention" : "neutral"}
          value={attentionLabel}
        />
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-[#75839a]">
        {summary.sourceDescription}
      </p>
    </section>
  );
}

function ResultPriorityCard({
  description,
  label,
  tone = "neutral",
  value
}: {
  description: string;
  label: string;
  tone?: "attention" | "neutral";
  value: string;
}) {
  const valueClassName = tone === "attention"
    ? "text-[#b7342c]"
    : "text-[#07847f]";
  const className = tone === "attention"
    ? "border-[#f3b8ad] bg-[#fff7f5]"
    : "border-[#d9eee7] bg-[#f2fbf8]";

  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <p className="text-sm font-semibold text-[#526177]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold leading-tight ${valueClassName}`}>
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
        {description}
      </p>
    </div>
  );
}

function PlanResultFocus({ summary }: { summary: PlanResultSummary }) {
  const noteCount = getResultNoteCount(summary);
  const focusItems = [
    summary.attentionCount > 0
      ? {
          description: "先查看异常说明和现场处理，再决定是否追问。",
          tone: "attention",
          title: `${summary.attentionCount} 项异常待看`
        }
      : null,
    summary.pendingCount > 0
      ? {
          description: "包含未来日期和可补交任务，不应直接按已完成处理。",
          tone: "pending",
          title: `${summary.pendingCount} 项未收到提交`
        }
      : null,
    summary.overdueCount > 0
      ? {
          description: "这些任务所属日期已经过去，应提醒照看者补提交或说明原因。",
          tone: "attention",
          title: `${summary.overdueCount} 项已过期未提交`
        }
      : null,
    noteCount > 0
      ? {
          description: "备注通常包含食量、精神状态、位置或现场补充。",
          tone: "note",
          title: `${noteCount} 条备注需要复看`
        }
      : null
  ].filter(Boolean) as Array<{
    description: string;
    title: string;
    tone: "attention" | "note" | "pending";
  }>;

  if (focusItems.length === 0) {
    focusItems.push({
      description: "没有异常、备注或未提交项，可以直接查看提交明细归档。",
      title: "暂无重点风险",
      tone: "note"
    });
  }

  return (
    <section className="mt-5 rounded-2xl border border-[#e2e6ee] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-semibold text-[#101a32]">优先处理</h2>
        <p className="text-sm font-semibold text-[#75839a]">
          按风险和备注排序，不用从明细里找。
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {focusItems.map((item) => (
          <div
            className={`rounded-2xl p-4 ring-1 ${getFocusClassName(item.tone)}`}
            key={item.title}
          >
            <h3 className="text-base font-semibold text-[#101a32]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function getResultNoteCount(summary: PlanResultSummary) {
  return summary.entries.filter((entry) => entry.note).length;
}

function getFocusClassName(tone: "attention" | "note" | "pending") {
  if (tone === "attention") {
    return "bg-[#fff4f2] ring-[#f3b8ad]";
  }

  if (tone === "pending") {
    return "bg-[#eef4ff] ring-[#cddbf8]";
  }

  return "bg-[#f2fbf8] ring-[#d9eee7]";
}

function PlanResultEntries({ summary }: { summary: PlanResultSummary }) {
  if (summary.entries.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          description="分享链接发出后，照看者提交的完成、异常和备注会按真实记录显示在这里。"
          title="暂无照看结果"
        />
      </div>
    );
  }

  const reviewEntries = summary.entries.filter(
    (entry) => entry.status === "attention" || Boolean(entry.note)
  );
  const detailEntries = summary.entries.filter(
    (entry) => entry.status !== "attention" && !entry.note
  );

  return (
    <section className="mt-6 grid gap-5">
      {reviewEntries.length > 0 ? (
        <ResultEntryGroup
          entries={reviewEntries}
          title="异常与备注"
        />
      ) : null}
      {detailEntries.length > 0 ? (
        <details
          className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4"
          open={reviewEntries.length === 0}
        >
          <summary className="cursor-pointer text-base font-semibold text-[#07847f]">
            提交明细（{detailEntries.length} 项）
          </summary>
          <div className="mt-4">
            <ResultEntryGroup entries={detailEntries} />
          </div>
        </details>
      ) : null}
    </section>
  );
}

function ResultEntryGroup({
  entries,
  title
}: {
  entries: PlanResultEntry[];
  title?: string;
}) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      {title ? (
        <h2 className="text-xl font-semibold text-[#101a32]">{title}</h2>
      ) : null}
      <div className={title ? "mt-4 grid gap-0" : "grid gap-0"}>
        {entries.map((entry) => (
          <ResultEntryCard entry={entry} key={entry.id} />
        ))}
      </div>
    </div>
  );
}

function ResultEntryCard({ entry }: { entry: PlanResultEntry }) {
  const isAttention = entry.status === "attention";
  const statusClassName = isAttention
    ? "bg-[#fff3f0] text-[#b7342c]"
    : "bg-[#e6f7f2] text-[#07847f]";
  const dotClassName = isAttention
    ? "border-[#f3b8ad] bg-[#fff3f0]"
    : "border-[#bfe5d7] bg-[#e6f7f2]";

  return (
    <article className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-3">
      <div className="relative flex justify-center">
        <span className="absolute bottom-0 top-11 w-px bg-[#e2e6ee]" />
        <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold text-[#07847f] sm:h-9 sm:w-9 ${dotClassName}`}>
          {isAttention ? "!" : "✓"}
        </span>
      </div>
      <div className="pb-4">
        <div className="rounded-2xl border border-[#e2e6ee] bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              {entry.category ? (
                <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f7fbf9] ring-1 ring-[#d9eee7] sm:h-11 sm:w-11">
                  <CatCareTaskCategoryIcon
                    category={entry.category}
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    treatment="plain"
                  />
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#07847f]">
                  {formatResultTime(entry)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {entry.ownerLabel ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getOwnerTagStyle(entry.ownerLabel)}`}
                    >
                      {formatOwnerLabel(entry.ownerLabel)}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#526177]">
                    {entry.categoryLabel}
                  </span>
                </div>
                <h3 className="mt-3 break-words text-base font-semibold leading-6 text-[#101a32] sm:text-lg">
                  {entry.title}
                </h3>
              </div>
            </div>
            <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>
              {entry.statusLabel}
            </span>
          </div>
          {entry.note ? (
            <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#526177]">
              {entry.note}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function formatResultTime(entry: PlanResultEntry) {
  const serviceDate = entry.serviceDate
    ? formatResultServiceDate(entry.serviceDate)
    : "日期待记录";
  const submittedAt = entry.createdAt
    ? new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        month: "numeric",
        day: "numeric",
        timeZone: "Asia/Shanghai"
      }).format(new Date(entry.createdAt))
    : "提交时间待记录";

  return `${serviceDate} · ${submittedAt} 提交`;
}

function formatResultServiceDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Shanghai"
  }).format(new Date(`${value}T00:00:00+08:00`));
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

function getStoredRecapText(plan: CatCarePlan) {
  const summary = plan.aiInputSummary;

  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return null;
  }

  const recap = summary.result_recap;

  if (!recap || typeof recap !== "object" || Array.isArray(recap)) {
    return null;
  }

  return typeof recap.text === "string" ? recap.text : null;
}
