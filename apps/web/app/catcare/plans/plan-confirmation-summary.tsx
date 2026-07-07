import type { CatCarePlan } from "@/lib/catcare/product-service";

import { formatPlanCatNames } from "./plan-cat-names";
import { buildPlanSchedule, type PlanScheduleEntry } from "./plan-schedule";
import { formatTaskAction, isAttentionEntry } from "./plan-task-display";

export function PlanConfirmationSummary({
  canEdit,
  plan
}: {
  canEdit: boolean;
  plan: CatCarePlan;
}) {
  const dayCount = getPlanDayCount(plan);
  const requiredCount = plan.tasks.filter((task) => task.required).length;
  const optionalCount = plan.tasks.length - requiredCount;
  const firstDay = buildPlanSchedule(plan)[0];
  const visitSections = firstDay
    ? groupPlanVisits(firstDay.entries.filter((entry) => !isAttentionEntry(entry)))
    : [];
  const attentionCount = firstDay
    ? firstDay.entries.filter(isAttentionEntry).length
    : 0;

  return (
    <section className="mt-6 rounded-2xl border border-[#d9eee7] bg-[#f2fbf8] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#101a32]">
            照护计划确认
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            {canEdit
              ? "先确认照护范围和每天到访安排；只有不符合预期的任务需要在下方微调。"
              : "照护范围和每天到访安排已生成；照看者按执行日历查看每日重点。"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
          {dayCount ? `${dayCount} 天` : "未设日期"}，{plan.tasks.length} 项
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <PlanMetric label="照护猫咪" value={formatPlanCatNames(plan)} />
        <PlanMetric
          label="到访安排"
          value={
            visitSections.length > 0
              ? `每日约 ${visitSections.length} 次`
              : "按现场情况"
          }
        />
        <PlanMetric
          label="任务构成"
          value={`${requiredCount} 项必做，${optionalCount} 项可选`}
        />
      </div>

      <div className="mt-4 rounded-xl bg-white px-4 py-3 ring-1 ring-[#d9eee7]">
        <p className="text-sm font-semibold text-[#07847f]">
          发布前重点确认
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#101a32]">
          猫咪、日期和到访次数是否正确；任务明细只需要调整明显不符合实际照护的部分。
        </p>
      </div>

      {plan.handoffNotes ? (
        <div className="mt-4 rounded-xl bg-white px-4 py-3 ring-1 ring-[#d9eee7]">
          <p className="text-sm font-semibold text-[#07847f]">主人交代</p>
          <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#101a32]">
            {plan.handoffNotes}
          </p>
        </div>
      ) : null}

      {visitSections.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {visitSections.map((section, index) => (
            <div
              className="rounded-xl bg-white p-4 ring-1 ring-[#d9eee7]"
              key={section.timeLabel}
            >
              <p className="text-sm font-semibold text-[#07847f]">
                第 {index + 1} 次到访 · {section.timeLabel}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#101a32]">
                {formatVisitSummary(section.entries)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {attentionCount > 0 ? (
        <p className="mt-4 text-sm font-semibold text-[#526177]">
          另有 {attentionCount} 项观察/交接事项会随执行日历展示。
        </p>
      ) : null}
    </section>
  );
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#d9eee7]">
      <p className="text-xs font-semibold text-[#75839a]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[#101a32]">{value}</p>
    </div>
  );
}

function groupPlanVisits(entries: PlanScheduleEntry[]) {
  const groups: Array<{ entries: PlanScheduleEntry[]; timeLabel: string }> = [];

  for (const entry of entries) {
    const timeLabel = entry.timeLabel ?? "18:30";
    const previous = groups.at(-1);

    if (previous?.timeLabel === timeLabel) {
      previous.entries.push(entry);
    } else {
      groups.push({ entries: [entry], timeLabel });
    }
  }

  return groups;
}

function formatVisitSummary(entries: PlanScheduleEntry[]) {
  const actions = Array.from(
    new Set(entries.map((entry) => formatTaskAction(entry.task.title)))
  );

  if (actions.length <= 3) {
    return actions.join("、");
  }

  return `${actions.slice(0, 3).join("、")}等 ${actions.length} 项`;
}

function getPlanDayCount(plan: CatCarePlan) {
  if (!plan.startOn || !plan.endOn) {
    return 0;
  }

  const start = new Date(`${plan.startOn}T00:00:00Z`).getTime();
  const end = new Date(`${plan.endOn}T00:00:00Z`).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 0;
  }

  return Math.floor((end - start) / 86_400_000) + 1;
}
