import "server-only";

import { randomUUID } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import type { Json } from "../../supabase/database.types";
import { createSupabaseServerClient } from "../../supabase/server";
import { recordCatCareAuditEvent } from "./audit";
import {
  type CatCarePlan,
  type CatCareTask,
  getAuthenticatedOwnerId,
  mapSupabaseError,
  normalizeCareTaskCategory,
  normalizeOptionalText,
  normalizePlanVisitCount,
  normalizeTaskTimeHint,
  trackCatCareProductEvent,
  withRelatedItemInstruction,
  withTaskScopeTitle
} from "./core";
import { getCatCarePlanDetail } from "./plan-read";

export async function updateCatCarePlanTasksFromFormData(
  formData: FormData
): Promise<ServiceResult<{ handoffNotes: string | null; id: string; tasks: CatCareTask[] }>> {
  const result = await saveCatCarePlanTaskForm(formData, false);

  if (!result.ok) {
    return result;
  }

  return serviceOk({
    handoffNotes: result.data.handoffNotes,
    id: result.data.id,
    tasks: result.data.tasks
  });
}

export async function saveAndPublishCatCarePlanFromFormData(
  formData: FormData
): Promise<ServiceResult<CatCarePlan>> {
  return saveCatCarePlanTaskForm(formData, true);
}

