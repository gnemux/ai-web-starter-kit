import "server-only";

import {
  serviceError,
  serviceOk,
  type ServiceResult
} from "@xwlc/core";
import {
  createOwnerScope,
  type DbBoundaryResult
} from "@xwlc/db";

import {
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../supabase/server";
import type { Database } from "../supabase/database.types";

type CatRow = Database["public"]["Tables"]["cats"]["Row"];
type CarePlanRow = Database["public"]["Tables"]["care_plans"]["Row"];
type CareTaskRow = Database["public"]["Tables"]["care_tasks"]["Row"];
type CareSubmissionRow =
  Database["public"]["Tables"]["care_submissions"]["Row"];

export type CarePlanStatus = "draft" | "published" | "reviewed" | "closed";
export type CareSubmissionStatus = "completed" | "note" | "exception";

export type CatCareCat = {
  id: string;
  ownerId: string;
  name: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatCareTask = {
  id: string;
  planId: string;
  title: string;
  instructions: string | null;
  sortOrder: number;
  required: boolean;
};

export type CatCareSubmission = {
  id: string;
  ownerId: string;
  planId: string;
  taskId: string | null;
  submittedByLabel: string;
  status: CareSubmissionStatus;
  note: string | null;
  createdAt: string;
};

export type CatCarePlan = {
  id: string;
  ownerId: string;
  catId: string;
  title: string;
  status: CarePlanStatus;
  startOn: string | null;
  endOn: string | null;
  handoffNotes: string | null;
  publishedAt: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: CatCareTask[];
  submissions: CatCareSubmission[];
};

export type CatCareWorkspace = {
  cats: CatCareCat[];
  plans: CatCarePlan[];
};

type CreateCatInput = {
  name: string;
  notes: string | null;
};

type CreatePlanInput = {
  catId: string;
  title: string;
  startOn: string | null;
  endOn: string | null;
  handoffNotes: string | null;
  tasks: Array<{
    title: string;
    instructions: string | null;
    sortOrder: number;
    required: boolean;
  }>;
};

export async function getCatCareWorkspace(): Promise<
  ServiceResult<CatCareWorkspace>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const [catsResult, plansResult] = await Promise.all([
    clientResult.data
      .from("cats")
      .select(
        "id, owner_id, name, life_stage, breed, safety_notes, notes, created_at, updated_at"
      )
      .eq("owner_id", ownerResult.data)
      .order("created_at", { ascending: false }),
    clientResult.data
      .from("care_plans")
      .select(
        "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
      )
      .eq("owner_id", ownerResult.data)
      .order("created_at", { ascending: false })
  ]);

  if (catsResult.error) {
    return mapSupabaseError(catsResult.error);
  }

  if (plansResult.error) {
    return mapSupabaseError(plansResult.error);
  }

  const planIds = (plansResult.data ?? []).map((plan) => plan.id);
  const [tasksResult, submissionsResult] =
    planIds.length > 0
      ? await Promise.all([
          clientResult.data
            .from("care_tasks")
            .select(
              "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
            )
            .in("plan_id", planIds)
            .order("sort_order", { ascending: true }),
          clientResult.data
            .from("care_submissions")
            .select(
              "id, owner_id, plan_id, task_id, submitted_by_label, status, note, abnormal, idempotency_key, created_at"
            )
            .in("plan_id", planIds)
            .order("created_at", { ascending: false })
        ])
      : [null, null];

  if (tasksResult?.error) {
    return mapSupabaseError(tasksResult.error);
  }

  if (submissionsResult?.error) {
    return mapSupabaseError(submissionsResult.error);
  }

  const tasksByPlan = groupByPlan((tasksResult?.data ?? []).map(mapTask));
  const submissionsByPlan = groupByPlan(
    (submissionsResult?.data ?? []).map(mapSubmission)
  );

  return serviceOk({
    cats: (catsResult.data ?? []).map(mapCat),
    plans: (plansResult.data ?? []).map((plan) => ({
      ...mapPlan(plan),
      tasks: tasksByPlan.get(plan.id) ?? [],
      submissions: submissionsByPlan.get(plan.id) ?? []
    }))
  });
}

export async function createCatCareCatFromFormData(
  formData: FormData
): Promise<ServiceResult<CatCareCat>> {
  const inputResult = normalizeCatInput({
    name: formData.get("name"),
    notes: formData.get("notes")
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

  const { data, error } = await clientResult.data
    .from("cats")
    .insert({
      owner_id: ownerResult.data,
      name: inputResult.data.name,
      notes: inputResult.data.notes
    })
    .select(
      "id, owner_id, name, life_stage, breed, safety_notes, notes, created_at, updated_at"
    )
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk(mapCat(data));
}

export async function createCatCarePlanFromFormData(
  formData: FormData
): Promise<ServiceResult<CatCarePlan>> {
  const inputResult = normalizePlanInput({
    catId: formData.get("catId"),
    title: formData.get("title"),
    startOn: formData.get("startOn"),
    endOn: formData.get("endOn"),
    handoffNotes: formData.get("handoffNotes"),
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

  const { data: plan, error: planError } = await clientResult.data
    .from("care_plans")
    .insert({
      owner_id: ownerResult.data,
      cat_id: inputResult.data.catId,
      title: inputResult.data.title,
      start_on: inputResult.data.startOn,
      end_on: inputResult.data.endOn,
      handoff_notes: inputResult.data.handoffNotes
    })
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .single();

  if (planError) {
    return mapSupabaseError(planError);
  }

  const { data: tasks, error: taskError } = await clientResult.data
    .from("care_tasks")
    .insert(
      inputResult.data.tasks.map((task) => ({
        plan_id: plan.id,
        title: task.title,
        instructions: task.instructions,
        sort_order: task.sortOrder,
        required: task.required
      }))
    )
    .select(
      "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
    );

  if (taskError) {
    await clientResult.data.from("care_plans").delete().eq("id", plan.id);
    return mapSupabaseError(taskError);
  }

  return serviceOk({
    ...mapPlan(plan),
    tasks: (tasks ?? []).map(mapTask),
    submissions: []
  });
}

export async function publishCatCarePlan(
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

  const { count, error: taskError } = await clientResult.data
    .from("care_tasks")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", planId);

  if (taskError) {
    return mapSupabaseError(taskError);
  }

  if (!count) {
    return serviceError(
      "validation_error",
      "Add at least one care task before publishing.",
      { taskTitle: "required" }
    );
  }

  const { data, error } = await clientResult.data
    .from("care_plans")
    .update({
      status: "published",
      published_at: new Date().toISOString()
    })
    .eq("id", planId)
    .eq("owner_id", ownerResult.data)
    .eq("status", "draft")
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk({
    ...mapPlan(data),
    tasks: [],
    submissions: []
  });
}

async function getAuthenticatedOwnerId(
  supabase: AppSupabaseClient
): Promise<ServiceResult<string>> {
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    return serviceError(
      "unauthorized",
      "Sign in before using CatCare."
    );
  }

  const scopeResult = createOwnerScope(userId, userId);

  if (!scopeResult.ok) {
    return mapDbBoundaryError(scopeResult);
  }

  return serviceOk(userId);
}

function normalizeCatInput(input: {
  name: FormDataEntryValue | null;
  notes: FormDataEntryValue | null;
}): ServiceResult<CreateCatInput> {
  const name = String(input.name ?? "").trim();
  const notes = normalizeOptionalText(input.notes);
  const fields: Record<string, string> = {};

  if (name.length < 1 || name.length > 80) {
    fields.name = "invalid";
  }

  if (notes && notes.length > 2000) {
    fields.notes = "invalid";
  }

  if (Object.keys(fields).length > 0) {
    return serviceError("validation_error", "Check the cat profile fields.", fields);
  }

  return serviceOk({ name, notes });
}

function normalizePlanInput(input: {
  catId: FormDataEntryValue | null;
  title: FormDataEntryValue | null;
  startOn: FormDataEntryValue | null;
  endOn: FormDataEntryValue | null;
  handoffNotes: FormDataEntryValue | null;
  taskTitle: FormDataEntryValue | null;
  taskInstructions: FormDataEntryValue | null;
}): ServiceResult<CreatePlanInput> {
  const catId = String(input.catId ?? "").trim();
  const title = String(input.title ?? "").trim();
  const startOn = normalizeDate(input.startOn);
  const endOn = normalizeDate(input.endOn);
  const handoffNotes = normalizeOptionalText(input.handoffNotes);
  const taskTitle = String(input.taskTitle ?? "").trim();
  const taskInstructions = normalizeOptionalText(input.taskInstructions);
  const fields: Record<string, string> = {};

  if (!catId) {
    fields.catId = "required";
  }

  if (title.length < 1 || title.length > 120) {
    fields.title = "invalid";
  }

  if (startOn && endOn && endOn < startOn) {
    fields.endOn = "invalid";
  }

  if (handoffNotes && handoffNotes.length > 2000) {
    fields.handoffNotes = "invalid";
  }

  if (taskTitle.length < 1 || taskTitle.length > 120) {
    fields.taskTitle = "invalid";
  }

  if (taskInstructions && taskInstructions.length > 2000) {
    fields.taskInstructions = "invalid";
  }

  if (Object.keys(fields).length > 0) {
    return serviceError("validation_error", "Check the care plan fields.", fields);
  }

  return serviceOk({
    catId,
    title,
    startOn,
    endOn,
    handoffNotes,
    tasks: [
      {
        title: taskTitle,
        instructions: taskInstructions,
        sortOrder: 0,
        required: true
      }
    ]
  });
}

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function groupByPlan<T extends { planId: string }>(items: T[]) {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    groups.set(item.planId, [...(groups.get(item.planId) ?? []), item]);
  }

  return groups;
}

function mapDbBoundaryError(
  result: Extract<DbBoundaryResult<unknown>, { ok: false }>
): ServiceResult<never> {
  return serviceError(
    result.code === "scope_mismatch" ? "forbidden" : "unauthorized",
    result.message
  );
}

function mapCat(row: CatRow): CatCareCat {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPlan(row: CarePlanRow): Omit<CatCarePlan, "tasks" | "submissions"> {
  return {
    id: row.id,
    ownerId: row.owner_id,
    catId: row.cat_id,
    title: row.title,
    status: row.status,
    startOn: row.start_on,
    endOn: row.end_on,
    handoffNotes: row.handoff_notes,
    publishedAt: row.published_at,
    reviewedAt: row.reviewed_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapTask(row: CareTaskRow): CatCareTask {
  return {
    id: row.id,
    planId: row.plan_id,
    title: row.title,
    instructions: row.instructions,
    sortOrder: row.sort_order,
    required: row.required
  };
}

function mapSubmission(row: CareSubmissionRow): CatCareSubmission {
  return {
    id: row.id,
    ownerId: row.owner_id,
    planId: row.plan_id,
    taskId: row.task_id,
    submittedByLabel: row.submitted_by_label,
    status: row.status,
    note: row.note,
    createdAt: row.created_at
  };
}

function mapSupabaseError(error: { code?: string }): ServiceResult<never> {
  if (error.code === "42501") {
    return serviceError(
      "forbidden",
      "This account does not have access to that CatCare data."
    );
  }

  if (error.code === "23503") {
    return serviceError(
      "validation_error",
      "Choose a valid cat profile before creating the plan.",
      { catId: "invalid" }
    );
  }

  if (error.code === "PGRST116") {
    return serviceError("not_found", "The requested plan was not found.");
  }

  return serviceError(
    "system_error",
    "CatCare is temporarily unavailable."
  );
}
