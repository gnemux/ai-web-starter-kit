export type CatCarePlanId = "free" | "plus" | "pro";

type CatCareLimitResult =
  | { ok: true; data: true }
  | {
      ok: false;
      error: {
        code: "validation_error";
        message: string;
      };
    };

export type CatCarePlanLimits = {
  aiSummaryUses: number;
  maxCats: number | null;
  maxItems: number | null;
};

const catCarePlanLimits: Record<CatCarePlanId, CatCarePlanLimits> = {
  free: {
    aiSummaryUses: 2,
    maxCats: 1,
    maxItems: 20
  },
  plus: {
    aiSummaryUses: 12,
    maxCats: 3,
    maxItems: 80
  },
  pro: {
    aiSummaryUses: 25,
    maxCats: null,
    maxItems: null
  }
};

export function getCatCarePlanLimits(planId: CatCarePlanId) {
  return catCarePlanLimits[planId];
}

export function formatCatCareLimit(value: number | null, unit: string) {
  return value === null ? `不限${unit}` : `${value} ${unit}`;
}

export function formatCatCareAiUsageLabel(input: {
  planId: CatCarePlanId;
  usedUses: number;
}) {
  const total = getCatCarePlanLimits(input.planId).aiSummaryUses;
  const used = Math.min(input.usedUses, total);
  const remaining = Math.max(total - used, 0);

  return `${remaining} / ${total}`;
}

export function assertCatCarePlanCatSelection(input: {
  selectedCatCount: number;
  planId: CatCarePlanId;
}): CatCareLimitResult {
  const limit = getCatCarePlanLimits(input.planId).maxCats;

  if (limit !== null && input.selectedCatCount > limit) {
    return limitError(`当前套餐最多可为 ${limit} 只猫咪生成照护计划。`);
  }

  return limitOk();
}

export function assertCatCarePlanCatCreation(input: {
  currentCatCount: number;
  planId: CatCarePlanId;
}): CatCareLimitResult {
  const limit = getCatCarePlanLimits(input.planId).maxCats;

  if (limit !== null && input.currentCatCount >= limit) {
    return limitError(`当前套餐最多可保存 ${limit} 只猫咪；已保存猫咪不会被删除。`);
  }

  return limitOk();
}

export function assertCatCarePlanItemCreation(input: {
  currentItemCount: number;
  planId: CatCarePlanId;
}): CatCareLimitResult {
  const limit = getCatCarePlanLimits(input.planId).maxItems;

  if (limit !== null && input.currentItemCount >= limit) {
    return limitError(`当前套餐最多可保存 ${limit} 件用品；已保存用品不会被删除。`);
  }

  return limitOk();
}

function limitOk(): CatCareLimitResult {
  return { ok: true, data: true };
}

function limitError(message: string): CatCareLimitResult {
  return {
    ok: false,
    error: {
      code: "validation_error",
      message
    }
  };
}
