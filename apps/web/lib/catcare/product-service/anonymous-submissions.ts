import "server-only";

import { randomUUID } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import {
  careEvidenceInputMaxBytes,
  careEvidenceMaxCount,
  validatePrivateImageFile
} from "../../media/private-image";
import { createSupabaseAdminClient, type AppSupabaseClient } from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import {
  getAnonymousCareTodayIsoDate,
  isAnonymousCareServiceDate,
  isAnonymousCareServiceDateInPlan,
  normalizeAnonymousCareSubmissionNote,
  parseAnonymousCareSubmissionSlotKey,
  parseAnonymousCareSubmissionStatus,
  requiresAnonymousCareSubmissionNote,
  satisfiesAnonymousCareSubmissionPhotoRequirement
} from "./anonymous-submission-policy";
import { recordCatCareAuditEvent } from "./audit";
import { ensureCriticalSubmissionEffects } from "./critical-effects";
import {
  mapSupabaseError,
  mapTask,
  trackCatCareProductEvent
} from "./core";
import { recordCatCareOutboxEvent } from "./outbox";
import { recordOwnerSubmissionNotification } from "./notifications";
import type { AnonymousCareTaskSubmissionView } from "./anonymous-view";
import {
  createAnonymousTaskSubmissionRef,
  getAnonymousTaskVisitTimes,
  isLegacyPrepareTask
} from "./anonymous-view-policy";
import { resolveCarePlanShareToken } from "./share-tokens";

export type AnonymousCareSubmissionMutation = AnonymousCareTaskSubmissionView & {
  alreadySubmitted: boolean;
  message: string;
  submissionRef: string;
};

type AnonymousCareSubmissionSlotView = AnonymousCareTaskSubmissionView & {
  idempotencyKey: string;
  revision: number;
  submissionId: string;
};

