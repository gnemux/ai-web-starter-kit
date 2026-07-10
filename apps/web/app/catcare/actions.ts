"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  serviceError,
  type ServiceResult
} from "@xwlc/core";

import { closeCatCarePlan } from "@/lib/catcare/product-service";
import { copyCatCareRoutineFromFormData } from "@/lib/catcare/product-service";
import { createCarePlanShareLink } from "@/lib/catcare/product-service";
import { createCatCareCatFromFormData } from "@/lib/catcare/product-service";
import { createCatCareEventFromFormData } from "@/lib/catcare/product-service";
import { createCatCareItemFromFormData } from "@/lib/catcare/product-service";
import { createCatCarePlanFromFormData } from "@/lib/catcare/product-service";
import { deleteCatCareCatFromFormData } from "@/lib/catcare/product-service";
import { deleteCatCareEventFromFormData } from "@/lib/catcare/product-service";
import { deleteCatCareLibraryItemFromFormData } from "@/lib/catcare/product-service";
import { deleteCatCarePlan } from "@/lib/catcare/product-service";
import { getCatCarePlanDetail } from "@/lib/catcare/product-service";
import { publishCatCarePlan } from "@/lib/catcare/product-service";
import { revokeCarePlanShareLink } from "@/lib/catcare/product-service";
import { saveCatCarePlanAiRecap } from "@/lib/catcare/product-service";
import { saveCatCareRoutineFromFormData } from "@/lib/catcare/product-service";
import { unassignCatCareItemFromFormData } from "@/lib/catcare/product-service";
import { updateCatCareCatFromFormData } from "@/lib/catcare/product-service";
import { updateCatCareEventFromFormData } from "@/lib/catcare/product-service";
import { updateCatCareLibraryItemFromFormData } from "@/lib/catcare/product-service";
import { updateCatCarePlanTasksFromFormData } from "@/lib/catcare/product-service";
import { updateCatCareLibraryItemNotesFromFormData } from "@/lib/catcare/product-service";
import { assertCatCarePlanCatSelection } from "@/lib/catcare/plan-limits";
import { generateAiText } from "@/lib/services/ai";
import { getCurrentBillingEntitlements } from "@/lib/services/billing";

import { buildCatCarePlanGenerationPrompt } from "./plans/plan-ai-generation";
import { buildCatCarePlanAiRecapPrompt } from "./plans/plan-ai-recap";
import { buildPlanResultSummary } from "./plans/plan-result-summary";

export type CatCareAiRecapActionState = {
  result: ServiceResult<CatCareAiRecapActionData>;
} | null;

type CatCareAiRecapActionData = {
  consumedCredits: number;
  reason: string;
  status: "blocked" | "failed" | "succeeded";
  text: string | null;
  usageRecordStatus: string;
};

export async function createCatCareCatAction(formData: FormData) {
  const result = await createCatCareCatFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");

  const intent = String(formData.get("intent") ?? "draft");
  redirect(
    intent === "routine"
      ? `/catcare/routines?cat_id=${result.data.id}`
      : `/catcare/cats/${result.data.id}?saved=created`
  );
}

export async function updateCatCareCatAction(formData: FormData) {
  const result = await updateCatCareCatFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");
  revalidatePath(`/catcare/cats/${result.data.id}`);
  revalidatePath(`/catcare/cats/${result.data.id}/edit`);

  const intent = String(formData.get("intent") ?? "view");
  redirect(
    intent === "routine"
      ? `/catcare/routines?cat_id=${result.data.id}`
      : `/catcare/cats/${result.data.id}?saved=updated`
  );
}

export async function deleteCatCareCatAction(formData: FormData) {
  const result = await deleteCatCareCatFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");
  revalidatePath(`/catcare/cats/${result.data.id}`);

  redirect("/catcare/cats?saved=deleted");
}

