import "server-only";

import { randomUUID } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";
import { normalizeShareTokenAvailability } from "@xwlc/platform";

import { createSupabaseAdminClient } from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import {
  getAnonymousCarePlanServiceDates,
  parseAnonymousCareSubmissionSlotKey
} from "./anonymous-submission-policy";
import {
  createAnonymousTaskSubmissionRef,
  getAnonymousTaskVisitTimes,
  isLegacyPrepareTask
} from "./anonymous-view-policy";
import { recordCatCareAuditEvent } from "./audit";
import {
  mapPlan,
  mapSupabaseError,
  mapTask,
  trackCatCareProductEvent
} from "./core";
import { resolveCarePlanShareToken } from "./share-tokens";

export type AnonymousCareTaskSubmissionView = {
  abnormal: boolean;
  attachmentCount: number;
  note: string | null;
  serviceDate: string | null;
  status: Database["public"]["Tables"]["care_submissions"]["Row"]["status"];
  submissionId: string;
  submittedAt: string;
};

export type AnonymousCareTaskView = {
  category: Database["public"]["Tables"]["care_tasks"]["Row"]["category"];
  frequency: string | null;
  instructions: string | null;
  photoRequired: boolean;
  required: boolean;
  submissionsBySlot: Record<string, AnonymousCareTaskSubmissionView>;
  submissionRef: string;
  sortOrder: number;
  timeHint: string | null;
  title: string;
};

export type AnonymousCarePlanView = {
  catNames: string[];
  endOn: string | null;
  expiresAt: string;
  handoffNotes: string | null;
  requiredTaskCount: number;
  scenario: Database["public"]["Tables"]["care_plans"]["Row"]["scenario"];
  startOn: string | null;
  taskCount: number;
  tasks: AnonymousCareTaskView[];
  title: string;
};

