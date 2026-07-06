import { EmptyState, ErrorState } from "@xwlc/ui";
import Link from "next/link";

import { CatCareCalendarIcon } from "../catcare-action-icons";
import { CatCarePanel } from "../owner-flow-components";
import {
  getCatCarePlanResultsWorkspace,
  type CatCarePlan
} from "@/lib/catcare/product-service";

export default async function CatCareResultsPage() {
  const result = await getCatCarePlanResultsWorkspace();

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="Needs review"
          description={`${result.error.code}: ${result.error.message}`}
          title="结果查看暂时不可用"
        />
      ) : (
        <div className="mx-auto grid w-full max-w-[1196px] gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#101a32]">
              结果查看
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#526177]">
              查看主人侧计划状态、提交入口预览和后续 AI 复盘入口。匿名提交、分享链接和 live AI 不在本阶段范围。
            </p>
          </div>
          <CatCarePanel>
            {result.data.plans.length > 0 ? (
              <div className="grid gap-3">
                {result.data.plans.map((plan) => (
                  <ResultPlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            ) : (
              <EmptyState
                description="发布照护计划后，这里会出现结果查看入口。"
                title="还没有可查看的计划"
              />
            )}
          </CatCarePanel>
        </div>
      )}
    </>
  );
}

function ResultPlanCard({ plan }: { plan: CatCarePlan }) {
  const status = getPlanStatusMeta(plan.status);
  const submissionCount = plan.submissionCount ?? plan.submissions.length;
  const resultLabel = getResultLabel(plan, submissionCount);

  return (
    <Link
      className="grid gap-3 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4 transition hover:border-[#07847f]/40 hover:bg-white"
      href={`/catcare/plans/${plan.id}/results`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#101a32]">
            {formatPlanDisplayTitle(plan)}
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#526177]">
            {resultLabel}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#526177]">
            照护猫咪：{formatPlanCatNames(plan)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#526177]">
        <CatCareCalendarIcon className="h-4 w-4 text-[#07847f]" />
        查看结果与 AI 复盘入口
      </span>
    </Link>
  );
}

function getResultLabel(plan: CatCarePlan, submissionCount: number) {
  if (submissionCount > 0) {
    return `${submissionCount} 条提交待查看`;
  }

  if (plan.status === "closed") {
    return "已关闭，暂无提交记录";
  }

  if (plan.status === "draft") {
    return "计划待发布";
  }

  return "等待真实提交";
}

function getPlanStatusMeta(status: CatCarePlan["status"]) {
  if (status === "closed") {
    return {
      className: "bg-[#f2f4f7] text-[#526177]",
      label: "已关闭"
    };
  }

  if (status === "published") {
    return {
      className: "bg-[#e6f7f2] text-[#07847f]",
      label: "已发布"
    };
  }

  if (status === "reviewed") {
    return {
      className: "bg-[#eef4ff] text-[#315a9f]",
      label: "已复盘"
    };
  }

  return {
    className: "bg-[#fff8e6] text-[#8a5a00]",
    label: "待发布"
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