export async function saveCatCareRoutineAction(formData: FormData) {
  const result = await saveCatCareRoutineFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/routines");

  const intent = String(formData.get("intent") ?? "stay");

  redirect(
    intent === "items"
      ? `/catcare/items?cat_id=${result.data.catId}`
      : `/catcare/routines?cat_id=${result.data.catId}&saved=1`
  );
}

export async function saveCatCareRoutineLocalAction(formData: FormData) {
  return saveCatCareRoutineFromFormData(formData);
}

export async function copyCatCareRoutineAction(formData: FormData) {
  const result = await copyCatCareRoutineFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/routines");
  revalidatePath("/catcare/items");

  redirect(`/catcare/routines?cat_id=${result.data.catId}&copied=1`);
}

export async function createCatCareItemAction(formData: FormData) {
  const result = await createCatCareItemFromFormData(formData);
  const currentCatId = String(formData.get("currentCatId") ?? "").trim();
  const itemType = encodeURIComponent(
    String(formData.get("itemType") ?? "dry_food").trim() || "dry_food"
  );

  if (!result.ok) {
    redirect(
      currentCatId
        ? `/catcare/items?cat_id=${currentCatId}&error=save_failed&item_type=${itemType}`
        : `/catcare/items?error=save_failed&item_type=${itemType}`
    );
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(
    result.data.catId
      ? `/catcare/items?cat_id=${result.data.catId}&saved=1&item_type=${itemType}`
      : `/catcare/items?saved=1&item_type=${itemType}`
  );
}

export async function createCatCareItemLocalAction(formData: FormData) {
  return createCatCareItemFromFormData(formData);
}

export async function unassignCatCareItemAction(formData: FormData) {
  const result = await unassignCatCareItemFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(`/catcare/items?cat_id=${result.data.catId}&saved=1`);
}

export async function unassignCatCareItemLocalAction(formData: FormData) {
  return unassignCatCareItemFromFormData(formData);
}

export async function deleteCatCareLibraryItemAction(formData: FormData) {
  const result = await deleteCatCareLibraryItemFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(
    result.data.currentCatId
      ? `/catcare/items?cat_id=${result.data.currentCatId}&saved=1`
      : "/catcare/items?saved=1"
  );
}

export async function deleteCatCareLibraryItemLocalAction(formData: FormData) {
  return deleteCatCareLibraryItemFromFormData(formData);
}

export async function updateCatCareLibraryItemNotesAction(formData: FormData) {
  const result = await updateCatCareLibraryItemNotesFromFormData(formData);
  const currentCatId = String(formData.get("currentCatId") ?? "").trim();

  if (!result.ok) {
    redirect(
      currentCatId
        ? `/catcare/items?cat_id=${currentCatId}&error=save_failed`
        : "/catcare/items?error=save_failed"
    );
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(
    result.data.currentCatId
      ? `/catcare/items?cat_id=${result.data.currentCatId}&saved=1`
      : "/catcare/items?saved=1"
  );
}

export async function updateCatCareLibraryItemNotesLocalAction(
  formData: FormData
) {
  return updateCatCareLibraryItemNotesFromFormData(formData);
}

export async function updateCatCareLibraryItemAction(formData: FormData) {
  const result = await updateCatCareLibraryItemFromFormData(formData);
  const currentCatId = String(formData.get("currentCatId") ?? "").trim();

  if (!result.ok) {
    redirect(
      currentCatId
        ? `/catcare/items?cat_id=${currentCatId}&error=save_failed`
        : "/catcare/items?error=save_failed"
    );
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(
    result.data.currentCatId
      ? `/catcare/items?cat_id=${result.data.currentCatId}&saved=1`
      : "/catcare/items?saved=1"
  );
}

export async function updateCatCareLibraryItemLocalAction(formData: FormData) {
  const result = await updateCatCareLibraryItemFromFormData(formData);

  if (result.ok) {
    revalidatePath("/catcare");
    revalidatePath("/catcare/items");
  }

  return result;
}

export async function createCatCareEventAction(formData: FormData) {
  const result = await createCatCareEventFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/events");
  redirect(`/catcare/events?cat_id=${result.data.catId}&saved=1`);
}

export async function createCatCareEventLocalAction(formData: FormData) {
  return createCatCareEventFromFormData(formData);
}

export async function updateCatCareEventLocalAction(formData: FormData) {
  const result = await updateCatCareEventFromFormData(formData);

  if (result.ok) {
    revalidatePath("/catcare");
    revalidatePath("/catcare/events");
  }

  return result;
}

export async function deleteCatCareEventLocalAction(formData: FormData) {
  const result = await deleteCatCareEventFromFormData(formData);

  if (result.ok) {
    revalidatePath("/catcare");
    revalidatePath("/catcare/events");
  }

  return result;
}

export async function createCatCarePlanAction(formData: FormData) {
  const generationRequestId = String(formData.get("generationRequestId") ?? "")
    .trim();
  const billingResult = await getCurrentBillingEntitlements();

  if (!billingResult.ok) {
    throw new Error(billingResult.error.message);
  }

  const selectedCatCount = new Set(
    formData
      .getAll("catIds")
      .map((value) => String(value).trim())
      .filter(Boolean)
  ).size;
  const catSelectionResult = assertCatCarePlanCatSelection({
    planId: billingResult.data.planId,
    selectedCatCount
  });

  if (!catSelectionResult.ok) {
    throw new Error(catSelectionResult.error.message);
  }

  const result = await createCatCarePlanFromFormData(formData, {
    beforeCreate: async (context) => {
      const aiResult = await generateAiText({
        idempotencyKey: generationRequestId || undefined,
        metadata: {
          correlation_id: `catcare_plan_generation:${generationRequestId || randomUUID()}`,
          request_source: "catcare_plans",
          resource_type: "care_plan"
        },
        prompt: buildCatCarePlanGenerationPrompt(context),
        purpose: "catcare_plan_generation"
      });

      if (!aiResult.ok) {
        return aiResult;
      }

      if (aiResult.data.status === "blocked") {
        redirect(
          "/catcare/plans?paywall=ai_quota"
        );
      }

      if (aiResult.data.status === "failed") {
        return serviceError(
          "system_error",
          "智能生成暂时不可用，照护计划未生成。"
        );
      }

      return aiResult;
    }
  });

  if (!result.ok) {
    if (result.error.code === "validation_error") {
      redirect("/catcare/plans?plan_error=validation");
    }

    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/plans");
  revalidateAiUsageSurfaces();
  redirect(`/catcare/plans/${result.data.id}`);
}

export async function publishCatCarePlanAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await publishCatCarePlan(planId);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/plans");
  revalidatePath(`/catcare/plans/${result.data.id}`);
  redirect(`/catcare/plans/${result.data.id}?published=1`);
}

export async function publishCatCarePlanLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();

  return publishCatCarePlan(planId);
}

export async function updateCatCarePlanTasksAction(formData: FormData) {
  const result = await updateCatCarePlanTasksFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare/plans");
  revalidatePath(`/catcare/plans/${result.data.id}`);
  redirect(`/catcare/plans/${result.data.id}?saved=1`);
}

export async function updateCatCarePlanTasksLocalAction(formData: FormData) {
  return updateCatCarePlanTasksFromFormData(formData);
}

export async function closeCatCarePlanAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await closeCatCarePlan(planId);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/plans");
  revalidatePath(`/catcare/plans/${result.data.id}`);
  redirect(`/catcare/plans/${result.data.id}?closed=1`);
}

export async function closeCatCarePlanLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();

  return closeCatCarePlan(planId);
}

