import "server-only";

import { randomUUID } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient, type AppSupabaseClient } from "../../supabase/server";
import type { Json } from "../../supabase/database.types";
import { recordCatCareAuditEvent } from "./audit";
import { mapEvidenceAttachment } from "./care-evidence";
import {
  getCareEventReferenceDate,
  isCareEventRelevantToPlan
} from "./plan-event-policy";

import {
  CARE_EVENT_SELECT,
  CARE_PLAN_CAT_SELECT,
  CAT_SELECT,
  CareEventRow,
  CareRoutineItemRow,
  CatCareItem,
  CatCarePlan,
  CatCareTask,
  CatRow,
  CreatePlanInput,
  ROUTINE_ITEM_SELECT,
  ROUTINE_SELECT,
  getAuthenticatedOwnerId,
  loadCatItemAssignments,
  loadLegacyCareItems,
  loadOwnerLibraryItems,
  mapCatItemAssignment,
  mapPlan,
  mapPlanParticipant,
  mapSubmission,
  mapSupabaseError,
  mapTask,
  normalizeCareTaskCategory,
  normalizeOptionalText,
  normalizePlanInput,
  normalizePlanVisitCount,
  normalizeTaskTimeHint,
  trackCatCareProductEvent,
  withRelatedItemInstruction,
  withTaskScopeTitle,
} from "./core";

export async function createCatCarePlanFromFormData(
  formData: FormData,
  options: {
    beforeCreate?: (context: CreateCatCarePlanContext) => Promise<ServiceResult<unknown>>;
  } = {}
): Promise<ServiceResult<CatCarePlan>> {
  const inputResult = normalizePlanInput({
    catIds: formData.getAll("catIds"),
    scenario: formData.get("scenario"),
    visitCount: formData.get("visitCount"),
    startOn: formData.get("startOn"),
    endOn: formData.get("endOn"),
    handoffNotes: formData.get("handoffNotes"),
    title: formData.get("title"),
    taskTitle: formData.get("taskTitle"),
    taskInstructions: formData.get("taskInstructions")
  });

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

  const generationRequestId = normalizeOptionalText(
    formData.get("generationRequestId")
  );

  if (generationRequestId) {
    const existingPlanResult = await clientResult.data
      .from("care_plans")
      .select(
        "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
      )
      .eq("owner_id", ownerResult.data)
      .filter("ai_input_summary->>generation_request_id", "eq", generationRequestId)
      .maybeSingle();

    if (existingPlanResult.error) {
      return mapSupabaseError(existingPlanResult.error);
    }

    if (existingPlanResult.data) {
      return serviceOk({
        ...mapPlan(existingPlanResult.data),
        submissions: [],
        tasks: []
      });
    }
  }

  const catsResult = await clientResult.data
    .from("cats")
    .select(CAT_SELECT)
    .eq("owner_id", ownerResult.data)
    .is("deleted_at", null)
    .in("id", inputResult.data.catIds);

  if (catsResult.error) {
    return mapSupabaseError(catsResult.error);
  }

  const selectedCats = inputResult.data.catIds
    .map((catId) => (catsResult.data ?? []).find((cat) => cat.id === catId))
    .filter((cat): cat is CatRow => Boolean(cat));

  if (selectedCats.length !== inputResult.data.catIds.length) {
    return serviceError("validation_error", "One or more selected cats are no longer active.", {
      catIds: "stale"
    });
  }

  if (!inputResult.data.startOn) {
    return serviceError("validation_error", "Set a start date for the care plan.", {
      startOn: "required"
    });
  }

  const planTasksResult = await buildMultiCatPlanTasks(
    clientResult.data,
    ownerResult.data,
    selectedCats,
    inputResult.data.tasks,
    inputResult.data.startOn
  );

  if (!planTasksResult.ok) {
    return planTasksResult;
  }

  const tasks = mergeGeneratedCareTasks(planTasksResult.data.tasks).map((task) =>
    withGeneratedTaskTimeHint(task, inputResult.data.visitCount)
  );

  if (tasks.length === 0) {
    return serviceError(
      "validation_error",
      "Set a reusable routine before generating a care plan.",
      { routine: "required" }
    );
  }

  const beforeCreateResult = await options.beforeCreate?.({
    cats: selectedCats.map((cat) => ({
      id: cat.id,
      name: cat.name
    })),
    eventCount: planTasksResult.data.eventCount,
    input: inputResult.data,
    itemCount: planTasksResult.data.itemCount,
    ownerId: ownerResult.data,
    routineCount: planTasksResult.data.routineCount,
    taskCount: tasks.length
  });

  if (beforeCreateResult && !beforeCreateResult.ok) {
    return beforeCreateResult;
  }

  const { data: plan, error: planError } = await clientResult.data
    .from("care_plans")
    .insert({
      cat_id: inputResult.data.catId,
      generation_source: "ai_mock",
      ai_input_summary: {
        care_event_count: planTasksResult.data.eventCount,
        care_item_count: planTasksResult.data.itemCount,
        cat_count: selectedCats.length,
        cat_ids: selectedCats.map((cat) => cat.id),
        cat_names: selectedCats.map((cat) => cat.name),
        generated_from: planTasksResult.data.routineCount > 0 ? "routine" : "manual_fallback",
        generation_request_id: generationRequestId,
        routine_count: planTasksResult.data.routineCount,
        task_count: tasks.length,
        visit_count: inputResult.data.visitCount
      },
      handoff_notes: inputResult.data.handoffNotes,
      owner_id: ownerResult.data,
      routine_id: planTasksResult.data.primaryRoutineId,
      scenario: inputResult.data.scenario,
      end_on: inputResult.data.endOn,
      start_on: inputResult.data.startOn,
      title: inputResult.data.title
    })
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .single();

  if (planError) {
    return mapSupabaseError(planError);
  }

  const participantsResult = await clientResult.data
    .from("care_plan_cats")
    .insert(
      selectedCats.map((cat, sortOrder) => ({
        cat_id: cat.id,
        cat_name_snapshot: cat.name,
        plan_id: plan.id,
        sort_order: sortOrder
      }))
    )
    .select(CARE_PLAN_CAT_SELECT);

  if (participantsResult.error) {
    await clientResult.data.from("care_plans").delete().eq("id", plan.id);
    return mapSupabaseError(participantsResult.error);
  }

  const { data: taskRows, error: taskError } = await clientResult.data
    .from("care_tasks")
    .insert(
      tasks.map((task) => ({
        category: task.category,
        enabled: task.enabled ?? true,
        frequency: task.frequency ?? null,
        instructions: task.instructions,
        plan_id: plan.id,
        required: task.required,
        source: task.source ?? "owner",
        source_ref: task.sourceRef ?? null,
        sort_order: task.sortOrder,
        time_hint: task.timeHint ?? null,
        title: task.title
      }))
    )
    .select(
      "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, photo_required, enabled, created_at, updated_at"
    );

  if (taskError) {
    await clientResult.data.from("care_plans").delete().eq("id", plan.id);
    return mapSupabaseError(taskError);
  }

  await trackCatCareProductEvent(ownerResult.data, "catcare_plan_created", {
    care_event_count: planTasksResult.data.eventCount,
    cat_count: selectedCats.length,
    item_count: planTasksResult.data.itemCount,
    plan_status: plan.status,
    routine_count: planTasksResult.data.routineCount,
    scenario: inputResult.data.scenario,
    source: plan.generation_source,
    task_count: tasks.length
  });

  return serviceOk({
    ...mapPlan(plan),
    participants: (participantsResult.data ?? []).map(mapPlanParticipant),
    tasks: (taskRows ?? []).map(mapTask),
    submissions: []
  });
}

