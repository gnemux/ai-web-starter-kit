"use client";

import type {
  CatCarePlan,
  CatCareTask
} from "@/lib/catcare/product-service";

export function PlanMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9eee7] bg-[#f2fbf8] px-4 py-3">
      <p className="text-xs font-semibold text-[#526177]">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-[#101a32]">
        {value}
      </p>
    </div>
  );
}

export function isLegacyPrepareTask(task: CatCareTask) {
  return task.source === "care_item" || task.title.includes("：准备 ");
}

export function formatPlanDisplayTitle(plan: CatCarePlan) {
  const range = plan.startOn
    ? ` ${plan.startOn}${plan.endOn ? ` 至 ${plan.endOn}` : ""}`
    : "";

  return range && plan.title.endsWith(range)
    ? plan.title.slice(0, -range.length)
    : plan.title;
}

export function formatPlanDateRange(plan: CatCarePlan) {
  if (!plan.startOn) {
    return "未设日期";
  }

  return plan.endOn && plan.endOn !== plan.startOn
    ? `${plan.startOn} 至 ${plan.endOn}`
    : plan.startOn;
}

export function getPlanStatusMeta(status: CatCarePlan["status"]) {
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

export function TaskCard({
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

export function formatScenario(scenario: CatCarePlan["scenario"]) {
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

