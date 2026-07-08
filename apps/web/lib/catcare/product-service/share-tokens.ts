import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";
import { createAnonymousTokenScope } from "@xwlc/db";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import {
  getAnonymousCarePlanServiceDates,
  getAnonymousCareTodayIsoDate,
  isAnonymousCareServiceDate,
  isAnonymousCareServiceDateInPlan,
  normalizeAnonymousCareSubmissionNote,
  parseAnonymousCareSubmissionStatus,
  requiresAnonymousCareSubmissionNote
} from "./anonymous-submission-policy";
import {
  clearCatCarePlanDetailCache,
  clearCatCarePlanSummaryCache,
  clearCatCareWorkspaceStatsCache,
  getAuthenticatedOwnerId,
  mapPlan,
  mapTask,
  mapDbBoundaryError,
  mapSupabaseError
} from "./core";

export type ShareTokenRow = Database["public"]["Tables"]["share_tokens"]["Row"];
export type ShareTokenScope = "care_plan";
export type ShareTokenResourceType = "care_plan";

export type ShareTokenActorContext = {
  actorType: "anonymous_token";
  expiresAt: string;
  ownerId: string;
  resourceId: string;
  resourceType: ShareTokenResourceType;
  scope: ShareTokenScope;
  tokenId: string;
};

export type CarePlanShareLinkState = {
  expiresAt: string | null;
  generatedAt: string | null;
  revokedAt: string | null;
  status: "not_generated" | "active" | "expired" | "revoked";
};

export type CarePlanShareLinkMutation = CarePlanShareLinkState & {
  token: string | null;
};

export type AnonymousCareTaskSubmissionView = {
  abnormal: boolean;
  note: string | null;
  serviceDate: string | null;
  status: Database["public"]["Tables"]["care_submissions"]["Row"]["status"];
  submittedAt: string;
};

export type AnonymousCareTaskView = {
  category: Database["public"]["Tables"]["care_tasks"]["Row"]["category"];
  frequency: string | null;
  instructions: string | null;
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

export type AnonymousCareSubmissionMutation = AnonymousCareTaskSubmissionView & {
  alreadySubmitted: boolean;
  message: string;
  submissionRef: string;
};

export const shareTokenScope: ShareTokenScope = "care_plan";
export const shareTokenResourceType: ShareTokenResourceType = "care_plan";
export const shareTokenTtlDays = 14;

export function createShareTokenSecret(): string {
  return randomBytes(32).toString("base64url");
}

export function hashShareTokenSecret(secret: string): ServiceResult<string> {
  const normalized = secret.trim();

  if (normalized.length < 32) {
    return serviceError("validation_error", "Share token is invalid.", {
      token: "invalid"
    });
  }

  return serviceOk(
    createHash("sha256").update(normalized, "utf8").digest("base64url")
  );
}

export function createShareTokenExpiry(now = new Date()): string {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + shareTokenTtlDays);
  return expiresAt.toISOString();
}

export function isShareTokenHashMatch(secret: string, hash: string): boolean {
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    return false;
  }

  const actual = Buffer.from(hashResult.data);
  const expected = Buffer.from(hash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function getCarePlanShareLinkState(
  planId: string
): Promise<ServiceResult<CarePlanShareLinkState>> {
  const contextResult = await getOwnerPlanShareContext(planId);

  if (!contextResult.ok) {
    return contextResult;
  }

  const tokenResult = await contextResult.data.client
    .from("share_tokens")
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .eq("owner_id", contextResult.data.ownerId)
    .eq("resource_type", shareTokenResourceType)
    .eq("resource_id", planId)
    .eq("scope", shareTokenScope)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenResult.error) {
    return mapSupabaseError(tokenResult.error);
  }

  return serviceOk(mapShareTokenState(tokenResult.data));
}

