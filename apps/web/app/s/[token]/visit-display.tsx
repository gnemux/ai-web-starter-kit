"use client";

import type { AnonymousCareTaskSubmissionView } from "@/lib/catcare/product-service";

import {
  formatTaskAction,
  getOwnerTagStyle
} from "../../catcare/plans/plan-task-display";
import type {
  AnonymousServiceDay,
  AnonymousTask,
  ShareHandoffLabels
} from "./visit-model";

export function CatOwnerBadge({
  name,
  styleOwner
}: {
  name: string;
  styleOwner?: string | null;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ring-1 ${getOwnerTagStyle(styleOwner ?? name)}`}
    >
      {name}
    </span>
  );
}

export function getTaskKey(task: AnonymousTask) {
  return `${task.serviceDate}:${task.visitTime}:${task.submissionRef}`;
}

export function isDaySubmitted(day: AnonymousServiceDay, submittedTaskKeys: Set<string>) {
  const tasks = day.visits.flatMap((visit) => visit.tasks);

  return (
    tasks.length > 0 &&
    tasks.every((task) => submittedTaskKeys.has(getTaskKey(task)))
  );
}

export function formatSubmissionStatus(
  status: AnonymousCareTaskSubmissionView["status"],
  labels: ShareHandoffLabels
) {
  if (status === "exception") {
    return labels.submittedException;
  }

  if (status === "note") {
    return labels.submittedNote;
  }

  return labels.submittedCompleted;
}

export function formatDaySummary(
  day: AnonymousServiceDay,
  labels: ShareHandoffLabels
) {
  const visitCount = day.visits.length;
  const taskCount = day.visits.reduce(
    (total, visit) => total + visit.tasks.length,
    0
  );

  return labels.daySummary
    .replace("{visits}", String(visitCount))
    .replace("{tasks}", String(taskCount));
}

export function formatFrequency(
  value: string | null,
  labels: ShareHandoffLabels
) {
  if (!value) {
    return labels.asNeededFrequency;
  }

  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value);
  const count = match?.[2] ?? "1";

  if (match?.[1] === "weekly") {
    return labels.weeklyFrequency.replace("{count}", count);
  }

  if (match?.[1] === "every_2_days") {
    return labels.everyTwoDaysFrequency.replace("{count}", count);
  }

  return labels.dailyFrequency.replace("{count}", count);
}

export function formatVisitSummary(
  tasks: AnonymousTask[],
  labels: ShareHandoffLabels
) {
  const actions = Array.from(
    new Set(tasks.map((task) => formatTaskAction(task.title)))
  );
  const visible = actions.slice(0, 3);
  const items = visible.join(labels.listSeparator);

  if (actions.length > visible.length) {
    return labels.visitSummaryMore
      .replace("{items}", items)
      .replace("{count}", String(actions.length));
  }

  return labels.visitSummary.replace("{items}", items);
}

export function formatShareCategory(
  category: AnonymousTask["category"],
  labels: ShareHandoffLabels
) {
  return {
    environment: labels.categoryEnvironment,
    litter: labels.categoryLitter,
    meal: labels.categoryMeal,
    medicine: labels.categoryMedicine,
    observe: labels.categoryObserve,
    other: labels.categoryOther,
    play: labels.categoryPlay,
    treat: labels.categoryTreat,
    water: labels.categoryWater
  }[category ?? "other"];
}

export function formatShareOwner(
  owner: string | null | undefined,
  labels: ShareHandoffLabels
) {
  if (!owner || owner === "家庭共用") {
    return labels.allCats;
  }

  return owner;
}
