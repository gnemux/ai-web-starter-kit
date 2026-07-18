"use client";

import type { AnonymousCareTaskSubmissionView } from "@/lib/catcare/product-service";

import {
  formatTaskAction,
  getOwnerTagStyle
} from "../../catcare/plans/plan-task-display";
import type {
  AnonymousServiceDay,
  AnonymousTask
} from "./visit-model";

export function CatOwnerBadge({ name }: { name: string }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ring-1 ${getOwnerTagStyle(name)}`}
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
  status: AnonymousCareTaskSubmissionView["status"]
) {
  if (status === "exception") {
    return "已提交异常";
  }

  if (status === "note") {
    return "已提交备注";
  }

  return "已提交完成";
}

export function formatDaySummary(day: AnonymousServiceDay) {
  const visitCount = day.visits.length;
  const taskCount = day.visits.reduce(
    (total, visit) => total + visit.tasks.length,
    0
  );

  return `${visitCount} 次到访 · ${taskCount} 项任务`;
}

export function formatFrequency(value: string | null) {
  if (!value) {
    return "按现场情况执行";
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

export function formatVisitSummary(tasks: AnonymousTask[]) {
  const actions = Array.from(
    new Set(tasks.map((task) => formatTaskAction(task.title)))
  );
  const visible = actions.slice(0, 3);

  if (actions.length > visible.length) {
    return `完成${visible.join("、")}等 ${actions.length} 项`;
  }

  return `完成${visible.join("、")}`;
}