export async function createCarePlanShareLink(
  planId: string
): Promise<ServiceResult<CarePlanShareLinkMutation>> {
  const contextResult = await getOwnerPlanShareContext(planId);

  if (!contextResult.ok) {
    return contextResult;
  }

  if (contextResult.data.planStatus !== "published") {
    return serviceError(
      "validation_error",
      "Only published care plans can be shared."
    );
  }

  const now = new Date().toISOString();
  const revokeResult = await contextResult.data.client
    .from("share_tokens")
    .update({ revoked_at: now })
    .eq("owner_id", contextResult.data.ownerId)
    .eq("resource_type", shareTokenResourceType)
    .eq("resource_id", planId)
    .eq("scope", shareTokenScope)
    .is("revoked_at", null);

  if (revokeResult.error) {
    return mapSupabaseError(revokeResult.error);
  }

  const token = createShareTokenSecret();
  const hashResult = hashShareTokenSecret(token);

  if (!hashResult.ok) {
    return hashResult;
  }

  const insertResult = await contextResult.data.client
    .from("share_tokens")
    .insert({
      expires_at: createShareTokenExpiry(),
      owner_id: contextResult.data.ownerId,
      resource_id: planId,
      resource_type: shareTokenResourceType,
      scope: shareTokenScope,
      token_hash: hashResult.data
    })
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .single();

  if (insertResult.error) {
    return mapSupabaseError(insertResult.error);
  }

  return serviceOk({
    ...mapShareTokenState(insertResult.data),
    token
  });
}

export async function revokeCarePlanShareLink(
  planId: string
): Promise<ServiceResult<CarePlanShareLinkMutation>> {
  const contextResult = await getOwnerPlanShareContext(planId);

  if (!contextResult.ok) {
    return contextResult;
  }

  const revokedAt = new Date().toISOString();
  const revokeResult = await contextResult.data.client
    .from("share_tokens")
    .update({ revoked_at: revokedAt })
    .eq("owner_id", contextResult.data.ownerId)
    .eq("resource_type", shareTokenResourceType)
    .eq("resource_id", planId)
    .eq("scope", shareTokenScope)
    .is("revoked_at", null)
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (revokeResult.error) {
    return mapSupabaseError(revokeResult.error);
  }

  return serviceOk({
    ...mapShareTokenState(revokeResult.data),
    token: null
  });
}

export async function resolveCarePlanShareToken(
  secret: string,
  now = new Date()
): Promise<ServiceResult<ShareTokenActorContext>> {
  const hashResult = hashShareTokenSecret(secret);

  if (!hashResult.ok) {
    return hashResult;
  }

  const clientResult = createSupabaseAdminClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const tokenResult = await clientResult.data
    .from("share_tokens")
    .select(
      "id, owner_id, resource_type, resource_id, token_hash, scope, expires_at, revoked_at, last_used_at, created_at, updated_at"
    )
    .eq("token_hash", hashResult.data)
    .eq("resource_type", shareTokenResourceType)
    .eq("scope", shareTokenScope)
    .maybeSingle();

  if (tokenResult.error) {
    return mapSupabaseError(tokenResult.error);
  }

  if (!tokenResult.data) {
    return serviceError("unauthorized", "Share link is invalid.", {
      token: "invalid"
    });
  }

  const token = tokenResult.data;

  if (token.revoked_at) {
    return serviceError("forbidden", "Share link has been revoked.", {
      token: "revoked"
    });
  }

  if (new Date(token.expires_at).getTime() <= now.getTime()) {
    return serviceError("forbidden", "Share link has expired.", {
      token: "expired"
    });
  }

  const scopeResult = createAnonymousTokenScope(token.id);

  if (!scopeResult.ok) {
    return mapDbBoundaryError(scopeResult);
  }

  await clientResult.data
    .from("share_tokens")
    .update({ last_used_at: now.toISOString() })
    .eq("id", token.id);

  return serviceOk({
    actorType: "anonymous_token",
    expiresAt: token.expires_at,
    ownerId: token.owner_id,
    resourceId: token.resource_id,
    resourceType: token.resource_type,
    scope: token.scope,
    tokenId: token.id
  });
}

