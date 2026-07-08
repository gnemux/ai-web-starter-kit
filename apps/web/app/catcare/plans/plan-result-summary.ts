import type {
  CatCarePlan,
  CatCareSubmission,
  CatCareTask
} from "@/lib/catcare/product-service";

import {
  getCategoryLabel,
  parseTaskTitle
} from "./plan-task-display";
import { getAnonymousCarePlanServiceDates } from "@/lib/catcare/product-service/anonymous-submission-policy";

export type PlanResultEntry = {
  category: CatCareTask["category"] | null;
  id: string;
  categoryLabel: string;
  createdAt: string | null;
  note: string | null;
  ownerLabel: string | null;
  serviceDate: string | null;
  status: "attention" | "completed" | "pending";
  statusLabel: string;
  submittedByLabel: string;
  title: string;
};

export type PlanOverdueEntry = {
  category: CatCareTask["category"];
  categoryLabel: string;
  id: string;
  ownerLabel: string | null;
  serviceDate: string;
  title: string;
};

export type PlanResultSummary = {
  attentionCount: number;
  completedCount: number;
  entries: PlanResultEntry[];
  headline: string;
  overdueCount: number;
  overdueEntries: PlanOverdueEntry[];
  pendingCount: number;
  sourceDescription: string;
  sourceLabel: string;
  statusClassName: string;
  statusLabel: string;
  totalCount: number;
};

export function buildPlanResultSummary(plan: CatCarePlan): PlanResultSummary {
  const tasks = plan.tasks.filter((task) => task.enabled);
  const serviceDates = getAnonymousCarePlanServiceDates(plan.startOn, plan.endOn);
  const totalCount = tasks.length * serviceDates.length;
  const overdueEntries = buildOverdueEntries(tasks, serviceDates, []);
  const overdueCount = overdueEntries.length;

  if (plan.submissions.length > 0) {
    return buildRealSubmissionSummary(plan, tasks, serviceDates, totalCount);
  }

  if (plan.status === "draft") {
    return {
      attentionCount: 0,
      completedCount: 0,
      entries: [],
      headline: "计划还在确认中，发布后才会等待照看者提交结果。",
      overdueCount: 0,
      overdueEntries: [],
      pendingCount: totalCount,
      sourceDescription: "发布前不会生成照看者提交记录。",
      sourceLabel: "待发布",
      statusClassName: "bg-[#fff8e6] text-[#8a5a00]",
      statusLabel: "待确认",
      totalCount
    };
  }

  if (plan.status === "closed") {
    return {
      attentionCount: 0,
      completedCount: 0,
      entries: [],
      headline: "计划已关闭，且没有收到提交记录。",
      overdueCount,
      overdueEntries,
      pendingCount: totalCount,
      sourceDescription: "未分享或未执行的关闭计划可以保留历史，也可以在计划列表删除。",
      sourceLabel: "无提交",
      statusClassName: "bg-[#f2f4f7] text-[#526177]",
      statusLabel: "已关闭未执行",
      totalCount
    };
  }

  return {
    attentionCount: 0,
    completedCount: 0,
    entries: [],
    headline: overdueCount > 0
      ? `已过日期仍有 ${overdueCount} 项未提交，需要提醒照看者补交。`
      : "计划已发布，正在等待照看者提交结果。",
    overdueCount,
    overdueEntries,
    pendingCount: totalCount,
    sourceDescription: "当前没有真实提交记录。分享链接发出后，照看者提交的完成、备注和异常会显示在这里。",
    sourceLabel: "暂无提交",
    statusClassName: "bg-[#eef4ff] text-[#315a9f]",
    statusLabel: "待真实提交",
    totalCount
  };
}