export type CreateCatCarePlanContext = {
  cats: Array<{ id: string; name: string }>;
  eventCount: number;
  input: CreatePlanInput;
  itemCount: number;
  ownerId: string;
  routineCount: number;
  taskCount: number;
};

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

async function buildMultiCatPlanTasks(
  client: AppSupabaseClient,
  ownerId: string,
  cats: CatRow[],
  fallbackTasks: CreatePlanInput["tasks"],
  planStartOn: string
): Promise<
  ServiceResult<{
    eventCount: number;
    itemCount: number;
    primaryRoutineId: string | null;
    routineCount: number;
    tasks: CreatePlanInput["tasks"];
  }>
> {
  const tasks: CreatePlanInput["tasks"] = [];
  const sharedTaskKeys = new Set<string>();
  const catIds = cats.map((cat) => cat.id);
  let eventCount = 0;
  let itemCount = 0;
  let primaryRoutineId: string | null = null;
  let routineCount = 0;

  const [
    routinesResult,
    allAssignmentsResult,
    libraryItemsResult,
    careEventsResult
  ] = await Promise.all([
    client
      .from("care_routines")
      .select(ROUTINE_SELECT)
      .eq("owner_id", ownerId)
      .in("cat_id", catIds)
      .eq("is_default", true),
    loadCatItemAssignments(client, ownerId),
    loadOwnerLibraryItems(client, ownerId),
    client
      .from("care_events")
      .select(CARE_EVENT_SELECT)
      .eq("owner_id", ownerId)
      .in("cat_id", catIds)
      .in("severity", ["watch", "urgent"])
      .order("occurred_on", { ascending: false })
      .limit(100)
  ]);

  if (routinesResult.error) {
    return mapSupabaseError(routinesResult.error);
  }

  if (!allAssignmentsResult.ok) {
    return allAssignmentsResult;
  }

  if (!libraryItemsResult.ok) {
    return libraryItemsResult;
  }

  if (careEventsResult.error) {
    return mapSupabaseError(careEventsResult.error);
  }

  const routinesByCatId = new Map(
    (routinesResult.data ?? []).map((routine) => [routine.cat_id, routine])
  );
  const routineIds = (routinesResult.data ?? []).map((routine) => routine.id);
  const routineItemsResult =
    routineIds.length > 0
      ? await client
          .from("care_routine_items")
          .select(ROUTINE_ITEM_SELECT)
          .in("routine_id", routineIds)
          .eq("enabled", true)
          .order("sort_order", { ascending: true })
      : null;

  if (routineItemsResult?.error) {
    return mapSupabaseError(routineItemsResult.error);
  }

  const routineItemsByRoutineId = new Map<string, CareRoutineItemRow[]>();

  for (const item of routineItemsResult?.data ?? []) {
    const items = routineItemsByRoutineId.get(item.routine_id) ?? [];
    items.push(item);
    routineItemsByRoutineId.set(item.routine_id, items);
  }

  const libraryById = new Map(
    libraryItemsResult.data.map((item) => [item.id, item])
  );
  const assignedItemsByCatId = new Map<string, CatCareItem[]>();

  if (allAssignmentsResult.data !== null) {
    for (const assignment of allAssignmentsResult.data
      .filter((assignment) => catIds.includes(assignment.cat_id))
      .filter((assignment) => assignment.visible_to_sitter)
      .sort((left, right) => right.created_at.localeCompare(left.created_at))) {
      const libraryItem = libraryById.get(assignment.owner_item_id);

      if (!libraryItem) {
        continue;
      }

      const items = assignedItemsByCatId.get(assignment.cat_id) ?? [];

      if (items.length < 8) {
        items.push(mapCatItemAssignment(assignment, libraryItem));
        assignedItemsByCatId.set(assignment.cat_id, items);
      }
    }
  }

  const eventsByCatId = new Map<string, CareEventRow[]>();

  const eligibleEvents = (careEventsResult.data ?? [])
    .filter((event) => isCareEventRelevantToPlan(event, planStartOn))
    .sort((left, right) =>
      (getCareEventReferenceDate(right) ?? "").localeCompare(
        getCareEventReferenceDate(left) ?? ""
      )
    );

  for (const event of eligibleEvents) {
    const events = eventsByCatId.get(event.cat_id) ?? [];

    if (events.length < 4) {
      events.push(event);
      eventsByCatId.set(event.cat_id, events);
    }
  }

  for (const cat of cats) {
    const routine = routinesByCatId.get(cat.id);
    const routineItems = routine ? routineItemsByRoutineId.get(routine.id) ?? [] : [];

    if (routine) {
      primaryRoutineId ??= routine.id;
      routineCount += 1;
    }

    const careItemsResult = allAssignmentsResult.data === null
      ? await loadLegacyCareItems(client, ownerId, cat.id, {
          limit: 8,
          visibleOnly: true
        })
      : serviceOk(assignedItemsByCatId.get(cat.id) ?? []);

    if (!careItemsResult.ok) {
      return careItemsResult;
    }

    for (const item of routineItems) {
      const shared = item.category === "water" || item.category === "litter";
      const sharedKey = `${item.category}:${item.title}`;

      if (shared) {
        if (sharedTaskKeys.has(sharedKey)) {
          continue;
        }

        sharedTaskKeys.add(sharedKey);
      }

      tasks.push({
        category: item.category,
        enabled: item.enabled,
        frequency: item.frequency,
        instructions: item.instructions,
        required: true,
        sortOrder: tasks.length,
        source: "routine",
        sourceRef: item.id,
        timeHint: item.time_hint,
        title: shared ? `家庭共用：${item.title}` : `${cat.name}：${item.title}`
      });
    }

    itemCount += careItemsResult.data.length;

    for (const event of eventsByCatId.get(cat.id) ?? []) {
      eventCount += 1;
      tasks.push({
        category: "observe",
        enabled: true,
        frequency: null,
        instructions: [
          getCareEventReferenceDate(event)
            ? `事件日期：${getCareEventReferenceDate(event)}`
            : null,
          event.note,
          event.related_item_name ? `关联：${event.related_item_name}` : null
        ]
          .filter(Boolean)
          .join("；"),
        required: event.severity === "urgent",
        sortOrder: tasks.length,
        source: "event",
        sourceRef: event.id,
        timeHint: null,
        title: `${cat.name}：关注 ${event.title}`
      });
    }
  }

  return serviceOk({
    eventCount,
    itemCount,
    primaryRoutineId,
    routineCount,
    tasks: tasks.length > 0 ? tasks : fallbackTasks
  });
}