export async function submitAnonymousCareSubmissionFromFormData(
  formData: FormData
): Promise<ServiceResult<AnonymousCareSubmissionMutation>> {
  const correlationId = randomUUID();
  const secret = String(formData.get("token") ?? "").trim();
  const serviceDate = String(formData.get("serviceDate") ?? "").trim();
  const submissionRef = String(formData.get("submissionRef") ?? "").trim();
  const visitTime = String(formData.get("visitTime") ?? "").trim();
  const evidenceFiles = formData.getAll("photos");
  const statusResult = parseAnonymousSubmissionStatus(formData.get("status"));
  const noteResult = parseAnonymousSubmissionNote(formData.get("note"));

  if (evidenceFiles.length > careEvidenceMaxCount) {
    return serviceError("validation_error", "每项照护结果最多上传 3 张照片。", {
      photo: "limit_reached"
    });
  }

  for (const file of evidenceFiles) {
    const fileResult = validatePrivateImageFile(file, careEvidenceInputMaxBytes);

    if (!fileResult.ok) {
      return fileResult;
    }
  }

  if (!isAnonymousCareServiceDate(serviceDate)) {
    return serviceError("validation_error", "请选择要提交的照护日期。", {
      serviceDate: "required"
    });
  }

  if (!submissionRef) {
    return serviceError("validation_error", "请选择要提交的照护任务。", {
      submissionRef: "required"
    });
  }

  if (!isAnonymousVisitTime(visitTime)) {
    return serviceError("validation_error", "请选择要提交的到访时间。", {
      visitTime: "required"
    });
  }

  if (!statusResult.ok) {
    return statusResult;
  }

  if (!noteResult.ok) {
    return noteResult;
  }

  const status = statusResult.data;
  const note = noteResult.data;

  if (requiresAnonymousCareSubmissionNote(status) && !note) {
    return serviceError("validation_error", "请填写备注或异常说明。", {
      note: "required"
    });
  }

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

  const [planResult, tasksResult] = await Promise.all([
    clientResult.data
      .from("care_plans")
      .select("id, owner_id, status, start_on, end_on")
      .eq("id", tokenResult.data.resourceId)
      .eq("owner_id", tokenResult.data.ownerId)
      .single(),
    clientResult.data
      .from("care_tasks")
      .select(
        "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, photo_required, enabled, created_at, updated_at"
      )
      .eq("plan_id", tokenResult.data.resourceId)
      .order("sort_order", { ascending: true })
  ]);

  if (planResult.error) {
    return mapSupabaseError(planResult.error);
  }

  if (tasksResult.error) {
    return mapSupabaseError(tasksResult.error);
  }

  if (planResult.data.status !== "published") {
    void recordCatCareAuditEvent({
      actorType: "anonymous_token",
      correlationId,
      eventName: "invalid_or_revoked_token_rejected",
      ownerId: tokenResult.data.ownerId,
      properties: { reason: "unavailable" },
      resourceId: tokenResult.data.resourceId,
      resourceType: tokenResult.data.resourceType,
      tokenRecordId: tokenResult.data.tokenId
    });
    await trackCatCareProductEvent(
      "anonymous_token",
      "catcare_share_link_rejected",
      { outcome: "unavailable", result: "rejected" },
      {
        correlation_id: correlationId,
        request_source: "catcare_anonymous_submit",
        resource_id: tokenResult.data.resourceId,
        resource_type: tokenResult.data.resourceType
      }
    );
    return serviceError("forbidden", "这个照护计划当前不可提交。", {
      token: "unavailable"
    });
  }

  if (
    !isAnonymousCareServiceDateInPlan(
      serviceDate,
      planResult.data.start_on,
      planResult.data.end_on
    )
  ) {
    return serviceError("validation_error", "请选择计划日期内的照护任务。", {
      serviceDate: "invalid"
    });
  }

  if (serviceDate > getAnonymousCareTodayIsoDate()) {
    return serviceError("validation_error", "这一天还没到，暂不能提交照护结果。", {
      serviceDate: "future"
    });
  }

  const task = (tasksResult.data ?? [])
    .map(mapTask)
    .filter((item) => item.enabled && !isLegacyPrepareTask(item))
    .find((item) => {
      const legacyRef = createAnonymousTaskSubmissionRef(
        tokenResult.data.tokenId,
        item.id
      );
      const stableRef = createAnonymousTaskSubmissionRef(
        tokenResult.data.resourceId,
        item.id
      );

      return submissionRef === stableRef || submissionRef === legacyRef;
    });

  if (!task) {
    return serviceError("validation_error", "请选择有效的照护任务。", {
      submissionRef: "invalid"
    });
  }

  if (!getAnonymousTaskVisitTimes(task).includes(visitTime)) {
    return serviceError("validation_error", "请选择计划内的到访任务。", {
      visitTime: "invalid"
    });
  }

  const idempotencyKey = createAnonymousSubmissionIdempotencyKey(
    serviceDate,
    visitTime,
    submissionRef
  );
  const existingResult = await getAnonymousSubmissionBySlot(
    clientResult.data,
    tokenResult.data.ownerId,
    tokenResult.data.resourceId,
    task.id,
    serviceDate,
    visitTime
  );

  if (!existingResult.ok) {
    return existingResult;
  }

  if (
    !satisfiesAnonymousCareSubmissionPhotoRequirement({
      existingAttachmentCount: existingResult.data?.attachmentCount ?? 0,
      pendingPhotoCount: evidenceFiles.length,
      photoRequired: task.photoRequired,
      status
    })
  ) {
    return serviceError("validation_error", "主人要求这项任务附带照片，请先选择照片。", {
      photo: "required"
    });
  }

  if (existingResult.data) {
    if (
      existingResult.data.status !== status ||
      note !== existingResult.data.note
    ) {
      const updateResult = await clientResult.data
        .from("care_submissions")
        .update({
          abnormal: status === "exception",
          note,
          revision: existingResult.data.revision + 1,
          status
        })
        .eq("owner_id", tokenResult.data.ownerId)
        .eq("plan_id", tokenResult.data.resourceId)
        .eq("idempotency_key", existingResult.data.idempotencyKey)
        .eq("revision", existingResult.data.revision)
        .select("id, status, note, abnormal, created_at, revision")
        .maybeSingle();

      if (updateResult.error) {
        return mapSupabaseError(updateResult.error);
      }

      if (!updateResult.data) {
        return serviceError(
          "conflict",
          "这项照护反馈刚被更新，请刷新页面后重新确认。"
        );
      }

      const auditResult = await recordCatCareAuditEvent({
        actorType: "anonymous_token",
        correlationId,
        eventName: "care_submission_created",
        idempotencyKey: existingResult.data.idempotencyKey,
        ownerId: tokenResult.data.ownerId,
        properties: {
          abnormal: updateResult.data.abnormal,
          service_date: serviceDate,
          status: updateResult.data.status,
          visit_time: visitTime
        },
        resourceId: tokenResult.data.resourceId,
        resourceType: tokenResult.data.resourceType,
        taskId: task.id,
        tokenRecordId: tokenResult.data.tokenId
      });
      if (!auditResult.ok) {
        return serviceError(
          "system_error",
          "The submission was saved, but its activity record could not be written. Retry safely with the same submission reference."
        );
      }
      const outboxResult = await recordSubmissionOutbox({
        abnormal: updateResult.data.abnormal,
        correlationId,
        idempotencyKey: existingResult.data.idempotencyKey,
        ownerId: tokenResult.data.ownerId,
        serviceDate,
        status: updateResult.data.status,
        submissionId: updateResult.data.id,
        taskTitle: task.title,
        visitTime
      });
      if (!outboxResult.ok) {
        return serviceError("system_error", "The submission was saved, but its delivery record could not be written. Retry safely with the same submission reference.");
      }
      const notificationResult = await recordSubmissionNotification({
        abnormal: updateResult.data.abnormal,
        ownerId: tokenResult.data.ownerId,
        planId: tokenResult.data.resourceId,
        revision: updateResult.data.revision,
        serviceDate,
        status: updateResult.data.status,
        submissionId: updateResult.data.id,
        taskId: task.id,
        taskTitle: task.title,
        visitTime
      });
      if (!notificationResult.ok) {
        return serviceError("system_error", "The submission was saved, but its owner notification could not be written. Retry safely with the same submission reference.");
      }
      await trackCatCareProductEvent(
        "anonymous_token",
        "catcare_submission_created",
        { result: "updated" },
        {
          correlation_id: correlationId,
          request_source: "catcare_anonymous_submit",
          resource_id: tokenResult.data.resourceId,
          resource_type: tokenResult.data.resourceType
        }
      );

      return serviceOk({
        abnormal: updateResult.data.abnormal,
        alreadySubmitted: true,
        attachmentCount: existingResult.data.attachmentCount,
        message: "已更新，主人会看到这项任务的最新反馈",
        note: updateResult.data.note,
        serviceDate,
        status: updateResult.data.status,
        submissionId: updateResult.data.id,
        submittedAt: updateResult.data.created_at,
        submissionRef
      });
    }

    const existingSubmission = existingResult.data;
    const retryEffects = await ensureCriticalSubmissionEffects({
      writeAudit: () => recordCatCareAuditEvent({
        actorType: "anonymous_token", correlationId, eventName: "care_submission_created",
        idempotencyKey: existingSubmission.idempotencyKey, ownerId: tokenResult.data.ownerId,
        properties: { abnormal: existingSubmission.abnormal, service_date: serviceDate, status: existingSubmission.status, visit_time: visitTime },
        resourceId: tokenResult.data.resourceId, resourceType: tokenResult.data.resourceType,
        taskId: task.id, tokenRecordId: tokenResult.data.tokenId
      }),
      writeOutbox: () => recordSubmissionOutbox({
        abnormal: existingSubmission.abnormal, correlationId,
        idempotencyKey: existingSubmission.idempotencyKey, ownerId: tokenResult.data.ownerId,
        serviceDate, status: existingSubmission.status, submissionId: existingSubmission.submissionId,
        taskTitle: task.title, visitTime
      }),
      writeNotification: () => recordSubmissionNotification({
        abnormal: existingSubmission.abnormal,
        ownerId: tokenResult.data.ownerId,
        planId: tokenResult.data.resourceId,
        revision: existingSubmission.revision,
        serviceDate,
        status: existingSubmission.status,
        submissionId: existingSubmission.submissionId,
        taskId: task.id,
        taskTitle: task.title,
        visitTime
      })
    });
    if (!retryEffects.ok) return serviceError("system_error", "The submission is saved, but its Audit or delivery record is still unavailable. Retry with the same submission reference.");
    return serviceOk({
      ...existingResult.data,
      alreadySubmitted: true,
      message: "这项任务已经提交过，页面已显示之前的提交结果",
      submissionRef
    });
  }

  const insertResult = await clientResult.data
    .from("care_submissions")
    .insert({
      abnormal: status === "exception",
      idempotency_key: idempotencyKey,
      note,
      owner_id: tokenResult.data.ownerId,
      plan_id: tokenResult.data.resourceId,
      status,
      submitted_by_label: "照看者",
      task_id: task.id
    })
    .select("id, status, note, abnormal, created_at, revision")
    .single();

  if (insertResult.error?.code === "23505") {
    const duplicateResult = await getAnonymousSubmissionBySlot(
      clientResult.data,
      tokenResult.data.ownerId,
      tokenResult.data.resourceId,
      task.id,
      serviceDate,
      visitTime
    );

    if (!duplicateResult.ok) {
      return duplicateResult;
    }

    if (duplicateResult.data) {
      const duplicate = duplicateResult.data;
      const effects = await ensureCriticalSubmissionEffects({
        writeAudit: () => recordCatCareAuditEvent({
          actorType: "anonymous_token", correlationId, eventName: "care_submission_created",
          idempotencyKey: duplicate.idempotencyKey, ownerId: tokenResult.data.ownerId,
          properties: { abnormal: duplicate.abnormal, service_date: serviceDate, status: duplicate.status, visit_time: visitTime },
          resourceId: tokenResult.data.resourceId, resourceType: tokenResult.data.resourceType,
          taskId: task.id, tokenRecordId: tokenResult.data.tokenId
        }),
        writeOutbox: () => recordSubmissionOutbox({
          abnormal: duplicate.abnormal, correlationId, idempotencyKey: duplicate.idempotencyKey,
          ownerId: tokenResult.data.ownerId, serviceDate, status: duplicate.status,
          submissionId: duplicate.submissionId, taskTitle: task.title, visitTime
        }),
        writeNotification: () => recordSubmissionNotification({
          abnormal: duplicate.abnormal,
          ownerId: tokenResult.data.ownerId,
          planId: tokenResult.data.resourceId,
          revision: duplicate.revision,
          serviceDate,
          status: duplicate.status,
          submissionId: duplicate.submissionId,
          taskId: task.id,
          taskTitle: task.title,
          visitTime
        })
      });
      if (!effects.ok) return serviceError("system_error", "The concurrent submission is saved, but its Audit or delivery record is unavailable. Retry with the same submission reference.");
      return serviceOk({
        ...duplicateResult.data,
        alreadySubmitted: true,
        message: "这项任务已经提交过，页面已显示之前的提交结果",
        submissionRef
      });
    }
  }

  if (insertResult.error) {
    return mapSupabaseError(insertResult.error);
  }

  const auditResult = await recordCatCareAuditEvent({
    actorType: "anonymous_token",
    correlationId,
    eventName: "care_submission_created",
    idempotencyKey,
    ownerId: tokenResult.data.ownerId,
    properties: {
      abnormal: insertResult.data.abnormal,
      service_date: serviceDate,
      status: insertResult.data.status,
      visit_time: visitTime
    },
    resourceId: tokenResult.data.resourceId,
    resourceType: tokenResult.data.resourceType,
    taskId: task.id,
    tokenRecordId: tokenResult.data.tokenId
  });
  if (!auditResult.ok) {
    return serviceError(
      "system_error",
      "The submission was saved, but its activity record could not be written. Retry safely with the same submission reference."
    );
  }
  const outboxResult = await recordSubmissionOutbox({
    abnormal: insertResult.data.abnormal,
    correlationId,
    idempotencyKey,
    ownerId: tokenResult.data.ownerId,
    serviceDate,
    status: insertResult.data.status,
    submissionId: insertResult.data.id,
    taskTitle: task.title,
    visitTime
  });
  if (!outboxResult.ok) {
    return serviceError("system_error", "The submission was saved, but its delivery record could not be written. Retry safely with the same submission reference.");
  }
  const notificationResult = await recordSubmissionNotification({
    abnormal: insertResult.data.abnormal,
    ownerId: tokenResult.data.ownerId,
    planId: tokenResult.data.resourceId,
    revision: insertResult.data.revision,
    serviceDate,
    status: insertResult.data.status,
    submissionId: insertResult.data.id,
    taskId: task.id,
    taskTitle: task.title,
    visitTime
  });
  if (!notificationResult.ok) {
    return serviceError("system_error", "The submission was saved, but its owner notification could not be written. Retry safely with the same submission reference.");
  }
  await trackCatCareProductEvent(
    "anonymous_token",
    "catcare_submission_created",
    { result: "created" },
    {
      correlation_id: correlationId,
      request_source: "catcare_anonymous_submit",
      resource_id: tokenResult.data.resourceId,
      resource_type: tokenResult.data.resourceType
    }
  );

  return serviceOk({
    abnormal: insertResult.data.abnormal,
    alreadySubmitted: false,
    attachmentCount: 0,
    message: "已提交，主人会在照护结果里看到这条反馈",
    note: insertResult.data.note,
    serviceDate,
    status: insertResult.data.status,
    submissionId: insertResult.data.id,
    submittedAt: insertResult.data.created_at,
    submissionRef
  });
}

