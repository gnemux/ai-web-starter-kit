import type { CatCarePlan } from "@/lib/catcare/product-service";

export function formatPlanCatNames(plan: CatCarePlan) {
  if (plan.participants.length > 0) {
    return plan.participants
      .map((participant) =>
        participant.deletedAt
          ? `${participant.nameSnapshot}（已删除）`
          : participant.nameSnapshot
      )
      .join("、");
  }

  const summary = plan.aiInputSummary;
  const names =
    summary && typeof summary === "object" && !Array.isArray(summary)
      ? (summary as { catNames?: unknown; cat_names?: unknown })
      : null;
  const catNames = normalizeNameList(names?.catNames ?? names?.cat_names);

  if (catNames.length > 0) {
    return catNames.join("、");
  }

  return plan.catId ? "当前猫咪" : "未选择猫咪";
}

export function getPlanCatNames(plan: CatCarePlan) {
  if (plan.participants.length > 0) {
    return plan.participants.map((participant) => participant.nameSnapshot);
  }

  const formatted = formatPlanCatNames(plan);
  return formatted === "当前猫咪" || formatted === "未选择猫咪"
    ? []
    : formatted.split("、");
}

function normalizeNameList(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((name) => String(name).trim())
        .filter((name) => name.length > 0)
    : [];
}
