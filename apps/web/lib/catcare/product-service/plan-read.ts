import "server-only";

import { serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient } from "../../supabase/server";
import { mapEvidenceAttachment } from "./care-evidence";
import {
  CARE_PLAN_CAT_SELECT,
  type CatCarePlan,
  getAuthenticatedOwnerId,
  loadOwnerLibraryItems,
  mapPlan,
  mapPlanParticipant,
  mapSubmission,
  mapSupabaseError,
  mapTask
} from "./core";

export async function getCatCarePlanDetail(
  planId: string,
  options: { includeSubmissions?: boolean } = {}
): Promise<ServiceResult<CatCarePlan>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const includeSubmissions = options.includeSubmissions !== false;
  const planResult = await clientResult.data
    .from("care_plans")
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .eq("owner_id", ownerResult.data)
    .eq("id", planId)
    .single();

  if (planResult.error) {
    return mapSupabaseError(planResult.error);
  }

  const tasksQuery = clientResult.data
    .from("care_tasks")
    .select(
      "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, photo_required, enabled, created_at, updated_at"
    )
    .eq("plan_id", planId)
    .order("sort_order", { ascending: true });
  const submissionsQuery =
    !includeSubmissions
      ? null
      : clientResult.data
          .from("care_submissions")
          .select(
            "id, owner_id, plan_id, task_id, submitted_by_label, status, note, revision, abnormal, idempotency_key, created_at"
          )
          .eq("owner_id", ownerResult.data)
          .eq("plan_id", planId)
          .order("created_at", { ascending: false });
  const participantsQuery = clientResult.data
    .from("care_plan_cats")
    .select(CARE_PLAN_CAT_SELECT)
    .eq("plan_id", planId)
    .order("sort_order", { ascending: true });
  const attachmentsQuery = !includeSubmissions
    ? null
    : clientResult.data
        .from("care_submission_attachments")
        .select("id, submission_id, byte_size, content_type, width, height, created_at, position")
        .eq("owner_id", ownerResult.data)
        .eq("plan_id", planId)
        .order("position", { ascending: true });
  const [tasksResult, submissionsResult, participantsResult, attachmentsResult] = await Promise.all([
    tasksQuery,
    submissionsQuery,
    participantsQuery,
    attachmentsQuery
  ]);

  if (tasksResult.error) {
    return mapSupabaseError(tasksResult.error);
  }

  if (submissionsResult?.error) {
    return mapSupabaseError(submissionsResult.error);
  }

  if (participantsResult.error) {
    return mapSupabaseError(participantsResult.error);
  }

  if (attachmentsResult?.error) {
    return mapSupabaseError(attachmentsResult.error);
  }

  const attachmentsBySubmissionId = new Map<
    string,
    ReturnType<typeof mapEvidenceAttachment>[]
  >();

  for (const attachment of attachmentsResult?.data ?? []) {
    attachmentsBySubmissionId.set(attachment.submission_id, [
      ...(attachmentsBySubmissionId.get(attachment.submission_id) ?? []),
      mapEvidenceAttachment(attachment)
    ]);
  }

  const plan = {
    ...mapPlan(planResult.data),
    participants: (participantsResult.data ?? []).map(mapPlanParticipant),
    submissions: (submissionsResult?.data ?? []).map((submission) =>
      mapSubmission(
        submission,
        attachmentsBySubmissionId.get(submission.id) ?? []
      )
    ),
    tasks: (tasksResult.data ?? []).map(mapTask)
  };

  return serviceOk(plan);
}

export async function getCatCarePlanItemOptions(): Promise<ServiceResult<string[]>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const itemsResult = await loadOwnerLibraryItems(
    clientResult.data,
    ownerResult.data
  );

  if (!itemsResult.ok) {
    return itemsResult;
  }

  return serviceOk(Array.from(new Set(itemsResult.data.map((item) => item.name))));
}