export async function getAnonymousCarePlanView(
  secret: string
): Promise<ServiceResult<AnonymousCarePlanView>> {
  const correlationId = randomUUID();
  const tokenResult = await resolveCarePlanShareToken(
    secret,
    new Date(),
    correlationId
  );

  if (!tokenResult.ok) {
    return tokenResult;
  }

  const clientResult = createSupabaseAdminClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const [planResult, tasksResult, submissionsResult, attachmentsResult] = await Promise.all([
    clientResult.data
      .from("care_plans")
      .select(
        "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
      )
      .eq("id", tokenResult.data.resourceId)
      .eq("owner_id", tokenResult.data.ownerId)
      .single(),
    clientResult.data
      .from("care_tasks")
      .select(
        "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, photo_required, enabled, created_at, updated_at"
      )
      .eq("plan_id", tokenResult.data.resourceId)
      .order("sort_order", { ascending: true }),
    clientResult.data
      .from("care_submissions")
      .select("id, task_id, status, note, abnormal, idempotency_key, created_at")
      .eq("owner_id", tokenResult.data.ownerId)
      .eq("plan_id", tokenResult.data.resourceId)
      .like("idempotency_key", "anonymous:%")
      .order("created_at", { ascending: false }),
    clientResult.data
      .from("care_submission_attachments")
      .select("submission_id")
      .eq("owner_id", tokenResult.data.ownerId)
      .eq("plan_id", tokenResult.data.resourceId)
  ]);

  if (planResult.error) {
    return mapSupabaseError(planResult.error);
  }

  if (tasksResult.error) {
    return mapSupabaseError(tasksResult.error);
  }

  if (submissionsResult.error) {
    return mapSupabaseError(submissionsResult.error);
  }

  if (attachmentsResult.error) {
    return mapSupabaseError(attachmentsResult.error);
  }

  if (planResult.data.status !== "published") {
    const outcome = normalizeShareTokenAvailability(tokenResult.data, false);

    void recordCatCareAuditEvent({
      actorType: "anonymous_token",
      correlationId,
      eventName: "invalid_or_revoked_token_rejected",
      ownerId: tokenResult.data.ownerId,
      properties: { reason: outcome.status },
      resourceId: tokenResult.data.resourceId,
      resourceType: tokenResult.data.resourceType,
      tokenRecordId: tokenResult.data.tokenId
    });
    await trackCatCareProductEvent(
      "anonymous_token",
      "catcare_share_link_rejected",
      { outcome: outcome.status, result: "rejected" },
      {
        correlation_id: correlationId,
        request_source: "catcare_anonymous_view",
        resource_id: tokenResult.data.resourceId,
        resource_type: tokenResult.data.resourceType
      }
    );
    return serviceError("forbidden", "Care plan is no longer available.", {
      token: outcome.status
    });
  }

  const plan = mapPlan(planResult.data);
  const submissionBySlotAndTaskId = new Map<
    string,
    AnonymousCareTaskSubmissionView
  >();
  const legacySubmissionByDateAndTaskId = new Map<
    string,
    AnonymousCareTaskSubmissionView
  >();
  const attachmentCountBySubmissionId = new Map<string, number>();

  for (const attachment of attachmentsResult.data ?? []) {
    attachmentCountBySubmissionId.set(
      attachment.submission_id,
      (attachmentCountBySubmissionId.get(attachment.submission_id) ?? 0) + 1
    );
  }

  for (const submission of submissionsResult.data ?? []) {
    if (!submission.task_id) {
      continue;
    }

    const slot = parseAnonymousCareSubmissionSlotKey(
      submission.idempotency_key
    );

    if (!slot) {
      continue;
    }

    const view = {
      abnormal: submission.abnormal,
      attachmentCount: attachmentCountBySubmissionId.get(submission.id) ?? 0,
      note: submission.note,
      serviceDate: slot.serviceDate,
      status: submission.status,
      submissionId: submission.id,
      submittedAt: submission.created_at
    };

    if (slot.visitTime) {
      const key = `${slot.key}:${submission.task_id}`;

      if (!submissionBySlotAndTaskId.has(key)) {
        submissionBySlotAndTaskId.set(key, view);
      }
    } else {
      const key = `${slot.serviceDate}:${submission.task_id}`;

      if (!legacySubmissionByDateAndTaskId.has(key)) {
        legacySubmissionByDateAndTaskId.set(key, view);
      }
    }
  }

  const tasks = (tasksResult.data ?? [])
    .map(mapTask)
    .filter((task) => task.enabled && !isLegacyPrepareTask(task))
    .map((task) => ({
      category: task.category,
      frequency: task.frequency,
      instructions: task.instructions,
      photoRequired: task.photoRequired,
      required: task.required,
      submissionsBySlot: Object.fromEntries(
        getAnonymousCarePlanServiceDates(plan.startOn, plan.endOn).flatMap(
          (serviceDate) =>
            getAnonymousTaskVisitTimes(task).flatMap((visitTime, index) => {
              const slotKey = createAnonymousSubmissionSlotKey(
                serviceDate,
                visitTime
              );
              const submission =
                submissionBySlotAndTaskId.get(`${slotKey}:${task.id}`) ??
                (index === 0
                  ? legacySubmissionByDateAndTaskId.get(
                      `${serviceDate}:${task.id}`
                    )
                  : undefined);

              return submission ? [[slotKey, submission]] : [];
            })
        )
      ),
      submissionRef: createAnonymousTaskSubmissionRef(
        tokenResult.data.resourceId,
        task.id
      ),
      sortOrder: task.sortOrder,
      timeHint: task.timeHint,
      title: task.title
    }));

  void recordCatCareAuditEvent({
    actorType: "anonymous_token",
    correlationId,
    eventName: "share_page_viewed",
    ownerId: tokenResult.data.ownerId,
    properties: { expires_at: tokenResult.data.expiresAt },
    resourceId: tokenResult.data.resourceId,
    resourceType: tokenResult.data.resourceType,
    tokenRecordId: tokenResult.data.tokenId
  });
  await trackCatCareProductEvent(
    "anonymous_token",
    "catcare_share_page_viewed",
    { outcome: "valid", result: "success" },
    {
      correlation_id: correlationId,
      request_source: "catcare_anonymous_view",
      resource_id: tokenResult.data.resourceId,
      resource_type: tokenResult.data.resourceType
    }
  );

  return serviceOk({
    catNames: extractPlanCatNames(plan.aiInputSummary),
    endOn: plan.endOn,
    expiresAt: tokenResult.data.expiresAt,
    handoffNotes: plan.handoffNotes,
    requiredTaskCount: tasks.filter((task) => task.required).length,
    scenario: plan.scenario,
    startOn: plan.startOn,
    taskCount: tasks.length,
    tasks,
    title: plan.title
  });
}

function createAnonymousSubmissionSlotKey(
  serviceDate: string,
  visitTime: string
) {
  return `${serviceDate}:${visitTime}`;
}

function extractPlanCatNames(
  summary: Database["public"]["Tables"]["care_plans"]["Row"]["ai_input_summary"]
) {
  if (summary && typeof summary === "object" && !Array.isArray(summary)) {
    const names = summary as { catNames?: unknown; cat_names?: unknown };
    const catNames = names.catNames ?? names.cat_names;

    if (Array.isArray(catNames)) {
      return catNames.filter((name): name is string => typeof name === "string");
    }
  }

  return ["猫咪"];
}
