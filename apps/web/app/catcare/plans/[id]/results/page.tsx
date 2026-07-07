import { notFound } from "next/navigation";

import { EmptyState, ErrorState } from "@xwlc/ui";

import {
  CatCareArrowLeftIcon,
  CatCareCalendarIcon,
  CatCareSearchIcon
} from "../../../catcare-action-icons";
import {
  CatCareButton,
  CatCarePanel
} from "../../../owner-flow-components";
import {
  getCatCarePlanDetail,
  type CatCarePlan
} from "@/lib/catcare/product-service";
import {
  buildPlanResultSummary,
  type PlanResultEntry,
  type PlanResultSummary
} from "../../plan-result-summary";
import { PlanScheduleView } from "../../plan-schedule-view";

type CatCarePlanResultsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CatCarePlanResultsPage({
  params
}: CatCarePlanResultsPageProps) {
  const { id } = await params;
  const result = await getCatCarePlanDetail(id);

  if (!result.ok && result.error.code === "not_found") {
    notFound();
  }

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="Needs review"
          description={`${result.error.code}: ${result.error.message}`}
          title="计划结果暂时不可用"
        />
      ) : (
        <PlanResults plan={result.data} />
      )}
    </>
  );
}

function PlanResults({ plan }: { plan: CatCarePlan }) {
  const status = getPlanStatusMeta(plan.status);
  const resultSummary = buildPlanResultSummary(plan);

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
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
        </div>
        <CatCareButton href={`/catcare/plans/${plan.id}`} variant="secondary">
          <CatCareArrowLeftIcon />
          返回计划
        </CatCareButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CatCarePanel>
          <PlanResultOverview summary={resultSummary} />

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

        <aside className="grid content-start gap-5">
          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">
              分享给照看者
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#526177]">
              计划详情页可以生成私密链接；照看者通过链接查看任务并提交完成、备注或异常。
            </p>
            <div className="mt-5 flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] px-5 text-base font-semibold text-[#526177]">
              <CatCareCalendarIcon />
              分享入口在计划详情页
            </div>
          </CatCarePanel>

          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">
              智能复盘
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#526177]">
              后续会基于真实提交、异常反馈和照片生成复盘重点；当前不接实时智能能力或真实扣费。
            </p>
            <div className="mt-5 flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#07847f] bg-white px-5 text-base font-semibold text-[#07847f]">
              <CatCareSearchIcon />
              复盘入口待接入
            </div>
          </CatCarePanel>
        </aside>
      </div>
    </div>
  );
}

function PlanResultOverview({ summary }: { summary: PlanResultSummary }) {
  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#101a32]">
            结果摘要
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            {summary.headline}
          </p>
        </div>
        <div className="rounded-full bg-[#f2fbf8] px-4 py-2 text-sm font-semibold text-[#07847f]">
          {summary.sourceLabel}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ResultMetricCard label="已完成" value={summary.completedCount} />
        <ResultMetricCard
          label="需关注"
          tone={summary.attentionCount > 0 ? "attention" : "neutral"}
          value={summary.attentionCount}
        />
        <ResultMetricCard label="待提交" value={summary.pendingCount} />
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-[#75839a]">
        {summary.sourceDescription}
      </p>
    </section>
  );
}

function ResultMetricCard({
  label,
  tone = "neutral",
  value
}: {
  label: string;
  tone?: "attention" | "neutral";
  value: number;
}) {
  const valueClassName = tone === "attention" && value > 0
    ? "text-[#b7342c]"
    : "text-[#101a32]";

  return (
    <div className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
      <p className="text-sm font-semibold text-[#75839a]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
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

  const attentionEntries = summary.entries.filter(
    (entry) => entry.status === "attention"
  );
  const completedEntries = summary.entries.filter(
    (entry) => entry.status !== "attention"
  );

  return (
    <section className="mt-6 grid gap-5">
      {attentionEntries.length > 0 ? (
        <ResultEntryGroup
          entries={attentionEntries}
          title="优先查看"
        />
      ) : null}
      <ResultEntryGroup
        entries={completedEntries}
        title={attentionEntries.length > 0 ? "已完成记录" : "结果记录"}
      />
    </section>
  );
}

function ResultEntryGroup({
  entries,
  title
}: {
  entries: PlanResultEntry[];
  title: string;
}) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#101a32]">{title}</h2>
      <div className="mt-4 grid gap-0">
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
    <article className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3">
      <div className="relative flex justify-center">
        <span className="absolute bottom-0 top-11 w-px bg-[#e2e6ee]" />
        <span className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border text-xs font-semibold text-[#07847f] ${dotClassName}`}>
          {isAttention ? "!" : "✓"}
        </span>
      </div>
      <div className="pb-4">
        <div className="rounded-2xl border border-[#e2e6ee] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#07847f]">
                {entry.serviceDate
                  ? `${entry.serviceDate} · ${entry.createdAt ?? "提交时间待记录"}`
                  : entry.createdAt ?? "提交时间待记录"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {entry.ownerLabel ? (
                  <span className="rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f]">
                    {entry.ownerLabel}
                  </span>
                ) : null}
                <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#526177]">
                  {entry.categoryLabel}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#101a32]">
                {entry.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#75839a]">
                {entry.submittedByLabel}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>
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