async function saveCatCarePlanTaskForm(
  formData: FormData,
  shouldPublish: boolean
): Promise<ServiceResult<CatCarePlan>> {
  const inputResult = normalizeAtomicPlanInput(formData, shouldPublish);

  if (!inputResult.ok) {
    return inputResult;
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const correlationId = randomUUID();
  const saveResult = await clientResult.data.rpc("save_care_plan_tasks", {
    should_publish: shouldPublish,
    submitted_handoff_notes: inputResult.data.handoffNotes,
    submitted_new_tasks: inputResult.data.newTasks,
    submitted_task_updates: inputResult.data.taskUpdates,
    submitted_visit_count: inputResult.data.visitCount,
    target_plan_id: inputResult.data.planId
  });

  if (saveResult.error) {
    return mapAtomicPlanSaveError(saveResult.error);
  }

  const saved = saveResult.data?.[0];

  if (
    !saved ||
    saved.saved_owner_id !== ownerResult.data ||
    saved.saved_plan_id !== inputResult.data.planId ||
    saved.plan_status !== (shouldPublish ? "published" : "draft")
  ) {
    return serviceError("system_error", "照护计划保存结果暂时无法确认，请刷新后重试。");
  }

  const detailResult = await getCatCarePlanDetail(inputResult.data.planId, {
    includeSubmissions: false
  });

  if (!detailResult.ok) {
    return detailResult;
  }

  if (shouldPublish) {
    await trackCatCareProductEvent(
      ownerResult.data,
      "catcare_plan_published",
      {
        enabled_task_count: saved.enabled_task_count,
        plan_status: detailResult.data.status,
        result: "success"
      },
      {
        correlation_id: correlationId,
        request_source: "catcare_plan_publish",
        resource_id: inputResult.data.planId,
        resource_type: "care_plan"
      }
    );
    void recordCatCareAuditEvent({
      actorType: "user",
      correlationId,
      eventName: "care_plan_published",
      ownerId: ownerResult.data,
      properties: { task_count: saved.enabled_task_count },
      resourceId: inputResult.data.planId,
      resourceType: "care_plan"
    });
  } else {
    await trackCatCareProductEvent(ownerResult.data, "catcare_plan_tasks_updated", {
      enabled_task_count: saved.enabled_task_count,
      task_count: detailResult.data.tasks.length
    });
  }

  return detailResult;
}

function normalizeAtomicPlanInput(
  formData: FormData,
  shouldPublish: boolean
): ServiceResult<{
  handoffNotes: string | null;
  newTasks: Json;
  planId: string;
  taskUpdates: Json;
  visitCount: number;
}> {
  const planId = String(formData.get("planId") ?? "").trim();
  const handoffNotes = normalizeOptionalText(formData.get("handoffNotes"));
  const visitCount = normalizePlanVisitCount(formData.get("visitCount"));
  const taskIds = Array.from(new Set(
    formData
      .getAll("taskId")
      .map((value) => String(value).trim())
      .filter(Boolean)
  ));

  if (!planId || taskIds.length === 0) {
    return serviceError("validation_error", "请保留至少一项可确认的照护任务。");
  }

  if (handoffNotes && handoffNotes.length > 2000) {
    return serviceError("validation_error", "交接备注最多 2000 个字。", {
      handoffNotes: "invalid"
    });
  }

  const taskUpdates: Array<Record<string, Json>> = [];

  for (const taskId of taskIds) {
    const title = String(formData.get(`task.${taskId}.title`) ?? "").trim();
    const instructions = normalizeOptionalText(
      formData.get(`task.${taskId}.instructions`)
    );
    const timeHint = normalizeTaskTimeHint(formData, `task.${taskId}.timeHint`);

    if (!title || title.length > 120) {
      return serviceError("validation_error", "请检查照护任务名称。", {
        title: "invalid"
      });
    }

    taskUpdates.push({
      enabled: formData.get(`task.${taskId}.enabled`) === "on",
      id: taskId,
      instructions,
      photo_required: formData.get(`task.${taskId}.photoRequired`) === "on",
      required: formData.get(`task.${taskId}.required`) === "on",
      time_hint: timeHint,
      title
    });
  }

  const newTaskIds = Array.from(new Set(
    formData
      .getAll("newTaskId")
      .map((value) => String(value).trim())
      .filter(Boolean)
  ));
  const legacyNewTaskTitle = String(formData.get("newTask.title") ?? "").trim();
  const pendingNewTaskIds = newTaskIds.length > 0
    ? newTaskIds
    : legacyNewTaskTitle
      ? [""]
      : [];
  const newTasks: Array<Record<string, Json>> = [];

  for (const newTaskId of pendingNewTaskIds) {
    const fieldPrefix = newTaskId ? `newTask.${newTaskId}` : "newTask";
    const newTaskTitle = String(formData.get(`${fieldPrefix}.title`) ?? "").trim();

    if (!newTaskTitle) {
      continue;
    }

    const scopedTitle = withTaskScopeTitle(
      newTaskTitle,
      normalizeOptionalText(formData.get(`${fieldPrefix}.scope`))
    );
    const instructions = withRelatedItemInstruction(
      normalizeOptionalText(formData.get(`${fieldPrefix}.instructions`)),
      normalizeOptionalText(formData.get(`${fieldPrefix}.relatedItem`))
    );

    if (scopedTitle.length > 120) {
      return serviceError("validation_error", "请检查新增照护任务名称。", {
        title: "invalid"
      });
    }

    newTasks.push({
      category: normalizeCareTaskCategory(formData.get(`${fieldPrefix}.category`)),
      enabled: formData.get(`${fieldPrefix}.enabled`) === "on",
      instructions,
      photo_required: formData.get(`${fieldPrefix}.photoRequired`) === "on",
      required: formData.get(`${fieldPrefix}.required`) === "on",
      time_hint: normalizeTaskTimeHint(formData, `${fieldPrefix}.timeHint`) ?? "08:30",
      title: scopedTitle
    });
  }

  if (
    shouldPublish &&
    !taskUpdates.some((task) => task.enabled === true) &&
    !newTasks.some((task) => task.enabled === true)
  ) {
    return serviceError("validation_error", "至少保留一项要执行的照护任务后再发布。");
  }

  return serviceOk({ handoffNotes, newTasks, planId, taskUpdates, visitCount });
}

function mapAtomicPlanSaveError(error: { code?: string; message?: string }) {
  if (error.message?.includes("care_plan_requires_enabled_task")) {
    return serviceError("validation_error", "至少保留一项要执行的照护任务后再发布。");
  }

  if (error.message?.includes("care_plan_not_editable")) {
    return serviceError("conflict", "这份计划已被发布或修改，请刷新页面后再操作。");
  }

  if (error.message?.includes("care_plan_task_set_changed")) {
    return serviceError("conflict", "计划任务已在其他页面发生变化，请刷新后重新确认。");
  }

  if (error.message?.includes("care_plan_")) {
    return serviceError("validation_error", "请检查当前照护清单后再发布。");
  }

  return mapSupabaseError(error);
}
