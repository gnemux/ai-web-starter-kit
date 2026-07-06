"use client";

import { useMemo, useState } from "react";

import type { CatCarePlan } from "@/lib/catcare/product-service";

import { CatCareXIcon } from "../catcare-action-icons";
import { buildPlanSchedule, type PlanScheduleEntry } from "./plan-schedule";
import {
  getCategoryLabel,
  getCategoryStyle,
  isAttentionEntry,
  parseTaskTitle
} from "./plan-task-display";

export function PlanScheduleView({
  description,
  plan,
  title = "执行日历"
}: {
  description: string;
  plan: CatCarePlan;
  title?: string;
}) {
  const schedule = useMemo(() => buildPlanSchedule(plan), [plan]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const taskCount = schedule.reduce((count, day) => count + day.entries.length, 0);
  const selectedDay = selectedDate
    ? schedule.find((day) => day.date === selectedDate)
    : null;
  const firstDay = schedule[0];

  if (schedule.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-[#fbfdfc] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#101a32]">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#e6f7f2] px-4 py-2 text-sm font-semibold text-[#07847f]">
          {schedule.length} 天 / {taskCount} 项
        </span>
      </div>

      {firstDay ? (
        <HandoffBrief entries={firstDay.entries} handoffNotes={plan.handoffNotes} />
      ) : null}

      <div className="mt-5 grid items-start gap-3 xl:grid-cols-2">
        {schedule.map((day) => {
          const summary = summarizeDay(day.entries);

          return (
            <article
              className="overflow-hidden rounded-2xl border border-[#e2e6ee] bg-white"
              key={day.date}
            >
              <div className="border-b border-[#e2e6ee] bg-[#fbfdfc] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[#101a32]">
                      {formatDateLabel(day.date)}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-[#75839a]">
                      {day.date}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <span className="rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f]">
                      {summary.visitCount} 次到访
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
                      {day.entries.length} 项
                    </span>
                  </div>
                </div>

                {summary.highlights.length > 0 ? (
                  <div className="mt-4 rounded-xl bg-white px-3 py-2 ring-1 ring-[#edf1f5]">
                    <p className="text-xs font-semibold text-[#75839a]">
                      今日重点
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#101a32]">
                      {formatDayHighlights(summary.highlights)}
                    </p>
                  </div>
                ) : null}

                {summary.visits.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    {summary.visits.slice(0, 3).map((visit) => (
                      <div
                        className="flex min-w-0 items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-[#edf1f5]"
                        key={visit.timeLabel}
                      >
                        <span className="shrink-0 rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f]">
                          {visit.timeLabel}
                        </span>
                        <p className="min-w-0 truncate text-sm font-semibold text-[#101a32]">
                          {visit.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {summary.attentionCount > 0 ? (
                  <p className="mt-3 text-xs font-semibold text-[#75839a]">
                    含 {summary.attentionCount} 项观察/交接事项
                  </p>
                ) : null}
              </div>

              {day.entries.length > 0 ? (
                <div className="border-t border-[#e2e6ee] px-4 py-3">
                  <button
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#07847f] bg-white px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#f2fbf8]"
                    onClick={() => setSelectedDate(day.date)}
                    type="button"
                  >
                    查看当天安排
                  </button>
                </div>
              ) : (
                <p className="px-4 py-6 text-sm font-semibold text-[#75839a]">
                  当日没有固定任务。
                </p>
              )}
            </article>
          );
        })}
      </div>

      {selectedDay ? (
        <DayTaskDialog
          day={selectedDay}
          onClose={() => setSelectedDate(null)}
        />
      ) : null}
    </section>
  );
}

function HandoffBrief({
  entries,
  handoffNotes
}: {
  entries: PlanScheduleEntry[];
  handoffNotes: string | null;
}) {
  const sections = buildDaySections(entries);

  if (sections.length === 0 && !handoffNotes) {
    return null;
  }

  return (
    <div className="mt-5 rounded-2xl border border-[#bfe5d7] bg-[#f2fbf8] p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[#101a32]">
          交接说明与到访安排
        </h3>
        <p className="text-sm font-semibold leading-6 text-[#526177]">
          照看者先看主人交代，再按每天的到访卡片执行。
        </p>
      </div>
      {handoffNotes ? (
        <div className="mt-4 rounded-xl bg-white px-4 py-3 ring-1 ring-[#d9eee7]">
          <p className="text-sm font-semibold text-[#07847f]">
            主人交代
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#101a32]">
            {handoffNotes}
          </p>
        </div>
      ) : null}
      <div className="mt-4 grid gap-3">
        {sections.map((section) => (
          <div
            className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#d9eee7]"
            key={section.label}
          >
            <p className="text-sm font-semibold text-[#07847f]">
              {section.label}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#101a32]">
              {formatBriefActions(section.entries)}。
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayTaskDialog({
  day,
  onClose
}: {
  day: ReturnType<typeof buildPlanSchedule>[number];
  onClose: () => void;
}) {
  const summary = summarizeDay(day.entries);
  const sections = buildDaySections(day.entries);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#101a32]/45 p-4"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e2e6ee] bg-white shadow-2xl shadow-slate-900/20"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e2e6ee] bg-[#fbfdfc] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#75839a]">{day.date}</p>
            <h3 className="mt-1 text-2xl font-semibold text-[#101a32]">
              {formatDateLabel(day.date)}任务
            </h3>
          </div>
          <button
            aria-label="关闭"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d9e0ea] bg-white text-[#526177] transition hover:border-[#07847f]/50 hover:bg-[#f7fbfa]"
            onClick={onClose}
            type="button"
          >
            <CatCareXIcon />
          </button>
        </div>

        <div className="max-h-[calc(88vh-5rem)] overflow-y-auto px-5 py-5">
          <div className="grid gap-2 sm:grid-cols-3">
            <SummaryPill label="到访批次" value={`${summary.visitCount} 次`} />
            <SummaryPill label="执行任务" value={`${summary.actionCount} 项`} />
            <SummaryPill label="关注事项" value={`${summary.attentionCount} 项`} />
          </div>

          <div className="mt-5 grid gap-4">
            {sections.map((section) => (
              <section
                className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4"
                key={section.label}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-[#101a32]">
                    {section.label}
                  </h4>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#75839a] ring-1 ring-[#d9e0ea]">
                    {section.entries.length} 项
                  </span>
                </div>
                <div className="grid gap-3">
                  {section.entries.map((entry, index) => (
                    <TaskLine
                      entry={entry}
                      key={`${entry.task.id}-${index}`}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-[#edf1f5]">
      <p className="text-[11px] font-semibold text-[#75839a]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#101a32]">{value}</p>
    </div>
  );
}

function TaskLine({ entry }: { entry: PlanScheduleEntry }) {
  const title = parseTaskTitle(entry.task.title);

  return (
    <div
      className={`min-w-0 rounded-xl border-l-4 px-3 py-2 ring-1 ring-[#edf1f5] ${
        entry.task.required
          ? "border-l-[#07847f] bg-[#fbfdfc]"
          : "border-l-[#d9e0ea] bg-white text-[#526177]"
      }`}
      title={entry.task.required ? "必做任务" : "可选任务"}
    >
      <div className="flex flex-wrap items-center gap-2">
        {title.owner ? (
          <span className="rounded-full bg-[#e6f7f2] px-2.5 py-1 text-xs font-semibold text-[#07847f]">
            {title.owner}
          </span>
        ) : null}
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryStyle(entry.task.category)}`}>
          {getCategoryLabel(entry.task.category)}
        </span>
        <p
          className={`min-w-0 text-sm font-semibold leading-6 ${
            entry.task.required ? "text-[#101a32]" : "text-[#526177]"
          }`}
        >
          {title.action}
        </p>
      </div>
      {entry.task.instructions ? (
        <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-5 text-[#75839a]">
          {entry.task.instructions}
        </p>
      ) : null}
    </div>
  );
}

function summarizeDay(entries: PlanScheduleEntry[]) {
  const attentionEntries = entries.filter(isAttentionEntry);
  const actionEntries = entries.filter((entry) => !isAttentionEntry(entry));
  const visitCount = new Set(
    actionEntries.map((entry) => entry.timeLabel ?? "18:30")
  ).size;
  const highlights = actionEntries
    .filter((entry) => entry.task.required)
    .map((entry) => ({
      category: getCategoryLabel(entry.task.category),
      title: parseTaskTitle(entry.task.title).action
    }));
  const visits = groupScheduleEntries(actionEntries).map((group) => ({
    summary: formatVisitCardSummary(group.entries),
    timeLabel: group.timeLabel
  }));

  return {
    actionCount: actionEntries.length,
    attentionCount: attentionEntries.length,
    highlights: dedupeHighlights(highlights),
    visits,
    visitCount
  };
}

function dedupeHighlights(
  highlights: Array<{ category: string; title: string }>
) {
  return Array.from(
    new Map(
      highlights.map((item) => [`${item.category}:${item.title}`, item])
    ).values()
  );
}

function buildDaySections(entries: PlanScheduleEntry[]) {
  const actionEntries = entries.filter((entry) => !isAttentionEntry(entry));
  const attentionEntries = entries.filter(isAttentionEntry);
  const sections = [
    ...groupScheduleEntries(actionEntries).map((group) => ({
      entries: group.entries,
      label: `${group.timeLabel} 到访`
    })),
    { entries: attentionEntries, label: "关注事项" }
  ];

  return sections.filter((section) => section.entries.length > 0);
}

function formatBriefActions(entries: PlanScheduleEntry[]) {
  const actions = Array.from(
    new Set(entries.map((entry) => parseTaskTitle(entry.task.title).action))
  );
  const visible = actions.slice(0, 6);

  if (actions.length > visible.length) {
    return `重点完成${visible.join("、")}等 ${actions.length} 项`;
  }

  return `完成${visible.join("、")}`;
}

function formatDayHighlights(
  highlights: Array<{ category: string; title: string }>
) {
  const counts = new Map<string, number>();

  for (const item of highlights) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  const categories = Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([category, count]) => `${category} ${count} 项`);
  const titles = Array.from(new Set(highlights.map((item) => item.title))).slice(0, 3);

  if (categories.length > 0 && titles.length > 0) {
    return `${categories.join("、")}；重点：${titles.join("、")}`;
  }

  return titles.join("、");
}

function formatVisitCardSummary(entries: PlanScheduleEntry[]) {
  const actions = Array.from(
    new Set(entries.map((entry) => parseTaskTitle(entry.task.title).action))
  );

  if (actions.length <= 3) {
    return actions.join("、");
  }

  return `${actions.slice(0, 3).join("、")}等 ${actions.length} 项`;
}

function groupScheduleEntries(
  entries: PlanScheduleEntry[]
) {
  const groups: Array<{
    entries: PlanScheduleEntry[];
    timeLabel: string;
  }> = [];

  for (const entry of entries) {
    const timeLabel = entry.timeLabel || "18:30";
    const previous = groups[groups.length - 1];

    if (previous?.timeLabel === timeLabel) {
      previous.entries.push(entry);
    } else {
      groups.push({ entries: [entry], timeLabel });
    }
  }

  return groups;
}

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return weekdays[parsed.getUTCDay()] ?? date;
}