function recordSubmissionOutbox({
  abnormal,
  correlationId,
  idempotencyKey,
  ownerId,
  serviceDate,
  status,
  submissionId,
  taskTitle,
  visitTime
}: {
  abnormal: boolean;
  correlationId: string;
  idempotencyKey: string;
  ownerId: string;
  serviceDate: string;
  status: Database["public"]["Tables"]["care_submissions"]["Row"]["status"];
  submissionId: string;
  taskTitle: string;
  visitTime: string;
}) {
  return recordCatCareOutboxEvent({
    aggregateId: submissionId,
    aggregateType: "care_submission",
    correlationId,
    eventType: "owner_notification",
    idempotencyKey,
    ownerId,
    payload: {
      abnormal,
      service_date: serviceDate,
      status,
      task_title: taskTitle,
      visit_time: visitTime
    }
  });
}

function recordSubmissionNotification(input: {
  abnormal: boolean;
  ownerId: string;
  planId: string;
  revision: number;
  serviceDate: string;
  status: Database["public"]["Tables"]["care_submissions"]["Row"]["status"];
  submissionId: string;
  taskId: string;
  taskTitle: string;
  visitTime: string;
}) {
  const { revision, ...notificationInput } = input;

  return recordOwnerSubmissionNotification({
    ...notificationInput,
    submissionRevision: revision
  });
}


