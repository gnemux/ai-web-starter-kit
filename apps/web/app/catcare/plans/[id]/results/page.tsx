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

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-[#101a32]">
            {plan.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#526177]">
            按日期查看每日重点、系统预排时间和后续提交记录。
          </p>
        </div>
        <CatCareButton href={`/catcare/plans/${plan.id}`} variant="secondary">
          <CatCareArrowLeftIcon />
          返回计划
        </CatCareButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CatCarePanel>
          <PlanScheduleView
            description="已按计划日期展开。任务会按系统预排时间排序，主人发布前的微调会直接体现在这里。"
            plan={plan}
          />

          <h2 className="mt-8 text-2xl font-semibold text-[#101a32]">
            提交记录
          </h2>
          {plan.submissions.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {plan.submissions.map((submission) => (
                <article
                  className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4"
                  key={submission.id}
                >
                  <h3 className="text-lg font-semibold text-[#101a32]">
                    {submission.submittedByLabel}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#526177]">
                    {submission.status} · {submission.createdAt}
                  </p>
                  {submission.note ? (
                    <p className="mt-3 text-sm leading-6 text-[#526177]">
                      {submission.note}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                description="分享给照看者并接入提交页后，每次照护反馈会出现在这里。"
                title="暂无照看者提交"
              />
            </div>
          )}
        </CatCarePanel>

        <aside className="grid content-start gap-5">
          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">
              分享给照看者
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#526177]">
              当前阶段不生成匿名分享链接。正式分享页接入后，这里会提供一键复制入口。
            </p>
            <div className="mt-5 flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] px-5 text-base font-semibold text-[#526177]">
              <CatCareCalendarIcon />
              分享入口待接入
            </div>
          </CatCarePanel>

          <CatCarePanel>
            <h2 className="text-xl font-semibold text-[#101a32]">
              AI 复盘
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#526177]">
              后续会基于照看者提交记录生成异常提醒和复盘重点。
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