function mergeGeneratedCareTasks(tasks: CreatePlanInput["tasks"]) {
  const groups = new Map<string, CreatePlanInput["tasks"]>();
  const order: Array<
    | { key: string; type: "group" }
    | { task: CreatePlanInput["tasks"][number]; type: "task" }
  > = [];

  for (const task of tasks) {
    const parsed = parseCatScopedTaskTitle(task.title);

    if (!parsed || task.source !== "routine") {
      order.push({ task, type: "task" });
      continue;
    }

    const key = [
      task.category ?? "other",
      task.frequency ?? "",
      task.timeHint ?? "",
      parsed.action
    ].join("|");

    const group = groups.get(key) ?? [];
    group.push(task);
    groups.set(key, group);

    if (group.length === 1) {
      order.push({ key, type: "group" });
    }
  }

  const merged = order.map((entry) => {
    if (entry.type === "task") {
      return entry.task;
    }

    const group = groups.get(entry.key) ?? [];

    if (group.length < 2) {
      return group[0];
    }

    const parsed = group
      .map((task) => ({ task, title: parseCatScopedTaskTitle(task.title) }))
      .filter((item): item is { task: CreatePlanInput["tasks"][number]; title: { action: string; catName: string } } =>
        Boolean(item.title)
      );
    const instructions = parsed
      .map(({ task, title }) =>
        task.instructions ? `${title.catName}：${task.instructions}` : null
      )
      .filter((line): line is string => Boolean(line));

    return {
      ...group[0],
      instructions:
        instructions.length > 0
          ? Array.from(new Set(instructions)).join("\n")
          : group[0].instructions,
      required: group.some((task) => task.required),
      source: "ai_suggestion" as const,
      sourceRef: null,
      title: `${parsed.map(({ title }) => title.catName).join("、")}：${parsed[0].title.action}`
    };
  });

  return merged.map((task, index) => ({ ...task, sortOrder: index }));
}