function createAnonymousSubmissionIdempotencyKey(
  serviceDate: string,
  visitTime: string,
  submissionRef: string
) {
  return `anonymous:plan:${serviceDate}:${encodeAnonymousVisitTime(visitTime)}:${submissionRef}`;
}

function isAnonymousVisitTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function encodeAnonymousVisitTime(value: string) {
  return value.replace(":", "");
}

function parseAnonymousSubmissionStatus(
  value: FormDataEntryValue | null
): ServiceResult<Database["public"]["Tables"]["care_submissions"]["Row"]["status"]> {
  const status = parseAnonymousCareSubmissionStatus(value);

  if (status) {
    return serviceOk(status);
  }

  return serviceError("validation_error", "请选择有效的提交状态。", {
    status: "invalid"
  });
}

function parseAnonymousSubmissionNote(
  value: FormDataEntryValue | null
): ServiceResult<string | null> {
  const note = normalizeAnonymousCareSubmissionNote(value);

  if (note === undefined) {
    return serviceError("validation_error", "备注最多 2000 个字。", {
      note: "too_long"
    });
  }

  return serviceOk(note);
}

async function getAnonymousSubmissionBySlot(
  client: AppSupabaseClient,
  ownerId: string,
  planId: string,
  taskId: string,
  serviceDate: string,
  visitTime: string
): Promise<ServiceResult<AnonymousCareSubmissionSlotView | null>> {
  const result = await client
    .from("care_submissions")
    .select("id, status, note, abnormal, idempotency_key, created_at, revision")
    .eq("owner_id", ownerId)
    .eq("plan_id", planId)
    .eq("task_id", taskId)
    .like("idempotency_key", "anonymous:%")
    .order("created_at", { ascending: false });

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  const submission = (result.data ?? []).find((row) => {
    const slot = parseAnonymousCareSubmissionSlotKey(row.idempotency_key);

    return slot?.serviceDate === serviceDate && slot.visitTime === visitTime;
  });

  if (!submission?.idempotency_key) {
    return serviceOk(null);
  }

  const attachmentResult = await client
    .from("care_submission_attachments")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("plan_id", planId)
    .eq("submission_id", submission.id);

  if (attachmentResult.error) {
    return mapSupabaseError(attachmentResult.error);
  }

  return serviceOk({
    abnormal: submission.abnormal,
    attachmentCount: Math.min(attachmentResult.count ?? 0, careEvidenceMaxCount),
    idempotencyKey: submission.idempotency_key,
    note: submission.note,
    revision: submission.revision,
    submissionId: submission.id,
    serviceDate,
    status: submission.status,
    submittedAt: submission.created_at
  });
}
