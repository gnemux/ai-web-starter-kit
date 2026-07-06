import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { cache } from "react";

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
} from "../../supabase/server";
import { getCurrentUserClaims } from "../../services/auth";
import { getSupabasePublicConfig } from "../../supabase/config";
import type { Database } from "../../supabase/database.types";
import {
  getLifeStageFromBirthDate,
  isCatBreedId,
  isCatIllustrationSrc,
  type CatGender,
  type CatLifeStage
} from "../cat-profile-options";
import {
  getAnalyticsBaseProperties,
  readOptionalPublicEnv
} from "../../analytics/config";

import type {
  CatRow,
  CareRoutineRow,
  CareRoutineItemRow,
  CareItemRow,
  ProductCatalogRow,
  OwnerItemLibraryRow,
  CatItemAssignmentRow,
  CareEventRow,
  CarePlanRow,
  CareTaskRow,
  CareTaskInsert,
  CareSubmissionRow,
  CarePlanStatus,
  CareSubmissionStatus,
  CatCareCat,
  CatCareCatSummary,
  CatCareTask,
  CatCareRoutineItem,
  CatCareRoutine,
  CatCareItem,
  CatCareLibraryItem,
  CatCareItemTag,
  CatCareCatalogProduct,
  CatCareEvent,
  CatCareRoutineWorkspace,
  CatCareItemsWorkspace,
  CatCareEventsWorkspace,
  CatCareSubmission,
  CatCarePlan,
  CatCareWorkspace,
  CatCareWorkspaceStats,
  CatCareCatsWorkspace,
  CatCarePlanListWorkspace,
  CreateCatInput,
  CreatePlanInput,
  CreateCareItemInput
} from "./types";
export type {
  CatRow,
  CareRoutineRow,
  CareRoutineItemRow,
  CareItemRow,
  ProductCatalogRow,
  OwnerItemLibraryRow,
  CatItemAssignmentRow,
  CareEventRow,
  CarePlanRow,
  CareTaskRow,
  CareTaskInsert,
  CareSubmissionRow,
  CarePlanStatus,
  CareSubmissionStatus,
  CatCareCat,
  CatCareCatSummary,
  CatCareTask,
  CatCareRoutineItem,
  CatCareRoutine,
  CatCareItem,
  CatCareLibraryItem,
  CatCareItemTag,
  CatCareCatalogProduct,
  CatCareEvent,
  CatCareRoutineWorkspace,
  CatCareItemsWorkspace,
  CatCareEventsWorkspace,
  CatCareSubmission,
  CatCarePlan,
  CatCareWorkspace,
  CatCareWorkspaceStats,
  CatCareCatsWorkspace,
  CatCarePlanListWorkspace,
  CreateCatInput,
  CreatePlanInput,
  CreateCareItemInput
} from "./types";

import {
  CAT_SELECT,
  CAT_SUMMARY_SELECT,
  ROUTINE_SELECT,
  ROUTINE_ITEM_SELECT,
  CARE_ITEM_SELECT,
  PRODUCT_CATALOG_SELECT,
  OWNER_ITEM_SELECT,
  CAT_ITEM_ASSIGNMENT_SELECT,
  CARE_EVENT_SELECT,
  CATCARE_ANALYTICS_PROVIDER,
  MAX_ROUTINE_FREQUENCY_COUNT,
  catCareOwnerCacheTtlMs,
  catListCacheTtlMs,
  routineItemDefinitions
} from "./constants";
export {
  CAT_SELECT,
  CAT_SUMMARY_SELECT,
  ROUTINE_SELECT,
  ROUTINE_ITEM_SELECT,
  CARE_ITEM_SELECT,
  PRODUCT_CATALOG_SELECT,
  OWNER_ITEM_SELECT,
  CAT_ITEM_ASSIGNMENT_SELECT,
  CARE_EVENT_SELECT,
  CATCARE_ANALYTICS_PROVIDER,
  MAX_ROUTINE_FREQUENCY_COUNT,
  catCareOwnerCacheTtlMs,
  catListCacheTtlMs,
  routineItemDefinitions
} from "./constants";

export const catSummaryCacheTtlMs = catCareOwnerCacheTtlMs;
export const catCareWorkspaceStatsCacheTtlMs = catCareOwnerCacheTtlMs;
export const catCarePlanSummaryCacheTtlMs = catCareOwnerCacheTtlMs;
export const catCarePlanDetailCacheTtlMs = catCareOwnerCacheTtlMs;
export const catCareEventListCacheTtlMs = catCareOwnerCacheTtlMs;
export const ownerLibraryItemCacheTtlMs = catCareOwnerCacheTtlMs;
export const catItemAssignmentCacheTtlMs = catCareOwnerCacheTtlMs;
export const routineSourceCatCacheTtlMs = catCareOwnerCacheTtlMs;
export const routineOwnerItemKeyCacheTtlMs = catCareOwnerCacheTtlMs;
export const defaultRoutineCacheTtlMs = catCareOwnerCacheTtlMs;
export const catSummaryCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareCatSummary[];
  }
>();
export const catListCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareCat[];
  }
>();
export const catCareWorkspaceStatsCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareWorkspaceStats;
  }
>();
export const catCarePlanSummaryCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCarePlan[];
  }
>();
export const catCarePlanDetailCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCarePlan;
  }
>();
export const catCareEventListCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareEvent[];
  }
>();
export const ownerLibraryItemCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareLibraryItem[];
  }
>();
export const catItemAssignmentCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatItemAssignmentRow[];
  }
>();
export const routineSourceCatCache = new Map<
  string,
  {
    expiresAt: number;
    value: string[];
  }
>();
export const routineOwnerItemKeyCache = new Map<
  string,
  {
    expiresAt: number;
    value: Record<string, string[]>;
  }
>();
export const defaultRoutineCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareRoutine | null;
  }
>();