function buildRealSubmissionSummary(
  plan: CatCarePlan,
  tasks: CatCareTask[],
  serviceDates: string[],
  totalCount: number
): PlanResultSummary {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const planLevelSubmissions: CatCareSubmission[] = [];
  const taskSubmissions: CatCareSubmission[] = [];

  for (const submission of plan.submissions) {
    if (!submission.taskId) {
      planLevelSubmissions.push(submission);
      continue;
    }

    taskSubmissions.push(submission);
  }

  const entries = [
    ...taskSubmissions.map((submission) =>
      submissionToEntry(submission, taskById.get(submission.taskId ?? ""))
    ),
    ...planLevelSubmissions.map((submission) => submissionToEntry(submission, null))
  ].sort(compareResultEntries);
  const attentionCount = entries.filter((entry) => entry.status === "attention").length;
  const completedCount = entries.filter((entry) => entry.status === "completed").length;
  const pendingCount = Math.max(totalCount - taskSubmissions.length, 0);
  const overdueEntries = buildOverdueEntries(tasks, serviceDates, taskSubmissions);
  const overdueCount = overdueEntries.length;
  const status =
    attentionCount > 0
      ? {
          className: "bg-[#fff8e6] text-[#8a5a00]",
          label: "有异常待看"
        }
      : pendingCount > 0
        ? {
            className: "bg-[#eef4ff] text-[#315a9f]",
            label: "部分完成"
          }
        : {
            className: "bg-[#e6f7f2] text-[#07847f]",
            label: "已完成"
          };

  return {
    attentionCount,
    completedCount,
    entries,
    headline: formatRealHeadline(
      completedCount,
      attentionCount,
      pendingCount,
      overdueCount
    ),
    overdueCount,
    overdueEntries,
    pendingCount,
    sourceDescription: "来自照看者通过分享链接提交的真实结果。",
    sourceLabel: "真实提交",
    statusClassName: status.className,
    statusLabel: status.label,
    totalCount
  };
}

function buildOverdueEntries(
  tasks: CatCareTask[],
  serviceDates: string[],
  taskSubmissions: CatCareSubmission[]
): PlanOverdueEntry[] {
  const today = getTodayIsoDate();
  const overdueDates = serviceDates.filter((date) => date < today);

  if (overdueDates.length === 0) {
    return [];
  }

  const submittedTaskDates = new Set(taskSubmissions.flatMap((submission) => {
    const serviceDate = getServiceDateFromSubmission(submission);

    if (!submission.taskId || !serviceDate) {
      return [];
    }

    return [`${submission.taskId}:${serviceDate}`];
  }));

  return overdueDates.flatMap((serviceDate) =>
    tasks.flatMap((task) => {
      if (submittedTaskDates.has(`${task.id}:${serviceDate}`)) {
        return [];
      }

      const parsedTitle = parseTaskTitle(task.title);

      return [{
        category: task.category,
        categoryLabel: getCategoryLabel(task.category),
        id: `${task.id}:${serviceDate}`,
        ownerLabel: parsedTitle.owner,
        serviceDate,
        title: parsedTitle.action
      }];
    })
  );
}

function getTodayIsoDate() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric"
  }).format(new Date());
}

function compareResultEntries(left: PlanResultEntry, right: PlanResultEntry) {
  return (
    (left.serviceDate ?? "").localeCompare(right.serviceDate ?? "") ||
    (left.createdAt ?? "").localeCompare(right.createdAt ?? "") ||
    left.title.localeCompare(right.title, "zh-Hans-CN")
  );
}

function submissionToEntry(
  submission: CatCareSubmission,
  task: CatCareTask | null | undefined
): PlanResultEntry {
  const parsedTitle = task ? parseTaskTitle(task.title) : null;
  const isAttention =
    submission.abnormal ||
    submission.status === "exception";

  return {
    category: task?.category ?? null,
    id: submission.id,
    categoryLabel: task ? getCategoryLabel(task.category) : "整体反馈",
    createdAt: submission.createdAt,
    note: submission.note,
    ownerLabel: parsedTitle?.owner ?? null,
    serviceDate: getServiceDateFromSubmission(submission),
    status: isAttention ? "attention" : "completed",
    statusLabel: isAttention
      ? "需关注"
      : submission.note
        ? "已完成 · 有备注"
        : "已完成",
    submittedByLabel: submission.submittedByLabel,
    title: parsedTitle?.action ?? "整体反馈"
  };
}

function getServiceDateFromSubmission(submission: CatCareSubmission) {
  const match = /^anonymous:[^:]+:(\d{4}-\d{2}-\d{2}):/.exec(
    submission.idempotencyKey ?? ""
  );

  return match?.[1] ?? null;
}

function formatRealHeadline(
  completedCount: number,
  attentionCount: number,
  pendingCount: number,
  overdueCount: number
) {
  if (attentionCount > 0) {
    return `收到 ${attentionCount} 项需关注反馈，优先查看异常说明。`;
  }

  if (overdueCount > 0) {
    return `已过日期仍有 ${overdueCount} 项未提交，需要提醒照看者补交。`;
  }

  if (pendingCount > 0) {
    return `已有 ${completedCount} 项完成，仍有 ${pendingCount} 项未收到结果。`;
  }

  return `全部 ${completedCount} 项已收到完成反馈。`;
}
