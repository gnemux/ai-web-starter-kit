import "server-only";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import type { Json } from "../../supabase/database.types";
import { createSupabaseServerClient } from "../../supabase/server";
import {
  type CatCarePlan,
  getAuthenticatedOwnerId,
  mapPlan,
  mapSupabaseError,
  trackCatCareProductEvent
} from "./core";

export async function saveCatCarePlanAiRecap(input: {
  consumedCredits: number;
  mode: string;
  planId: string;
  text: string;
  usageRecordStatus: string;
}): Promise<ServiceResult<CatCarePlan>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const planResult = await clientResult.data
    .from("care_plans")
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .eq("owner_id", ownerResult.data)
    .eq("id", input.planId)
    .single();

  if (planResult.error) {
    return mapSupabaseError(planResult.error);
  }

  if (planResult.data.status !== "published" && planResult.data.status !== "reviewed") {
    return serviceError(
      "validation_error",
      "只有已发布的照护计划可以生成复盘。"
    );
  }

  const reviewedAt = new Date().toISOString();
  const { data, error } = await clientResult.data
    .from("care_plans")
    .update({
      ai_input_summary: withResultRecap(planResult.data.ai_input_summary, {
        consumed_credits: input.consumedCredits,
        generated_at: reviewedAt,
        mode: input.mode,
        text: input.text,
        usage_record_status: input.usageRecordStatus
      }),
      reviewed_at: reviewedAt,
      status: "reviewed"
    })
    .eq("owner_id", ownerResult.data)
    .eq("id", input.planId)
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .single();

  if (error) {
    return mapSupabaseError(error);
  }


  return serviceOk({
    ...mapPlan(data),
    submissions: [],
    tasks: []
  });
}

export async function closeCatCarePlan(
  planId: string
): Promise<ServiceResult<CatCarePlan>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const closedAt = new Date().toISOString();
  const { data, error } = await clientResult.data
    .from("care_plans")
    .update({
      closed_at: closedAt,
      status: "closed"
    })
    .eq("id", planId)
    .eq("owner_id", ownerResult.data)
    .neq("status", "closed")
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  await trackCatCareProductEvent(ownerResult.data, "catcare_plan_closed", {
    plan_status: data.status
  });

  return serviceOk({
    ...mapPlan(data),
    submissions: [],
    tasks: []
  });
}

export async function deleteCatCarePlan(
  planId: string
): Promise<ServiceResult<{ id: string }>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const { data: plan, error: planError } = await clientResult.data
    .from("care_plans")
    .select("id, status")
    .eq("id", planId)
    .eq("owner_id", ownerResult.data)
    .single();

  if (planError) {
    return mapSupabaseError(planError);
  }

  if (plan.status !== "draft" && plan.status !== "closed") {
    return serviceError(
      "validation_error",
      "Published care plans must be closed first, and executed history is kept for review."
    );
  }

  const { count, error: submissionsError } = await clientResult.data
    .from("care_submissions")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", planId)
    .eq("owner_id", ownerResult.data);

  if (submissionsError) {
    return mapSupabaseError(submissionsError);
  }

  if ((count ?? 0) > 0) {
    return serviceError(
      "validation_error",
      "This plan already has sitter submissions, so it stays in history."
    );
  }

  const tasksResult = await clientResult.data
    .from("care_tasks")
    .delete()
    .eq("plan_id", planId);

  if (tasksResult.error) {
    return mapSupabaseError(tasksResult.error);
  }

  const deleteResult = await clientResult.data
    .from("care_plans")
    .delete()
    .eq("id", planId)
    .eq("owner_id", ownerResult.data);

  if (deleteResult.error) {
    return mapSupabaseError(deleteResult.error);
  }

  await trackCatCareProductEvent(ownerResult.data, "catcare_plan_deleted", {
    plan_status: plan.status
  });

  return serviceOk({ id: planId });
}

function withResultRecap(summary: Json, recap: Record<string, Json>): Json {
  const base =
    summary && typeof summary === "object" && !Array.isArray(summary)
      ? summary
      : {};

  return {
    ...base,
    result_recap: recap
  };
}