function withGeneratedTaskTimeHint(
  task: CreatePlanInput["tasks"][number],
  visitCount: number
): CreatePlanInput["tasks"][number] {
  return { ...task, timeHint: getGeneratedTaskTimeHint(task, visitCount) };
}

function getGeneratedTaskTimeHint(
  task: CreatePlanInput["tasks"][number],
  visitCount: number
) {
  const category = task.category ?? "other";
  const count =
    category === "meal" || category === "treat" || category === "medicine"
      ? getDailyFrequencyCount(task.frequency)
      : 1;
  const visitSlots = getVisitSlots(visitCount);

  const slots: Record<string, string[]> = {
    litter: [visitSlots.at(-1) ?? "18:30"],
    meal: visitSlots,
    medicine: visitSlots,
    observe: [visitSlots.at(-1) ?? "18:30"],
    other: [visitSlots.at(-1) ?? "18:30"],
    play: [visitSlots.at(-1) ?? "18:30"],
    treat: [visitSlots.at(-1) ?? "18:30"],
    water: [visitSlots[0] ?? "08:30"]
  };

  return (slots[category] ?? slots.other)
    .slice(0, Math.max(1, Math.min(count, visitSlots.length)))
    .join(",");
}

function getDailyFrequencyCount(frequency: string | null | undefined) {
  const match = /^daily(?:_(\d+))?$/.exec(frequency ?? "");

  return Math.max(1, Math.min(4, Number(match?.[1] ?? "1") || 1));
}

function getVisitSlots(visitCount: number) {
  if (visitCount <= 1) {
    return ["18:30"];
  }

  if (visitCount === 2) {
    return ["08:30", "18:30"];
  }

  return ["08:30", "12:30", "18:30"];
}

function parseCatScopedTaskTitle(title: string) {
  const separatorIndex = title.indexOf("：");

  if (separatorIndex < 1) {
    return null;
  }

  const catName = title.slice(0, separatorIndex).trim();
  const action = title.slice(separatorIndex + 1).trim();

  if (!catName || !action || catName === "家庭共用") {
    return null;
  }

  return { action, catName };
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