export async function getAnonymousCarePlanView(
  secret: string
): Promise<ServiceResult<AnonymousCarePlanView>> {
  const tokenResult = await resolveCarePlanShareToken(secret);

  if (!tokenResult.ok) {
    return tokenResult;
  }

  const clientResult = createSupabaseAdminClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const [planResult, tasksResult, submissionsResult] = await Promise.all([
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
        "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
      )
      .eq("plan_id", tokenResult.data.resourceId)
      .order("sort_order", { ascending: true }),
    clientResult.data
      .from("care_submissions")
      .select("task_id, status, note, abnormal, idempotency_key, created_at")
      .eq("owner_id", tokenResult.data.ownerId)
      .eq("plan_id", tokenResult.data.resourceId)
      .like("idempotency_key", `anonymous:${tokenResult.data.tokenId}:%`)
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

  if (planResult.data.status !== "published") {
    return serviceError("forbidden", "Care plan is no longer available.", {
      token: "unavailable"
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

  for (const submission of submissionsResult.data ?? []) {
    if (!submission.task_id) {
      continue;
    }

    const slot = parseAnonymousSubmissionSlotFromKey(
      tokenResult.data.tokenId,
      submission.idempotency_key
    );

    if (!slot) {
      continue;
    }

    const view = {
      abnormal: submission.abnormal,
      note: submission.note,
      serviceDate: slot.serviceDate,
      status: submission.status,
      submittedAt: submission.created_at
    };

    if (slot.visitTime) {
      submissionBySlotAndTaskId.set(`${slot.key}:${submission.task_id}`, view);
    } else {
      legacySubmissionByDateAndTaskId.set(
        `${slot.serviceDate}:${submission.task_id}`,
        view
      );
    }
  }
  const tasks = (tasksResult.data ?? [])
    .map(mapTask)
    .filter((task) => task.enabled && !isLegacyPrepareTask(task))
    .map((task) => ({
      category: task.category,
      frequency: task.frequency,
      instructions: task.instructions,
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
        tokenResult.data.tokenId,
        task.id
      ),
      sortOrder: task.sortOrder,
      timeHint: task.timeHint,
      title: task.title
    }));

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

export async function submitAnonymousCareSubmissionFromFormData(
  formData: FormData
): Promise<ServiceResult<AnonymousCareSubmissionMutation>> {
  const secret = String(formData.get("token") ?? "").trim();
  const serviceDate = String(formData.get("serviceDate") ?? "").trim();
  const submissionRef = String(formData.get("submissionRef") ?? "").trim();
  const visitTime = String(formData.get("visitTime") ?? "").trim();
  const statusResult = parseAnonymousSubmissionStatus(formData.get("status"));
  const noteResult = parseAnonymousSubmissionNote(formData.get("note"));

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

  const tokenResult = await resolveCarePlanShareToken(secret);

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
        "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
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
    .find(
      (item) =>
        createAnonymousTaskSubmissionRef(tokenResult.data.tokenId, item.id) ===
        submissionRef
    );

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
    tokenResult.data.tokenId,
    serviceDate,
    visitTime,
    submissionRef
  );
  const existingResult = await getAnonymousSubmissionByIdempotencyKey(
    clientResult.data,
    tokenResult.data.ownerId,
    tokenResult.data.resourceId,
    serviceDate,
    idempotencyKey
  );

  if (!existingResult.ok) {
    return existingResult;
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
          status
        })
        .eq("owner_id", tokenResult.data.ownerId)
        .eq("plan_id", tokenResult.data.resourceId)
        .eq("idempotency_key", idempotencyKey)
        .select("status, note, abnormal, created_at")
        .single();

      if (updateResult.error) {
        return mapSupabaseError(updateResult.error);
      }

      clearCatCarePlanCaches(
        tokenResult.data.ownerId,
        tokenResult.data.resourceId
      );

      return serviceOk({
        abnormal: updateResult.data.abnormal,
        alreadySubmitted: true,
        message: "已更新，主人会看到这项任务的最新反馈",
        note: updateResult.data.note,
        serviceDate,
        status: updateResult.data.status,
        submittedAt: updateResult.data.created_at,
        submissionRef
      });
    }

    clearCatCarePlanCaches(
      tokenResult.data.ownerId,
      tokenResult.data.resourceId
    );
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
    .select("status, note, abnormal, created_at")
    .single();

  if (insertResult.error?.code === "23505") {
    const duplicateResult = await getAnonymousSubmissionByIdempotencyKey(
      clientResult.data,
      tokenResult.data.ownerId,
      tokenResult.data.resourceId,
      serviceDate,
      idempotencyKey
    );

    if (!duplicateResult.ok) {
      return duplicateResult;
    }

    if (duplicateResult.data) {
      clearCatCarePlanCaches(
        tokenResult.data.ownerId,
        tokenResult.data.resourceId
      );
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

  clearCatCarePlanCaches(tokenResult.data.ownerId, tokenResult.data.resourceId);

  return serviceOk({
    abnormal: insertResult.data.abnormal,
    alreadySubmitted: false,
    message: "已提交，主人会在照护结果里看到这条反馈",
    note: insertResult.data.note,
    serviceDate,
    status: insertResult.data.status,
    submittedAt: insertResult.data.created_at,
    submissionRef
  });
}

function clearCatCarePlanCaches(ownerId: string, planId: string) {
  clearCatCarePlanDetailCache(ownerId, planId);
  clearCatCarePlanSummaryCache(ownerId);
  clearCatCareWorkspaceStatsCache(ownerId);
}

function createAnonymousTaskSubmissionRef(tokenId: string, taskId: string) {
  return createHash("sha256")
    .update(`${tokenId}:${taskId}`, "utf8")
    .digest("base64url")
    .slice(0, 32);
}

function createAnonymousSubmissionIdempotencyKey(
  tokenId: string,
  serviceDate: string,
  visitTime: string,
  submissionRef: string
) {
  return `anonymous:${tokenId}:${serviceDate}:${encodeAnonymousVisitTime(visitTime)}:${submissionRef}`;
}

function createAnonymousSubmissionSlotKey(serviceDate: string, visitTime: string) {
  return `${serviceDate}:${visitTime}`;
}

function isAnonymousVisitTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function encodeAnonymousVisitTime(value: string) {
  return value.replace(":", "");
}

function decodeAnonymousVisitTime(value: string | undefined) {
  return value && /^([01]\d|2[0-3])[0-5]\d$/.test(value)
    ? `${value.slice(0, 2)}:${value.slice(2)}`
    : null;
}

function getAnonymousTaskVisitTimes(task: {
  category: Database["public"]["Tables"]["care_tasks"]["Row"]["category"];
  frequency: string | null;
  timeHint: string | null;
}) {
  const times = (task.timeHint ?? "")
    .split(/[，,]/)
    .map((time) => time.trim())
    .filter(isAnonymousVisitTime);

  return times.length > 0 ? times : getAnonymousFallbackTaskTimes(task);
}

function getAnonymousFallbackTaskTimes(task: {
  category: Database["public"]["Tables"]["care_tasks"]["Row"]["category"];
  frequency: string | null;
}) {
  const category = task.category ?? "other";
  const count =
    category === "meal" || category === "treat" || category === "medicine"
      ? getAnonymousDailyFrequencyCount(task.frequency)
      : 1;
  const slots: Record<string, string[]> = {
    environment: ["18:30"],
    litter: ["18:30"],
    meal: ["08:30", "18:30", "14:00"],
    medicine: ["08:30", "18:30"],
    observe: ["18:30"],
    other: ["18:30"],
    play: ["18:30"],
    treat: ["18:30", "14:00"],
    water: ["08:30"]
  };

  return (slots[category] ?? slots.other).slice(0, count);
}

function getAnonymousDailyFrequencyCount(frequency: string | null) {
  const match = /^daily(?:_(\d+))?$/.exec(frequency ?? "");

  return Math.max(1, Math.min(4, Number(match?.[1] ?? "1") || 1));
}

function parseAnonymousSubmissionSlotFromKey(
  tokenId: string,
  idempotencyKey: string | null
) {
  const prefix = `anonymous:${tokenId}:`;
  const rest = idempotencyKey?.startsWith(prefix)
    ? idempotencyKey.slice(prefix.length)
    : "";
  const [serviceDate, encodedVisitTime] = rest.split(":");

  if (!isAnonymousCareServiceDate(serviceDate)) {
    return null;
  }

  const visitTime = decodeAnonymousVisitTime(encodedVisitTime);
  const key = visitTime
    ? createAnonymousSubmissionSlotKey(serviceDate, visitTime)
    : null;

  return {
    key,
    serviceDate,
    visitTime
  };
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

async function getAnonymousSubmissionByIdempotencyKey(
  client: AppSupabaseClient,
  ownerId: string,
  planId: string,
  serviceDate: string,
  idempotencyKey: string
): Promise<ServiceResult<AnonymousCareTaskSubmissionView | null>> {
  const result = await client
    .from("care_submissions")
    .select("status, note, abnormal, created_at")
    .eq("owner_id", ownerId)
    .eq("plan_id", planId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  return serviceOk(
    result.data
      ? {
          abnormal: result.data.abnormal,
          note: result.data.note,
          serviceDate,
          status: result.data.status,
          submittedAt: result.data.created_at
        }
      : null
  );
}

async function getOwnerPlanShareContext(planId: string): Promise<
  ServiceResult<{
    client: AppSupabaseClient;
    ownerId: string;
    planStatus: Database["public"]["Tables"]["care_plans"]["Row"]["status"];
  }>
> {
  const normalizedPlanId = planId.trim();

  if (!normalizedPlanId) {
    return serviceError("validation_error", "Choose a care plan to share.");
  }

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
    .select("id, owner_id, status")
    .eq("id", normalizedPlanId)
    .eq("owner_id", ownerResult.data)
    .single();

  if (planResult.error) {
    return mapSupabaseError(planResult.error);
  }

  return serviceOk({
    client: clientResult.data,
    ownerId: ownerResult.data,
    planStatus: planResult.data.status
  });
}

function mapShareTokenState(token: ShareTokenRow | null): CarePlanShareLinkState {
  if (!token) {
    return {
      expiresAt: null,
      generatedAt: null,
      revokedAt: null,
      status: "not_generated"
    };
  }

  if (token.revoked_at) {
    return {
      expiresAt: token.expires_at,
      generatedAt: token.created_at,
      revokedAt: token.revoked_at,
      status: "revoked"
    };
  }

  if (new Date(token.expires_at).getTime() <= Date.now()) {
    return {
      expiresAt: token.expires_at,
      generatedAt: token.created_at,
      revokedAt: null,
      status: "expired"
    };
  }

  return {
    expiresAt: token.expires_at,
    generatedAt: token.created_at,
    revokedAt: null,
    status: "active"
  };
}

function extractPlanCatNames(
  summary: Database["public"]["Tables"]["care_plans"]["Row"]["ai_input_summary"]
) {
  if (
    summary &&
    typeof summary === "object" &&
    !Array.isArray(summary)
  ) {
    const names = summary as { catNames?: unknown; cat_names?: unknown };
    const catNames = names.catNames ?? names.cat_names;

    if (Array.isArray(catNames)) {
      return catNames.filter((name): name is string => typeof name === "string");
    }
  }

  return ["猫咪"];
}

function isLegacyPrepareTask(task: { source: string; title: string }) {
  return task.source === "care_item" || task.title.includes("：准备 ");
}