export async function deleteCatCarePlanLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();

  return deleteCatCarePlan(planId);
}

export async function createCarePlanShareLinkLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await createCarePlanShareLink(planId);

  revalidatePath(`/catcare/plans/${planId}`);

  return result;
}

export async function revokeCarePlanShareLinkLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await revokeCarePlanShareLink(planId);

  revalidatePath(`/catcare/plans/${planId}`);

  return result;
}

export async function runCatCarePlanAiRecapAction(
  _previousState: CatCareAiRecapActionState,
  formData: FormData
): Promise<CatCareAiRecapActionState> {
  const planId = String(formData.get("planId") ?? "").trim();
  const forceRecap = formData.get("forceRecap") === "1";

  if (!planId) {
    return {
      result: serviceError("validation_error", "请选择要复盘的照护计划。", {
        planId: "required"
      })
    };
  }

  const planResult = await getCatCarePlanDetail(planId);

  if (!planResult.ok) {
    return {
      result: serviceError(planResult.error.code, planResult.error.message)
    };
  }

  const summary = buildPlanResultSummary(planResult.data);

  if (planResult.data.status === "draft") {
    return {
      result: serviceError(
        "validation_error",
        "待发布计划还没有照看结果，不能生成复盘。"
      )
    };
  }

  if (planResult.data.status === "closed") {
    return {
      result: serviceError(
        "validation_error",
        "已关闭计划只能查看历史结果，不能再消耗额度生成复盘。"
      )
    };
  }

  if (
    summary.completedCount + summary.attentionCount + summary.overdueCount ===
    0
  ) {
    return {
      result: serviceError(
        "validation_error",
        "还没有可复盘的提交或逾期项。"
      )
    };
  }

  const correlationId = randomUUID();
  const storedRecapText = getStoredCatCarePlanRecapText(
    planResult.data.aiInputSummary
  );
  const result = await generateAiText({
    idempotencyKey: forceRecap || !storedRecapText
      ? `${planResult.data.id}:${randomUUID()}`
      : planResult.data.id,
    metadata: {
      correlation_id: correlationId,
      request_source: "catcare_results",
      resource_id: planResult.data.id,
      resource_type: "care_plan"
    },
    prompt: buildCatCarePlanAiRecapPrompt({
      planTitle: planResult.data.title,
      statusLabel: formatPlanStatusLabel(planResult.data.status),
      summary
    }),
    purpose: "catcare_result_recap"
  });

  revalidatePath(`/catcare/plans/${planResult.data.id}/results`);

  if (!result.ok) {
    return { result };
  }

  const text = result.data.result?.text ?? null;

  if (result.data.status === "succeeded" && text) {
    const saveResult = await saveCatCarePlanAiRecap({
      consumedCredits: result.data.credit.consumedCredits,
      mode: result.data.mode,
      planId: planResult.data.id,
      text,
      usageRecordStatus: result.data.usage.recordStatus
    });

    if (!saveResult.ok) {
      return {
        result: serviceError(saveResult.error.code, saveResult.error.message)
      };
    }

    revalidatePath("/catcare");
    revalidatePath("/catcare/plans");
    revalidatePath("/catcare/results");
    revalidateAiUsageSurfaces();
  }

  return {
    result: {
      ok: true,
      data: {
        consumedCredits: result.data.credit.consumedCredits,
        reason: result.data.reason,
        status: result.data.status,
        text,
        usageRecordStatus: result.data.usage.recordStatus
      }
    }
  };
}

function formatPlanStatusLabel(status: string) {
  if (status === "closed") {
    return "已关闭";
  }

  if (status === "reviewed") {
    return "已复盘";
  }

  if (status === "published") {
    return "已发布";
  }

  return "草稿";
}

function getStoredCatCarePlanRecapText(summary: unknown) {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return null;
  }

  const recap = (summary as { result_recap?: unknown }).result_recap;

  if (!recap || typeof recap !== "object" || Array.isArray(recap)) {
    return null;
  }

  const text = (recap as { text?: unknown }).text;

  return typeof text === "string" && text.trim() ? text : null;
}

function revalidateAiUsageSurfaces() {
  revalidatePath("/account");
  revalidatePath("/account/billing");
  revalidatePath("/account/usage");
  revalidatePath("/catcare");
  revalidatePath("/catcare/plans");
}