export const listCachedActiveCatalogRows = unstable_cache(
  async function listCachedActiveCatalogRows(): Promise<ProductCatalogRow[]> {
    const config = getSupabasePublicConfig();

    if (!config.ok) {
      throw new Error(config.error.message);
    }

    const client = createSupabaseClient<Database>(
      config.data.url,
      config.data.publishableKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const catalogResult = await client
      .from("catcare_product_catalog")
      .select(PRODUCT_CATALOG_SELECT)
      .eq("is_active", true)
      .order("item_type", { ascending: true })
      .order("display_name", { ascending: true })
      .limit(500);

    if (catalogResult.error) {
      throw new Error(catalogResult.error.message);
    }

    return catalogResult.data ?? [];
  },
  ["catcare-active-product-catalog"],
  { revalidate: 3600 }
);

export async function loadActiveCatalogProducts(): Promise<
  ServiceResult<CatCareCatalogProduct[]>
> {
  try {
    return serviceOk((await listCachedActiveCatalogRows()).map(mapCatalogProduct));
  } catch (error) {
    return serviceError(
      "system_error",
      error instanceof Error
        ? error.message
        : "Product catalog is temporarily unavailable."
    );
  }
}

export async function loadCatSummaries(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<CatCareCatSummary[]>> {
  const cachedCats = readCatSummaryCache(ownerId);

  if (cachedCats) {
    return serviceOk(cachedCats);
  }

  const catsResult = await client
    .from("cats")
    .select(CAT_SUMMARY_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (catsResult.error) {
    return mapSupabaseError(catsResult.error);
  }

  const cats = (catsResult.data ?? []).map(mapCatSummary);
  writeCatSummaryCache(ownerId, cats);

  return serviceOk(cats);
}

export function readCatSummaryCache(ownerId: string) {
  const entry = catSummaryCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catSummaryCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeCatSummaryCache(ownerId: string, value: CatCareCatSummary[]) {
  catSummaryCache.set(ownerId, {
    expiresAt: Date.now() + catSummaryCacheTtlMs,
    value
  });
}

export function clearCatSummaryCache(ownerId: string) {
  catSummaryCache.delete(ownerId);
}

export async function loadCats(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<CatCareCat[]>> {
  const cachedCats = readCatListCache(ownerId);

  if (cachedCats) {
    return serviceOk(cachedCats);
  }

  const catsResult = await client
    .from("cats")
    .select(CAT_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (catsResult.error) {
    return mapSupabaseError(catsResult.error);
  }

  const cats = (catsResult.data ?? []).map(mapCat);
  writeCatListCache(ownerId, cats);

  return serviceOk(cats);
}

export function readCatListCache(ownerId: string) {
  const entry = catListCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catListCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeCatListCache(ownerId: string, value: CatCareCat[]) {
  catListCache.set(ownerId, {
    expiresAt: Date.now() + catListCacheTtlMs,
    value
  });
}

export function clearCatListCache(ownerId: string) {
  catListCache.delete(ownerId);
}

export async function loadCatCareWorkspaceStats(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<CatCareWorkspaceStats>> {
  const cachedStats = readCatCareWorkspaceStatsCache(ownerId);

  if (cachedStats) {
    return serviceOk(cachedStats);
  }

  const [
    plansCountResult,
    publishedPlansResult,
    submissionsResult,
    routinesResult,
    itemsResult,
    eventsResult
  ] = await Promise.all([
    client.from("care_plans").select("id", { count: "exact", head: true }).eq("owner_id", ownerId),
    client
      .from("care_plans")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .eq("status", "published"),
    client.from("care_submissions").select("id", { count: "exact", head: true }).eq("owner_id", ownerId),
    client.from("care_routines").select("id", { count: "exact", head: true }).eq("owner_id", ownerId),
    client.from("cat_item_assignments").select("id", { count: "exact", head: true }).eq("owner_id", ownerId),
    client.from("care_events").select("id", { count: "exact", head: true }).eq("owner_id", ownerId)
  ]);

  if (plansCountResult.error) {
    return mapSupabaseError(plansCountResult.error);
  }

  if (publishedPlansResult.error) {
    return mapSupabaseError(publishedPlansResult.error);
  }

  if (submissionsResult.error) {
    return mapSupabaseError(submissionsResult.error);
  }

  if (routinesResult.error) {
    return mapSupabaseError(routinesResult.error);
  }

  if (itemsResult.error && !isMissingCatCareLibraryTable(itemsResult.error)) {
    return mapSupabaseError(itemsResult.error);
  }

  if (eventsResult.error) {
    return mapSupabaseError(eventsResult.error);
  }

  const itemCountResult = itemsResult.error
    ? await getLegacyCareItemCount(client, ownerId)
    : serviceOk(itemsResult.count ?? 0);

  if (!itemCountResult.ok) {
    return itemCountResult;
  }

  const stats = {
    eventCount: eventsResult.count ?? 0,
    itemCount: itemCountResult.data,
    planCount: plansCountResult.count ?? 0,
    publishedPlanCount: publishedPlansResult.count ?? 0,
    routineCount: routinesResult.count ?? 0,
    submissionCount: submissionsResult.count ?? 0
  };
  writeCatCareWorkspaceStatsCache(ownerId, stats);

  return serviceOk(stats);
}

export function readCatCareWorkspaceStatsCache(ownerId: string) {
  const entry = catCareWorkspaceStatsCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catCareWorkspaceStatsCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeCatCareWorkspaceStatsCache(
  ownerId: string,
  value: CatCareWorkspaceStats
) {
  catCareWorkspaceStatsCache.set(ownerId, {
    expiresAt: Date.now() + catCareWorkspaceStatsCacheTtlMs,
    value
  });
}

export function clearCatCareWorkspaceStatsCache(ownerId: string) {
  catCareWorkspaceStatsCache.delete(ownerId);
}

export async function loadCatCarePlanSummaries(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<CatCarePlan[]>> {
  const cachedPlans = readCatCarePlanSummaryCache(ownerId);

  if (cachedPlans) {
    return serviceOk(cachedPlans);
  }

  const plansResult = await loadCatCarePlans(client, ownerId, {
    includeSubmissionCount: true,
    summaryOnly: true
  });

  if (!plansResult.ok) {
    return plansResult;
  }

  writeCatCarePlanSummaryCache(ownerId, plansResult.data);

  return plansResult;
}

export function readCatCarePlanSummaryCache(ownerId: string) {
  const entry = catCarePlanSummaryCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catCarePlanSummaryCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeCatCarePlanSummaryCache(
  ownerId: string,
  value: CatCarePlan[]
) {
  catCarePlanSummaryCache.set(ownerId, {
    expiresAt: Date.now() + catCarePlanSummaryCacheTtlMs,
    value
  });
}

export function clearCatCarePlanSummaryCache(ownerId: string) {
  catCarePlanSummaryCache.delete(ownerId);
}

export function readCatCarePlanDetailCache(
  ownerId: string,
  planId: string,
  includeSubmissions: boolean
) {
  const key = makeCatCarePlanDetailCacheKey(ownerId, planId, includeSubmissions);
  const entry = catCarePlanDetailCache.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    catCarePlanDetailCache.delete(key);
    return null;
  }

  return entry.value;
}

export function writeCatCarePlanDetailCache(
  ownerId: string,
  planId: string,
  includeSubmissions: boolean,
  value: CatCarePlan
) {
  catCarePlanDetailCache.set(
    makeCatCarePlanDetailCacheKey(ownerId, planId, includeSubmissions),
    {
      expiresAt: Date.now() + catCarePlanDetailCacheTtlMs,
      value
    }
  );
}

export function clearCatCarePlanDetailCache(ownerId: string, planId?: string) {
  if (!planId) {
    for (const key of catCarePlanDetailCache.keys()) {
      if (key.startsWith(`${ownerId}:`)) {
        catCarePlanDetailCache.delete(key);
      }
    }
    return;
  }

  catCarePlanDetailCache.delete(makeCatCarePlanDetailCacheKey(ownerId, planId, true));
  catCarePlanDetailCache.delete(makeCatCarePlanDetailCacheKey(ownerId, planId, false));
}

export function makeCatCarePlanDetailCacheKey(
  ownerId: string,
  planId: string,
  includeSubmissions: boolean
) {
  return `${ownerId}:${planId}:${includeSubmissions ? "with-submissions" : "tasks-only"}`;
}

export async function loadOwnerLibraryItems(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<CatCareLibraryItem[]>> {
  const cachedItems = readOwnerLibraryItemCache(ownerId);

  if (cachedItems) {
    return serviceOk(cachedItems);
  }

  const libraryItemsResult = await client
    .from("owner_item_library")
    .select(OWNER_ITEM_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(80);

  if (libraryItemsResult.error) {
    if (isMissingCatCareLibraryTable(libraryItemsResult.error)) {
      return serviceOk([]);
    }

    return mapSupabaseError(libraryItemsResult.error);
  }

  const libraryItems = (libraryItemsResult.data ?? []).map(mapLibraryItem);
  writeOwnerLibraryItemCache(ownerId, libraryItems);

  return serviceOk(libraryItems);
}

export function readOwnerLibraryItemCache(ownerId: string) {
  const entry = ownerLibraryItemCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    ownerLibraryItemCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeOwnerLibraryItemCache(
  ownerId: string,
  value: CatCareLibraryItem[]
) {
  ownerLibraryItemCache.set(ownerId, {
    expiresAt: Date.now() + ownerLibraryItemCacheTtlMs,
    value
  });
}

export function clearOwnerLibraryItemCache(ownerId: string) {
  ownerLibraryItemCache.delete(ownerId);
}

export async function loadCatItemAssignments(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<CatItemAssignmentRow[] | null>> {
  const cachedAssignments = readCatItemAssignmentCache(ownerId);

  if (cachedAssignments) {
    return serviceOk(cachedAssignments);
  }

  const assignmentsResult = await client
    .from("cat_item_assignments")
    .select(CAT_ITEM_ASSIGNMENT_SELECT)
    .eq("owner_id", ownerId)
    .limit(400);

  if (assignmentsResult.error) {
    if (isMissingCatCareLibraryTable(assignmentsResult.error)) {
      return serviceOk(null);
    }

    return mapSupabaseError(assignmentsResult.error);
  }

  const assignments = (assignmentsResult.data ?? []) as CatItemAssignmentRow[];
  writeCatItemAssignmentCache(ownerId, assignments);

  return serviceOk(assignments);
}

export function readCatItemAssignmentCache(ownerId: string) {
  const entry = catItemAssignmentCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catItemAssignmentCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeCatItemAssignmentCache(
  ownerId: string,
  value: CatItemAssignmentRow[]
) {
  catItemAssignmentCache.set(ownerId, {
    expiresAt: Date.now() + catItemAssignmentCacheTtlMs,
    value
  });
}

export function clearCatItemAssignmentCache(ownerId: string) {
  catItemAssignmentCache.delete(ownerId);
}

export async function loadRoutineSourceCatIds(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<string[]>> {
  const cachedCatIds = readRoutineSourceCatCache(ownerId);

  if (cachedCatIds) {
    return serviceOk(cachedCatIds);
  }

  const routinesResult = await client
    .from("care_routines")
    .select("cat_id")
    .eq("owner_id", ownerId)
    .eq("is_default", true);

  if (routinesResult.error) {
    return mapSupabaseError(routinesResult.error);
  }

  const catIds = (routinesResult.data ?? []).map((routine) => routine.cat_id);
  writeRoutineSourceCatCache(ownerId, catIds);

  return serviceOk(catIds);
}

export function readRoutineSourceCatCache(ownerId: string) {
  const entry = routineSourceCatCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    routineSourceCatCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeRoutineSourceCatCache(ownerId: string, value: string[]) {
  routineSourceCatCache.set(ownerId, {
    expiresAt: Date.now() + routineSourceCatCacheTtlMs,
    value
  });
}

export function clearRoutineSourceCatCache(ownerId: string) {
  routineSourceCatCache.delete(ownerId);
}

export async function loadDefaultRoutine(
  client: AppSupabaseClient,
  ownerId: string,
  catId: string
): Promise<ServiceResult<CatCareRoutine | null>> {
  const cachedRoutine = readDefaultRoutineCache(ownerId, catId);

  if (cachedRoutine !== undefined) {
    return serviceOk(cachedRoutine);
  }

  const routineResult = await client
    .from("care_routines")
    .select(ROUTINE_SELECT)
    .eq("owner_id", ownerId)
    .eq("cat_id", catId)
    .eq("is_default", true)
    .maybeSingle();

  if (routineResult.error) {
    return mapSupabaseError(routineResult.error);
  }

  if (!routineResult.data) {
    writeDefaultRoutineCache(ownerId, catId, null);
    return serviceOk(null);
  }

  const itemsResult = await client
    .from("care_routine_items")
    .select(ROUTINE_ITEM_SELECT)
    .eq("routine_id", routineResult.data.id)
    .order("sort_order", { ascending: true });

  if (itemsResult.error) {
    return mapSupabaseError(itemsResult.error);
  }

  const routine = {
    ...mapRoutine(routineResult.data),
    items: (itemsResult.data ?? []).map(mapRoutineItem)
  };

  writeDefaultRoutineCache(ownerId, catId, routine);

  return serviceOk(routine);
}

export function readDefaultRoutineCache(ownerId: string, catId: string) {
  const key = makeDefaultRoutineCacheKey(ownerId, catId);
  const entry = defaultRoutineCache.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    defaultRoutineCache.delete(key);
    return undefined;
  }

  return entry.value;
}

export function writeDefaultRoutineCache(
  ownerId: string,
  catId: string,
  value: CatCareRoutine | null
) {
  defaultRoutineCache.set(makeDefaultRoutineCacheKey(ownerId, catId), {
    expiresAt: Date.now() + defaultRoutineCacheTtlMs,
    value
  });
}

export function clearDefaultRoutineCache(ownerId: string) {
  for (const key of defaultRoutineCache.keys()) {
    if (key.startsWith(`${ownerId}:`)) {
      defaultRoutineCache.delete(key);
    }
  }
}

export function makeDefaultRoutineCacheKey(ownerId: string, catId: string) {
  return `${ownerId}:${catId}`;
}

export async function loadCareEvents(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<CatCareEvent[]>> {
  const cachedEvents = readCatCareEventListCache(ownerId);

  if (cachedEvents) {
    return serviceOk(cachedEvents);
  }

  const eventsResult = await client
    .from("care_events")
    .select(CARE_EVENT_SELECT)
    .eq("owner_id", ownerId)
    .order("occurred_on", { ascending: false })
    .limit(200);

  if (eventsResult.error) {
    return mapSupabaseError(eventsResult.error);
  }

  const events = (eventsResult.data ?? []).map(mapCareEvent);
  writeCatCareEventListCache(ownerId, events);

  return serviceOk(events);
}

export function readCatCareEventListCache(ownerId: string) {
  const entry = catCareEventListCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catCareEventListCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

export function writeCatCareEventListCache(ownerId: string, value: CatCareEvent[]) {
  catCareEventListCache.set(ownerId, {
    expiresAt: Date.now() + catCareEventListCacheTtlMs,
    value
  });
}

export function clearCatCareEventListCache(ownerId: string) {
  catCareEventListCache.delete(ownerId);
}

export async function loadCatCarePlans(
  client: AppSupabaseClient,
  ownerId: string,
  options: {
    includeSubmissionCount?: boolean;
    includeTaskCount?: boolean;
    summaryOnly?: boolean;
  } = {}
): Promise<ServiceResult<CatCarePlan[]>> {
  const plansResult = await client
    .from("care_plans")
    .select(
      "id, owner_id, cat_id, routine_id, title, status, scenario, generation_source, ai_input_summary, start_on, end_on, handoff_notes, generated_at, published_at, reviewed_at, closed_at, created_at, updated_at"
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (plansResult.error) {
    return mapSupabaseError(plansResult.error);
  }

  const plans = plansResult.data ?? [];
  const planIds = plans.map((plan) => plan.id);

  if (planIds.length === 0) {
    return serviceOk([]);
  }

  const includeTaskCount = options.includeTaskCount ?? true;
  const includeSubmissionCount = options.includeSubmissionCount ?? true;
  const tasksQuery = options.summaryOnly && !includeTaskCount
    ? null
    : options.summaryOnly
      ? client.from("care_tasks").select("plan_id").in("plan_id", planIds)
      : client
          .from("care_tasks")
          .select(
            "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
          )
          .in("plan_id", planIds)
          .order("sort_order", { ascending: true });
  const submissionsQuery = options.summaryOnly && !includeSubmissionCount
    ? null
    : options.summaryOnly
    ? client.from("care_submissions").select("plan_id").in("plan_id", planIds)
    : client
        .from("care_submissions")
        .select(
          "id, owner_id, plan_id, task_id, submitted_by_label, status, note, abnormal, idempotency_key, created_at"
        )
        .in("plan_id", planIds)
        .order("created_at", { ascending: false });
  const [tasksResult, submissionsResult] = await Promise.all([
    tasksQuery,
    submissionsQuery
  ]);

  if (tasksResult?.error) {
    return mapSupabaseError(tasksResult.error);
  }

  if (submissionsResult?.error) {
    return mapSupabaseError(submissionsResult.error);
  }

  // ponytail: list/workspace pages only need counts; plan detail uses the full loader.
  const taskCounts = options.summaryOnly && tasksResult
    ? countByPlan(tasksResult.data ?? [])
    : new Map<string, number>();
  const submissionCounts = options.summaryOnly && submissionsResult
    ? countByPlan(submissionsResult.data ?? [])
    : new Map<string, number>();
  const tasksByPlan = options.summaryOnly
    ? new Map<string, CatCareTask[]>()
    : groupByPlan(((tasksResult?.data ?? []) as CareTaskRow[]).map(mapTask));
  const submissionsByPlan = options.summaryOnly
    ? new Map<string, CatCareSubmission[]>()
    : groupByPlan(
        ((submissionsResult?.data ?? []) as CareSubmissionRow[]).map(
          mapSubmission
        )
      );

  return serviceOk(
    plans.map((plan) => ({
      ...mapPlan(plan),
      taskCount: options.summaryOnly && tasksResult
        ? (taskCounts.get(plan.id) ?? 0)
        : undefined,
      submissionCount: options.summaryOnly && submissionsResult
        ? (submissionCounts.get(plan.id) ?? 0)
        : undefined,
      tasks: tasksByPlan.get(plan.id) ?? [],
      submissions: submissionsByPlan.get(plan.id) ?? []
    }))
  );
}

export async function getAuthenticatedOwnerId(
  _supabase: AppSupabaseClient
): Promise<ServiceResult<string>> {
  return getCachedAuthenticatedOwnerId();
}

export const getCachedAuthenticatedOwnerId = cache(async function getCachedAuthenticatedOwnerId(
): Promise<ServiceResult<string>> {
  const claimsResult = await getCurrentUserClaims();

  if (!claimsResult.ok) {
    return claimsResult;
  }

  const scopeResult = createOwnerScope(claimsResult.data.id, claimsResult.data.id);

  if (!scopeResult.ok) {
    return mapDbBoundaryError(scopeResult);
  }

  return serviceOk(claimsResult.data.id);
});

export function normalizeCatInput(input: {
  birthDate: FormDataEntryValue | null;
  breed: FormDataEntryValue | null;
  gender: FormDataEntryValue | null;
  name: FormDataEntryValue | null;
  photoUrl: FormDataEntryValue | null;
  weightKg: FormDataEntryValue | null;
  safetyNotes: FormDataEntryValue | null;
  notes: FormDataEntryValue | null;
}): ServiceResult<CreateCatInput> {
  const birthDate = normalizeDate(input.birthDate);
  const breed = normalizeOptionalText(input.breed) ?? "unknown";
  const genderText = String(input.gender ?? "unknown").trim();
  const gender: CatGender =
    genderText === "male" || genderText === "female" ? genderText : "unknown";
  const lifeStage = getLifeStageFromBirthDate(birthDate);
  const name = String(input.name ?? "").trim();
  const photoUrl = normalizeOptionalText(input.photoUrl);
  const weightKg = normalizeWeight(input.weightKg);
  const safetyNotes = normalizeOptionalText(input.safetyNotes);
  const notes = normalizeOptionalText(input.notes);
  const fields: Record<string, string> = {};

  if (name.length < 1 || name.length > 80) {
    fields.name = "invalid";
  }

  if (!isCatBreedId(breed)) {
    fields.breed = "invalid";
  }

  if (gender === "unknown") {
    fields.gender = "invalid";
  }

  if (!birthDate) {
    fields.birthDate = "required";
  }

  if (birthDate && birthDate > new Date().toISOString().slice(0, 10)) {
    fields.birthDate = "invalid";
  }

  if (input.weightKg && weightKg === null) {
    fields.weightKg = "invalid";
  }

  if (photoUrl && !isAllowedCatPhotoUrl(photoUrl)) {
    fields.photoUrl = "invalid";
  }

  if (safetyNotes && safetyNotes.length > 2000) {
    fields.safetyNotes = "invalid";
  }

  if (notes && notes.length > 2000) {
    fields.notes = "invalid";
  }

  if (Object.keys(fields).length > 0) {
    return serviceError("validation_error", "Check the cat profile fields.", fields);
  }

  return serviceOk({
    birthDate,
    breed,
    gender,
    lifeStage,
    name,
    notes,
    photoUrl,
    safetyNotes,
    weightKg
  });
}

export function isAllowedCatPhotoUrl(value: string) {
  return (
    isCatIllustrationSrc(value) ||
    value.includes("/storage/v1/object/public/cat-photos/")
  );
}

export async function uploadCatPhotoIfPresent(
  supabase: AppSupabaseClient,
  ownerId: string,
  file: FormDataEntryValue | null
): Promise<ServiceResult<string | null>> {
  if (!(file instanceof File) || file.size === 0) {
    return serviceOk(null);
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return serviceError("validation_error", "Upload a JPG, PNG, or WebP photo.", {
      photo: "invalid"
    });
  }

  if (file.size > 5 * 1024 * 1024) {
    return serviceError("validation_error", "Upload a photo smaller than 5 MB.", {
      photo: "too_large"
    });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("cat-photos")
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    return serviceError("system_error", "Cat photo upload failed.");
  }

  const { data } = supabase.storage.from("cat-photos").getPublicUrl(path);
  return serviceOk(data.publicUrl);
}

export function normalizePlanInput(input: {
  catIds: FormDataEntryValue[];
  scenario: FormDataEntryValue | null;
  visitCount: FormDataEntryValue | null;
  title: FormDataEntryValue | null;
  startOn: FormDataEntryValue | null;
  endOn: FormDataEntryValue | null;
  handoffNotes: FormDataEntryValue | null;
  taskTitle: FormDataEntryValue | null;
  taskInstructions: FormDataEntryValue | null;
}): ServiceResult<CreatePlanInput> {
  const catIds = Array.from(
    new Set(input.catIds.map((value) => String(value).trim()).filter(Boolean))
  );
  const catId = catIds[0] ?? "";
  const scenario = normalizePlanScenario(input.scenario);
  const visitCount = normalizePlanVisitCount(input.visitCount);
  const startOn = normalizeDate(input.startOn);
  const endOn = normalizeDate(input.endOn);
  const title =
    normalizeOptionalText(input.title) ??
    getDefaultPlanTitle(scenario, startOn, endOn);
  const handoffNotes = normalizeOptionalText(input.handoffNotes);
  const taskTitle = String(input.taskTitle ?? "").trim();
  const taskInstructions = normalizeOptionalText(input.taskInstructions);
  const fields: Record<string, string> = {};

  if (catIds.length === 0) {
    fields.catIds = "required";
  }

  if (title.length < 1 || title.length > 120) {
    fields.title = "invalid";
  }

  if (!startOn) {
    fields.startOn = "required";
  }

  if (startOn && endOn && endOn < startOn) {
    fields.endOn = "invalid";
  }

  if (handoffNotes && handoffNotes.length > 2000) {
    fields.handoffNotes = "invalid";
  }

  if (taskTitle && taskTitle.length > 120) {
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
    catIds,
    scenario,
    title,
    visitCount,
    startOn,
    endOn,
    handoffNotes,
    tasks: [
      ...(taskTitle
        ? [
            {
              category: "other" as const,
              enabled: true,
              frequency: null,
              instructions: taskInstructions,
              required: true,
              sortOrder: 0,
              source: "owner" as const,
              sourceRef: null,
              timeHint: null,
              title: taskTitle
            }
          ]
        : [])
    ]
  });
}

export function normalizePlanScenario(
  value: FormDataEntryValue | null
): CarePlanRow["scenario"] {
  const text = String(value ?? "").trim();

  return text === "business_trip" ||
    text === "weekend_away" ||
    text === "friend_visit" ||
    text === "other"
    ? text
    : "weekend_away";
}

export function normalizePlanVisitCount(value: FormDataEntryValue | null) {
  const count = Number(String(value ?? "2").trim());

  return count === 1 || count === 3 ? count : 2;
}

export function withRelatedItemInstruction(
  instructions: string | null,
  relatedItem: string | null
) {
  if (!relatedItem) {
    return instructions;
  }

  const line = `关联用品：${relatedItem}`;

  return instructions ? `${line}\n${instructions}` : line;
}

export function withTaskScopeTitle(title: string, scope: string | null) {
  if (!scope || title.includes("：") || title.includes(":")) {
    return title;
  }

  return `${scope}：${title}`;
}

export function withPlanVisitCount(
  summary: CatCarePlan["aiInputSummary"],
  visitCount: number
) {
  return summary && typeof summary === "object" && !Array.isArray(summary)
    ? { ...summary, visit_count: visitCount }
    : { visit_count: visitCount };
}

export function getDefaultPlanTitle(
  scenario: CarePlanRow["scenario"],
  startOn: string | null,
  endOn: string | null
) {
  const label = {
    business_trip: "出差照护计划",
    friend_visit: "朋友上门照护计划",
    other: "临时照护计划",
    weekend_away: "周末出门照护计划"
  }[scenario];
  const range = startOn ? ` ${startOn}${endOn ? ` 至 ${endOn}` : ""}` : "";

  return `${label}${range}`;
}

export function normalizeOptionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export function normalizeTaskTimeHint(formData: FormData, name: string) {
  const seen = new Set<string>();
  const times = formData
    .getAll(name)
    .map((value) => String(value).trim())
    .filter((time) => {
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time) || seen.has(time)) {
        return false;
      }

      seen.add(time);
      return true;
    });

  return times.length > 0 ? times.join(",") : null;
}

export function normalizeCareTaskCategory(
  value: FormDataEntryValue | null
): CareTaskRow["category"] {
  const text = String(value ?? "").trim();

  return text === "medicine" || text === "observe" || text === "other"
    ? text
    : "medicine";
}

export function normalizeDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

export function normalizeWeight(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const weight = Number(text);
  return Number.isFinite(weight) && weight > 0 && weight <= 30
    ? Math.round(weight * 10) / 10
    : null;
}

export function normalizeRoutineInstructions(
  brandValue: FormDataEntryValue | null,
  instructionsValue: FormDataEntryValue | null
) {
  const brand = normalizeOptionalText(brandValue);
  const instructions = normalizeOptionalText(instructionsValue);

  if (brand && instructions) {
    return `${brand} · ${instructions}`;
  }

  return brand ?? instructions;
}

export function normalizeRoutineFrequency(
  value: FormDataEntryValue | null,
  fallback: string
) {
  const text = String(value ?? "").trim();

  if (isValidRoutineFrequency(text)) {
    return text;
  }

  return text === "weekly" ? "weekly_1" : fallback;
}

export function isValidRoutineFrequency(value: string) {
  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value);

  if (!match) {
    return false;
  }

  const count = Number(match[2] ?? "1");
  return (
    Number.isInteger(count) &&
    count > 0 &&
    count <= MAX_ROUTINE_FREQUENCY_COUNT
  );
}

export function normalizeRoutineTimes(
  values: FormDataEntryValue[],
  fallback: string
) {
  const times = values
    .flatMap((value) => String(value ?? "").split(/[,\n，、;/]+/))
    .map((value) => value.trim())
    .filter((value) => /^\d{2}:\d{2}$/.test(value));

  if (values.some((value) => String(value) === "__no_fixed_time")) {
    return "";
  }

  return times.length > 0 ? times.join(",") : fallback;
}

export function normalizeRoutineCustomCategory(
  value: FormDataEntryValue | null
): CareRoutineItemRow["category"] {
  const text = String(value ?? "").trim();

  return text === "meal" ||
    text === "treat" ||
    text === "medicine"
    ? text
    : text === "supplement"
      ? "medicine"
      : "treat";
}

export function normalizeCareItemInput(
  formData: FormData
): ServiceResult<CreateCareItemInput> {
  const currentCatId =
    String(formData.get("currentCatId") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const itemType = normalizeCareItemType(formData.get("itemType"));
  const instructions = normalizeOptionalText(formData.get("instructions"));
  const fields: Record<string, string> = {};

  if (name.length < 1 || name.length > 120) {
    fields.name = "invalid";
  }

  if (instructions && instructions.length > 2000) {
    fields.instructions = "invalid";
  }

  if (Object.keys(fields).length > 0) {
    return serviceError("validation_error", "Check the care item fields.", fields);
  }

  return serviceOk({
    currentCatId,
    instructions,
    itemType,
    name,
    visibleToSitter: formData.get("visibleToSitter") === "on"
  });
}

export function normalizeCareItemType(
  value: FormDataEntryValue | null
): OwnerItemLibraryRow["item_type"] {
  const text = String(value ?? "").trim();

  return text === "dry_food" ||
    text === "wet_food" ||
    text === "treat" ||
    text === "medicine" ||
    text === "supplement" ||
    text === "litter" ||
    text === "supply" ||
    text === "other"
    ? text
    : "supply";
}

export async function loadCatCareAssignedItems(
  client: AppSupabaseClient,
  ownerId: string,
  catId: string,
  options: { limit?: number; visibleOnly?: boolean } = {}
): Promise<ServiceResult<CatCareItem[]>> {
  if (!options.visibleOnly) {
    const [assignmentsResult, libraryItemsResult] = await Promise.all([
      loadCatItemAssignments(client, ownerId),
      loadOwnerLibraryItems(client, ownerId)
    ]);

    if (!assignmentsResult.ok) {
      return assignmentsResult;
    }

    if (!libraryItemsResult.ok) {
      return libraryItemsResult;
    }

    if (assignmentsResult.data) {
      const libraryById = new Map(
        libraryItemsResult.data.map((item) => [item.id, item])
      );
      const assignments = assignmentsResult.data
        .filter((assignment) => assignment.cat_id === catId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, options.limit);

      return serviceOk(
        assignments
          .map((assignment) => {
            const libraryItem = libraryById.get(assignment.owner_item_id);
            return libraryItem
              ? mapCatItemAssignment(assignment, libraryItem)
              : null;
          })
          .filter((item): item is CatCareItem => Boolean(item))
      );
    }
  }

  let query = client
    .from("cat_item_assignments")
    .select(CAT_ITEM_ASSIGNMENT_SELECT)
    .eq("owner_id", ownerId)
    .eq("cat_id", catId)
    .order("created_at", { ascending: false });

  if (options.visibleOnly) {
    query = query.eq("visible_to_sitter", true);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const assignmentsResult = await query;

  if (assignmentsResult.error) {
    if (isMissingCatCareLibraryTable(assignmentsResult.error)) {
      return loadLegacyCareItems(client, ownerId, catId, options);
    }

    return mapSupabaseError(assignmentsResult.error);
  }

  const assignments = assignmentsResult.data ?? [];
  const ownerItemIds = Array.from(
    new Set(assignments.map((item) => item.owner_item_id))
  );

  if (ownerItemIds.length === 0) {
    return serviceOk([]);
  }

  const libraryResult = await client
    .from("owner_item_library")
    .select(OWNER_ITEM_SELECT)
    .eq("owner_id", ownerId)
    .in("id", ownerItemIds);

  if (libraryResult.error) {
    if (isMissingCatCareLibraryTable(libraryResult.error)) {
      return loadLegacyCareItems(client, ownerId, catId, options);
    }

    return mapSupabaseError(libraryResult.error);
  }

  const libraryById = new Map(
    (libraryResult.data ?? []).map((item) => [item.id, mapLibraryItem(item)])
  );

  return serviceOk(
    assignments
      .map((assignment) => {
        const libraryItem = libraryById.get(assignment.owner_item_id);
        return libraryItem ? mapCatItemAssignment(assignment, libraryItem) : null;
      })
      .filter((item): item is CatCareItem => Boolean(item))
  );
}

export async function loadLegacyCareItems(
  client: AppSupabaseClient,
  ownerId: string,
  catId: string,
  options: { limit?: number; visibleOnly?: boolean } = {}
): Promise<ServiceResult<CatCareItem[]>> {
  let query = client
    .from("care_items")
    .select(CARE_ITEM_SELECT)
    .eq("owner_id", ownerId)
    .eq("cat_id", catId)
    .order("created_at", { ascending: false });

  if (options.visibleOnly) {
    query = query.eq("visible_to_sitter", true);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const result = await query;

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  return serviceOk((result.data ?? []).map(mapCareItem));
}

export async function getLegacyCareItemCount(
  client: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<number>> {
  const result = await client
    .from("care_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  return serviceOk(result.count ?? 0);
}

export async function findOrCreateOwnerItem(
  client: AppSupabaseClient,
  ownerId: string,
  input: CreateCareItemInput
): Promise<ServiceResult<CatCareLibraryItem>> {
  const catalogResult = await client
    .from("catcare_product_catalog")
    .select(PRODUCT_CATALOG_SELECT)
    .eq("item_type", input.itemType)
    .eq("display_name", input.name)
    .maybeSingle();

  if (catalogResult.error) {
    if (isMissingCatCareLibraryTable(catalogResult.error)) {
      return mapSupabaseError(catalogResult.error);
    }

    return mapSupabaseError(catalogResult.error);
  }

  const existingResult = await client
    .from("owner_item_library")
    .select(OWNER_ITEM_SELECT)
    .eq("owner_id", ownerId)
    .eq("item_type", input.itemType)
    .ilike("display_name", input.name)
    .limit(1)
    .maybeSingle();

  if (existingResult.error) {
    if (isMissingCatCareLibraryTable(existingResult.error)) {
      return mapSupabaseError(existingResult.error);
    }

    return mapSupabaseError(existingResult.error);
  }

  if (existingResult.data) {
    if (!input.instructions || existingResult.data.notes) {
      return serviceOk(mapLibraryItem(existingResult.data));
    }

    const updateResult = await client
      .from("owner_item_library")
      .update({ notes: input.instructions })
      .eq("id", existingResult.data.id)
      .select(OWNER_ITEM_SELECT)
      .single();

    if (updateResult.error) {
      return mapSupabaseError(updateResult.error);
    }

    return serviceOk(mapLibraryItem(updateResult.data));
  }

  const insertResult = await client
    .from("owner_item_library")
    .insert({
      brand: catalogResult.data?.brand ?? null,
      catalog_product_id: catalogResult.data?.id ?? null,
      display_name: input.name,
      item_type: input.itemType,
      notes: input.instructions,
      owner_id: ownerId
    })
    .select(OWNER_ITEM_SELECT)
    .single();

  if (insertResult.error) {
    if (isMissingCatCareLibraryTable(insertResult.error)) {
      return mapSupabaseError(insertResult.error);
    }

    return mapSupabaseError(insertResult.error);
  }

  return serviceOk(mapLibraryItem(insertResult.data));
}

export async function syncRoutineProductsToOwnerItems(
  client: AppSupabaseClient,
  ownerId: string,
  catId: string,
  items: Array<{
    category: CareRoutineItemRow["category"];
    enabled: boolean;
    frequency: string;
    instructions: string | null;
    title: string;
  }>
): Promise<ServiceResult<null>> {
  const currentRoutineKeys = new Set<string>();
  const productsByKey = new Map<
    string,
    {
      amount: string | null;
      frequency: string;
      itemType: OwnerItemLibraryRow["item_type"];
      name: string;
    }
  >();

  for (const item of items) {
    const product = getRoutineOwnerItemInput(item);

    if (!product) {
      continue;
    }

    const key = makeOwnerItemKey(product.itemType, product.name);
    currentRoutineKeys.add(key);
    productsByKey.set(key, {
      amount: product.amount,
      frequency: item.frequency,
      itemType: product.itemType,
      name: product.name
    });
  }

  const products = Array.from(productsByKey.values());

  if (products.length > 0) {
    const [libraryItemsResult, catalogProductsResult] = await Promise.all([
      loadOwnerLibraryItems(client, ownerId),
      loadActiveCatalogProducts()
    ]);

    if (!libraryItemsResult.ok) {
      if (libraryItemsResult.error.code === "system_error") {
        return serviceOk(null);
      }

      return libraryItemsResult;
    }

    if (!catalogProductsResult.ok) {
      return catalogProductsResult;
    }

    const libraryByKey = new Map(
      libraryItemsResult.data.map((item) => [makeOwnerItemKey(item.itemType, item.name), item])
    );
    const catalogByKey = new Map(
      catalogProductsResult.data.map((item) => [
        makeOwnerItemKey(item.itemType, item.displayName),
        item
      ])
    );
    const assignments = [];

    for (const product of products) {
      const key = makeOwnerItemKey(product.itemType, product.name);
      let libraryItem = libraryByKey.get(key);

      if (!libraryItem) {
        const catalogProduct = catalogByKey.get(key);
        const insertResult = await client
          .from("owner_item_library")
          .insert({
            brand: catalogProduct?.brand ?? null,
            catalog_product_id: catalogProduct?.id ?? null,
            display_name: product.name,
            item_type: product.itemType,
            notes: null,
            owner_id: ownerId
          })
          .select(OWNER_ITEM_SELECT)
          .single();

        if (insertResult.error) {
          if (isMissingCatCareLibraryTable(insertResult.error)) {
            return serviceOk(null);
          }

          return mapSupabaseError(insertResult.error);
        }

        libraryItem = mapLibraryItem(insertResult.data);
        libraryByKey.set(key, libraryItem);
      }

      assignments.push({
        cat_id: catId,
        default_amount: product.amount,
        default_frequency: product.frequency,
        owner_id: ownerId,
        owner_item_id: libraryItem.id,
        visible_to_sitter: true
      });
    }

    const assignmentResult = await client
      .from("cat_item_assignments")
      .upsert(assignments, { onConflict: "cat_id,owner_item_id" });

    if (assignmentResult.error) {
      if (isMissingCatCareLibraryTable(assignmentResult.error)) {
        return serviceOk(null);
      }

      return mapSupabaseError(assignmentResult.error);
    }
  }

  const cleanupResult = await removeStaleRoutineAssignments(
    client,
    ownerId,
    catId,
    currentRoutineKeys
  );

  if (!cleanupResult.ok) {
    return cleanupResult;
  }

  return serviceOk(null);
}

export async function removeStaleRoutineAssignments(
  client: AppSupabaseClient,
  ownerId: string,
  catId: string,
  currentRoutineKeys: Set<string>
): Promise<ServiceResult<null>> {
  const assignmentsResult = await client
    .from("cat_item_assignments")
    .select(CAT_ITEM_ASSIGNMENT_SELECT)
    .eq("owner_id", ownerId)
    .eq("cat_id", catId)
    .limit(400);

  if (assignmentsResult.error) {
    if (isMissingCatCareLibraryTable(assignmentsResult.error)) {
      return serviceOk(null);
    }

    return mapSupabaseError(assignmentsResult.error);
  }

  const ownerItemIds = Array.from(
    new Set((assignmentsResult.data ?? []).map((item) => item.owner_item_id))
  );

  if (ownerItemIds.length === 0) {
    return serviceOk(null);
  }

  const libraryResult = await client
    .from("owner_item_library")
    .select(OWNER_ITEM_SELECT)
    .eq("owner_id", ownerId)
    .in("id", ownerItemIds);

  if (libraryResult.error) {
    if (isMissingCatCareLibraryTable(libraryResult.error)) {
      return serviceOk(null);
    }

    return mapSupabaseError(libraryResult.error);
  }

  const libraryById = new Map(
    (libraryResult.data ?? []).map((item) => [item.id, item])
  );
  const staleAssignmentIds = (assignmentsResult.data ?? [])
    .filter((assignment) => {
      const item = libraryById.get(assignment.owner_item_id);

      if (!item || !isRoutineManagedOwnerItemType(item.item_type)) {
        return false;
      }

      return !currentRoutineKeys.has(
        makeOwnerItemKey(item.item_type, item.display_name)
      );
    })
    .map((assignment) => assignment.id);

  if (staleAssignmentIds.length === 0) {
    return serviceOk(null);
  }

  const deleteResult = await client
    .from("cat_item_assignments")
    .delete()
    .eq("owner_id", ownerId)
    .eq("cat_id", catId)
    .in("id", staleAssignmentIds);

  if (deleteResult.error) {
    return mapSupabaseError(deleteResult.error);
  }

  return serviceOk(null);
}

export async function loadRoutineOwnerItemKeys(
  client: AppSupabaseClient,
  ownerId: string,
  catId: string
): Promise<ServiceResult<Set<string>>> {
  const cachedKeys = readRoutineOwnerItemKeyCache(ownerId, [catId]);

  if (cachedKeys) {
    return serviceOk(new Set(cachedKeys[catId] ?? []));
  }

  const routineResult = await client
    .from("care_routines")
    .select(ROUTINE_SELECT)
    .eq("owner_id", ownerId)
    .eq("cat_id", catId)
    .eq("is_default", true)
    .maybeSingle();

  if (routineResult.error) {
    return mapSupabaseError(routineResult.error);
  }

  if (!routineResult.data) {
    writeRoutineOwnerItemKeyCache(ownerId, [catId], { [catId]: [] });
    return serviceOk(new Set());
  }

  const routineItemsResult = await client
    .from("care_routine_items")
    .select(ROUTINE_ITEM_SELECT)
    .eq("routine_id", routineResult.data.id)
    .eq("enabled", true);

  if (routineItemsResult.error) {
    return mapSupabaseError(routineItemsResult.error);
  }

  const keys = (routineItemsResult.data ?? [])
    .map(getRoutineOwnerItemReference)
    .filter((item): item is RoutineOwnerItemReference => Boolean(item))
    .map((item) => makeOwnerItemKey(item.itemType, item.name));

  writeRoutineOwnerItemKeyCache(ownerId, [catId], { [catId]: keys });

  return serviceOk(new Set(keys));
}

export function readRoutineOwnerItemKeyCache(ownerId: string, catIds: string[]) {
  const key = makeRoutineOwnerItemKeyCacheKey(ownerId, catIds);
  const entry = routineOwnerItemKeyCache.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    routineOwnerItemKeyCache.delete(key);
    return null;
  }

  return entry.value;
}

export function writeRoutineOwnerItemKeyCache(
  ownerId: string,
  catIds: string[],
  value: Record<string, string[]>
) {
  routineOwnerItemKeyCache.set(makeRoutineOwnerItemKeyCacheKey(ownerId, catIds), {
    expiresAt: Date.now() + routineOwnerItemKeyCacheTtlMs,
    value
  });
}

export function clearRoutineOwnerItemKeyCache(ownerId: string) {
  for (const key of routineOwnerItemKeyCache.keys()) {
    if (key.startsWith(`${ownerId}:`)) {
      routineOwnerItemKeyCache.delete(key);
    }
  }
}

export function makeRoutineOwnerItemKeyCacheKey(ownerId: string, catIds: string[]) {
  return `${ownerId}:${[...catIds].sort().join(",")}`;
}

export async function loadRoutineOwnerItemKeysByCatId(
  client: AppSupabaseClient,
  ownerId: string,
  catIds: string[]
): Promise<ServiceResult<Record<string, string[]>>> {
  const cachedKeys = readRoutineOwnerItemKeyCache(ownerId, catIds);

  if (cachedKeys) {
    return serviceOk(
      Object.fromEntries(catIds.map((catId) => [catId, cachedKeys[catId] ?? []]))
    );
  }

  const keysByCatId = Object.fromEntries(
    catIds.map((catId) => [catId, new Set<string>()])
  ) as Record<string, Set<string>>;

  if (catIds.length === 0) {
    return serviceOk({});
  }

  const routinesResult = await client
    .from("care_routines")
    .select(ROUTINE_SELECT)
    .eq("owner_id", ownerId)
    .eq("is_default", true)
    .in("cat_id", catIds);

  if (routinesResult.error) {
    return mapSupabaseError(routinesResult.error);
  }

  const routineById = new Map(
    (routinesResult.data ?? []).map((routine) => [routine.id, routine.cat_id])
  );
  const routineIds = Array.from(routineById.keys());

  if (routineIds.length === 0) {
    const emptyKeys = Object.fromEntries(catIds.map((catId) => [catId, []]));
    writeRoutineOwnerItemKeyCache(ownerId, catIds, emptyKeys);

    return serviceOk(emptyKeys);
  }

  const routineItemsResult = await client
    .from("care_routine_items")
    .select(ROUTINE_ITEM_SELECT)
    .in("routine_id", routineIds)
    .eq("enabled", true);

  if (routineItemsResult.error) {
    return mapSupabaseError(routineItemsResult.error);
  }

  for (const item of routineItemsResult.data ?? []) {
    const catId = routineById.get(item.routine_id);
    const ownerItem = getRoutineOwnerItemReference(item);

    if (!catId || !ownerItem) {
      continue;
    }

    keysByCatId[catId]?.add(makeOwnerItemKey(ownerItem.itemType, ownerItem.name));
  }

  const keys = Object.fromEntries(
    catIds.map((catId) => [catId, Array.from(keysByCatId[catId] ?? [])])
  );

  writeRoutineOwnerItemKeyCache(ownerId, catIds, keys);

  return serviceOk(keys);
}

export type RoutineOwnerItemReference = {
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
};

export function getRoutineOwnerItemReference(item: {
  category: CareRoutineItemRow["category"];
  enabled: boolean;
  instructions: string | null;
  title: string;
}): RoutineOwnerItemReference | null {
  const input = getRoutineOwnerItemInput({
    category: item.category,
    enabled: item.enabled,
    frequency: "",
    instructions: item.instructions,
    title: item.title
  });

  return input ? { itemType: input.itemType, name: input.name } : null;
}

export function getRoutineOwnerItemInput(item: {
  category: CareRoutineItemRow["category"];
  enabled: boolean;
  frequency: string;
  instructions: string | null;
  title: string;
}): (RoutineOwnerItemReference & { amount: string | null }) | null {
  const itemTypesByTitle: Record<string, OwnerItemLibraryRow["item_type"]> = {
    主粮: "dry_food",
    罐头: "wet_food",
    零食: "treat"
  };
  const fixedItemType = itemTypesByTitle[item.title];
  const itemType = fixedItemType ?? getCustomRoutineOwnerItemType(item);
  const product = fixedItemType
    ? parseRoutineProductInstructions(item.instructions)
    : {
        amount: item.instructions?.trim() || null,
        name: item.title.trim()
      };

  if (!item.enabled || !itemType || !product.name) {
    return null;
  }

  return {
    amount: product.amount,
    itemType,
    name: product.name
  };
}

export function makeOwnerItemKey(
  itemType: OwnerItemLibraryRow["item_type"],
  name: string
) {
  return `${itemType}:${name.trim().toLowerCase()}`;
}

export function isRoutineManagedOwnerItemType(itemType: OwnerItemLibraryRow["item_type"]) {
  return (
    itemType === "dry_food" ||
    itemType === "wet_food" ||
    itemType === "treat" ||
    itemType === "supplement"
  );
}

export function getCustomRoutineOwnerItemType(item: {
  category: CareRoutineItemRow["category"];
  title: string;
}): OwnerItemLibraryRow["item_type"] | null {
  if (item.category === "treat") {
    return "treat";
  }

  if (item.category === "medicine") {
    return "supplement";
  }

  if (item.category !== "meal") {
    return null;
  }

  return /罐|湿粮|餐盒|主食罐/.test(item.title) ? "wet_food" : "dry_food";
}

export function parseRoutineProductInstructions(value: string | null) {
  const text = value ?? "";
  const separator = " · ";
  const separatorIndex = text.indexOf(separator);

  if (separatorIndex < 0) {
    return { amount: text || null, name: "" };
  }

  return {
    amount: text.slice(separatorIndex + separator.length).trim() || null,
    name: text.slice(0, separatorIndex).trim()
  };
}

export async function createLegacyCatCareItem(
  client: AppSupabaseClient,
  ownerId: string,
  input: CreateCareItemInput & { catId: string }
): Promise<ServiceResult<CatCareItem>> {
  const result = await client
    .from("care_items")
    .insert({
      cat_id: input.catId,
      default_amount: input.defaultAmount,
      default_frequency: input.defaultFrequency,
      instructions: input.instructions,
      item_type: input.itemType,
      name: input.name,
      owner_id: ownerId,
      visible_to_sitter: input.visibleToSitter
    })
    .select(CARE_ITEM_SELECT)
    .single();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  return serviceOk(mapCareItem(result.data));
}

export function mapCareItemTypeToTaskCategory(
  itemType: OwnerItemLibraryRow["item_type"]
): CareTaskRow["category"] {
  if (itemType === "dry_food" || itemType === "wet_food") {
    return "meal";
  }

  if (itemType === "litter") {
    return "litter";
  }

  return itemType === "treat" || itemType === "medicine" || itemType === "supplement"
    ? "medicine"
    : "other";
}

export function isRoutineItemRelatedToSupplies(item: CatCareRoutineItem) {
  return (
    item.category === "meal" ||
    item.category === "treat" ||
    item.category === "medicine"
  );
}

export function dedupeLibraryItems(items: CatCareLibraryItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.itemType}:${item.name.trim().toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function normalizeCareEventInput(
  formData: FormData
): ServiceResult<Omit<Database["public"]["Tables"]["care_events"]["Insert"], "owner_id">> {
  const catId = String(formData.get("catId") ?? "").trim();
  const eventType = normalizeCareEventType(formData.get("eventType"));
  const title = String(formData.get("title") ?? "").trim();
  const note = normalizeOptionalText(formData.get("note"));
  const relatedItemName = normalizeOptionalText(formData.get("relatedItemName"));
  const severity = normalizeCareEventSeverity(formData.get("severity"));
  const occurredOn = normalizeDate(formData.get("occurredOn"));
  const fields: Record<string, string> = {};

  if (!catId) {
    fields.catId = "required";
  }

  if (title.length < 1 || title.length > 120) {
    fields.title = "invalid";
  }

  if (note && note.length > 2000) {
    fields.note = "invalid";
  }

  if (Object.keys(fields).length > 0) {
    return serviceError("validation_error", "Check the care event fields.", fields);
  }

  return serviceOk({
    cat_id: catId,
    event_type: eventType,
    note,
    occurred_on: occurredOn,
    related_item_name: relatedItemName,
    severity,
    title
  });
}

export function normalizeCareEventType(
  value: FormDataEntryValue | null
): CareEventRow["event_type"] {
  const text = String(value ?? "").trim();

  return text === "feeding" ||
    text === "treat" ||
    text === "health" ||
    text === "medicine" ||
    text === "vet" ||
    text === "travel" ||
    text === "behavior" ||
    text === "environment" ||
    text === "other"
    ? text
    : "other";
}

export function normalizeCareEventSeverity(
  value: FormDataEntryValue | null
): CareEventRow["severity"] {
  const text = String(value ?? "").trim();

  return text === "watch" || text === "urgent" ? text : "normal";
}

export function groupByPlan<T extends { planId: string }>(items: T[]) {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const group = groups.get(item.planId);

    if (group) {
      group.push(item);
    } else {
      groups.set(item.planId, [item]);
    }
  }

  return groups;
}

export function countByPlan(items: Array<{ plan_id: string }>) {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item.plan_id, (counts.get(item.plan_id) ?? 0) + 1);
  }

  return counts;
}

export function mapDbBoundaryError(
  result: Extract<DbBoundaryResult<unknown>, { ok: false }>
): ServiceResult<never> {
  return serviceError(
    result.code === "scope_mismatch" ? "forbidden" : "unauthorized",
    result.message
  );
}

export function mapCat(row: CatRow): CatCareCat {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    gender: row.gender,
    birthDate: row.birth_date,
    lifeStage: row.life_stage,
    breed: row.breed,
    weightKg: row.weight_kg,
    photoUrl: row.photo_url,
    safetyNotes: row.safety_notes,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapCatSummary(row: Pick<CatRow, "id" | "name">): CatCareCatSummary {
  return {
    id: row.id,
    name: row.name
  };
}

export function mapRoutine(row: CareRoutineRow): Omit<CatCareRoutine, "items"> {
  return {
    catId: row.cat_id,
    createdAt: row.created_at,
    id: row.id,
    isDefault: row.is_default,
    notes: row.notes,
    ownerId: row.owner_id,
    source: row.source,
    title: row.title,
    updatedAt: row.updated_at
  };
}

export function mapRoutineItem(row: CareRoutineItemRow): CatCareRoutineItem {
  return {
    category: row.category,
    enabled: row.enabled,
    frequency: row.frequency,
    id: row.id,
    instructions: row.instructions,
    routineId: row.routine_id,
    sortOrder: row.sort_order,
    timeHint: row.time_hint,
    title: row.title
  };
}

export function mapCareItem(row: CareItemRow): CatCareItem {
  return {
    brand: null,
    catId: row.cat_id,
    createdAt: row.created_at,
    defaultAmount: row.default_amount,
    defaultFrequency: row.default_frequency,
    id: row.id,
    instructions: row.instructions,
    itemType: row.item_type,
    name: row.name,
    ownerItemId: null,
    ownerId: row.owner_id,
    updatedAt: row.updated_at,
    visibleToSitter: row.visible_to_sitter
  };
}

export function mapLibraryItem(row: OwnerItemLibraryRow): CatCareLibraryItem {
  return {
    brand: row.brand,
    catalogProductId: row.catalog_product_id,
    createdAt: row.created_at,
    id: row.id,
    itemType: row.item_type,
    name: row.display_name,
    notes: row.notes,
    ownerId: row.owner_id,
    updatedAt: row.updated_at
  };
}

export function mapCatalogProduct(row: ProductCatalogRow): CatCareCatalogProduct {
  return {
    brand: row.brand,
    displayName: row.display_name,
    id: row.id,
    itemType: row.item_type
  };
}

export function mapCatItemAssignment(
  assignment: CatItemAssignmentRow,
  libraryItem: CatCareLibraryItem
): CatCareItem {
  return {
    brand: libraryItem.brand,
    catId: assignment.cat_id,
    createdAt: assignment.created_at,
    defaultAmount: assignment.default_amount,
    defaultFrequency: assignment.default_frequency,
    id: assignment.id,
    instructions: assignment.instructions,
    itemType: libraryItem.itemType,
    name: libraryItem.name,
    ownerId: assignment.owner_id,
    ownerItemId: assignment.owner_item_id,
    updatedAt: assignment.updated_at,
    visibleToSitter: assignment.visible_to_sitter
  };
}

export function mapCatItemTag(row: CatItemAssignmentRow): CatCareItemTag {
  return {
    catId: row.cat_id,
    defaultAmount: row.default_amount,
    defaultFrequency: row.default_frequency,
    id: row.id,
    instructions: row.instructions,
    ownerItemId: row.owner_item_id,
    visibleToSitter: row.visible_to_sitter
  };
}

export function mapAssignedItemToLibraryItem(item: CatCareItem): CatCareLibraryItem {
  return {
    brand: item.brand,
    catalogProductId: null,
    createdAt: item.createdAt,
    id: item.ownerItemId ?? item.id,
    itemType: item.itemType,
    name: item.name,
    notes: null,
    ownerId: item.ownerId,
    updatedAt: item.updatedAt
  };
}

export function mapCareEvent(row: CareEventRow): CatCareEvent {
  return {
    catId: row.cat_id,
    createdAt: row.created_at,
    endedOn: row.ended_on,
    eventType: row.event_type,
    id: row.id,
    note: row.note,
    occurredOn: row.occurred_on,
    ownerId: row.owner_id,
    relatedItemName: row.related_item_name,
    severity: row.severity,
    startedOn: row.started_on,
    title: row.title,
    updatedAt: row.updated_at
  };
}

export async function trackCatCareProductEvent(
  ownerId: string,
  event:
    | "catcare_cat_created"
    | "catcare_cat_updated"
    | "catcare_cat_deleted"
    | "catcare_routine_started"
    | "catcare_routine_copied"
    | "catcare_routine_saved",
  properties: Record<string, unknown>
) {
  const posthogKey =
    readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY) ??
    readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

  if (!posthogKey) {
    return;
  }

  const posthogHost =
    readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST) ??
    "https://us.i.posthog.com";

  try {
    const response = await fetch(`${posthogHost.replace(/\/$/, "")}/capture/`, {
      body: JSON.stringify({
        api_key: posthogKey,
        distinct_id: ownerId,
        event,
        properties: {
          ...getAnalyticsBaseProperties("core"),
          module: "catcare",
          provider: CATCARE_ANALYTICS_PROVIDER,
          ...sanitizeCatCareAnalyticsProperties(properties)
        }
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      console.warn("CatCare PostHog capture failed", {
        event,
        status: response.status
      });
    }
  } catch (error) {
    console.warn("CatCare PostHog capture failed", {
      event,
      message: error instanceof Error ? error.message : "unknown_error"
    });
  }
}

export function sanitizeCatCareAnalyticsProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...(typeof properties.enabled_item_count === "number"
      ? { enabled_item_count: properties.enabled_item_count }
      : {}),
    ...(typeof properties.item_count === "number"
      ? { item_count: properties.item_count }
      : {}),
    ...(typeof properties.custom_item_count === "number"
      ? { custom_item_count: properties.custom_item_count }
      : {}),
    ...(typeof properties.cat_count === "number"
      ? { cat_count: properties.cat_count }
      : {}),
    ...(typeof properties.has_existing_routine === "boolean"
      ? { has_existing_routine: properties.has_existing_routine }
      : {}),
    ...(typeof properties.has_photo === "boolean"
      ? { has_photo: properties.has_photo }
      : {}),
    ...(typeof properties.breed === "string"
      ? { breed: properties.breed }
      : {}),
    ...(typeof properties.source === "string"
      ? { source: properties.source }
      : {})
  };
}

export function mapPlan(row: CarePlanRow): Omit<CatCarePlan, "tasks" | "submissions"> {
  return {
    id: row.id,
    ownerId: row.owner_id,
    catId: row.cat_id,
    title: row.title,
    status: row.status,
    aiInputSummary: row.ai_input_summary,
    generationSource: row.generation_source,
    scenario: row.scenario,
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

export function mapTask(row: CareTaskRow): CatCareTask {
  return {
    id: row.id,
    planId: row.plan_id,
    category: row.category,
    enabled: row.enabled,
    frequency: row.frequency,
    title: row.title,
    timeHint: row.time_hint,
    instructions: row.instructions,
    sortOrder: row.sort_order,
    required: row.required,
    source: row.source
  };
}

export function mapSubmission(row: CareSubmissionRow): CatCareSubmission {
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

export function mapSupabaseError(error: { code?: string }): ServiceResult<never> {
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

export function isMissingCatCareLibraryTable(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    Boolean(
      error.message?.includes("catcare_product_catalog") ||
        error.message?.includes("owner_item_library") ||
        error.message?.includes("cat_item_assignments")
    )
  );
}
