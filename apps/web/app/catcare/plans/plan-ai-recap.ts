import type { PlanResultSummary } from "./plan-result-summary";

export function getCatCareAiRecapAvailability(input: {
  hasAiQuota: boolean;
  isPlanClosed: boolean;
  isPlanDraft: boolean;
}) {
  if (input.isPlanDraft) {
    return { canGenerate: false, reason: "draft" as const };
  }

  if (input.isPlanClosed) {
    return { canGenerate: false, reason: "closed" as const };
  }

  if (!input.hasAiQuota) {
    return { canGenerate: false, reason: "quota_exhausted" as const };
  }

  return { canGenerate: true, reason: null };
}

export function buildCatCarePlanAiRecapPrompt(input: {
  planTitle: string;
  statusLabel: string;
  summary: PlanResultSummary;
}) {
  const topOverdue = input.summary.overdueEntries
    .slice(0, 5)
    .map((entry) => `${entry.serviceDate} ${entry.categoryLabel} ${entry.title}`)
    .join("；") || "无";
  const attentionTitles = input.summary.entries
    .filter((entry) => entry.status === "attention")
    .slice(0, 5)
    .map((entry) => `${entry.categoryLabel} ${entry.title}`)
    .join("；") || "无";

  return [
    "为主人生成猫咪照护结果复盘，输出中文，简洁、可执行。",
    "只能依据下面的结构化统计，不要编造照片、联系人、医疗诊断或未提供的细节。",
    `计划：${input.planTitle}`,
    `计划状态：${input.statusLabel}`,
    `完成概览：${input.summary.completedCount} 项完成，${input.summary.attentionCount} 项异常，${input.summary.pendingCount} 项未提交，${input.summary.overdueCount} 项逾期。`,
    `逾期重点：${topOverdue}`,
    `异常重点：${attentionTitles}`,
    "输出三段：完成摘要、需要提醒、后续建议。"
  ].join("\n");
}
