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
} from "../supabase/server";
import { getCurrentUserClaims } from "../services/auth";
import { getSupabasePublicConfig } from "../supabase/config";
import type { Database } from "../supabase/database.types";
import {
  getLifeStageFromBirthDate,
  isCatBreedId,
  isCatIllustrationSrc,
  type CatGender,
  type CatLifeStage
} from "./cat-profile-options";
import {
  getAnalyticsBaseProperties,
  readOptionalPublicEnv
} from "../analytics/config";

type CatRow = Database["public"]["Tables"]["cats"]["Row"];
type CareRoutineRow = Database["public"]["Tables"]["care_routines"]["Row"];
type CareRoutineItemRow =
  Database["public"]["Tables"]["care_routine_items"]["Row"];
type CareItemRow = Database["public"]["Tables"]["care_items"]["Row"];
type ProductCatalogRow =
  Database["public"]["Tables"]["catcare_product_catalog"]["Row"];
type OwnerItemLibraryRow =
  Database["public"]["Tables"]["owner_item_library"]["Row"];
type CatItemAssignmentRow =
  Database["public"]["Tables"]["cat_item_assignments"]["Row"];
type CareEventRow = Database["public"]["Tables"]["care_events"]["Row"];
type CarePlanRow = Database["public"]["Tables"]["care_plans"]["Row"];
type CareTaskRow = Database["public"]["Tables"]["care_tasks"]["Row"];
type CareTaskInsert = Database["public"]["Tables"]["care_tasks"]["Insert"];
type CareSubmissionRow =
  Database["public"]["Tables"]["care_submissions"]["Row"];

export type CarePlanStatus = "draft" | "published" | "reviewed" | "closed";
export type CareSubmissionStatus = "completed" | "note" | "exception";

export type CatCareCat = {
  id: string;
  ownerId: string;
  name: string;
  gender: CatGender | null;
  birthDate: string | null;
  lifeStage: CatLifeStage | null;
  breed: string | null;
  weightKg: number | null;
  photoUrl: string | null;
  safetyNotes: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatCareCatSummary = Pick<CatCareCat, "id" | "name">;

export type CatCareTask = {
  id: string;
  planId: string;
  category: CareTaskRow["category"];
  enabled: boolean;
  frequency: string | null;
  title: string;
  timeHint: string | null;
  instructions: string | null;
  sortOrder: number;
  required: boolean;
  source: CareTaskRow["source"];
};

export type CatCareRoutineItem = {
  id: string;
  routineId: string;
  category: CareRoutineItemRow["category"];
  title: string;
  frequency: string;
  timeHint: string | null;
  instructions: string | null;
  enabled: boolean;
  sortOrder: number;
};

export type CatCareRoutine = {
  id: string;
  ownerId: string;
  catId: string;
  title: string;
  source: CareRoutineRow["source"];
  isDefault: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: CatCareRoutineItem[];
};

export type CatCareItem = {
  id: string;
  ownerId: string;
  catId: string;
  ownerItemId: string | null;
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
  brand: string | null;
  defaultAmount: string | null;
  defaultFrequency: string | null;
  instructions: string | null;
  visibleToSitter: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CatCareLibraryItem = {
  id: string;
  ownerId: string;
  catalogProductId: string | null;
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
  brand: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatCareItemTag = {
  id: string;
  catId: string;
  defaultAmount: string | null;
  defaultFrequency: string | null;
  instructions: string | null;
  ownerItemId: string;
  visibleToSitter: boolean;
};

export type CatCareCatalogProduct = {
  id: string;
  itemType: ProductCatalogRow["item_type"];
  displayName: string;
  brand: string | null;
};

export type CatCareEvent = {
  id: string;
  ownerId: string;
  catId: string;
  eventType: CareEventRow["event_type"];
  title: string;
  note: string | null;
  relatedItemName: string | null;
  severity: CareEventRow["severity"];
  occurredOn: string | null;
  startedOn: string | null;
  endedOn: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatCareRoutineWorkspace = {
  cats: CatCareCatSummary[];
  items: CatCareItem[];
  libraryItems: CatCareLibraryItem[];
  routineSourceCats: Array<{ id: string; name: string }>;
  selectedCat: CatCareCatSummary | null;
  routine: CatCareRoutine | null;
};

export type CatCareItemsWorkspace = {
  cats: CatCareCatSummary[];
  selectedCat: CatCareCatSummary | null;
  items: CatCareItem[];
  itemTags: CatCareItemTag[];
  libraryItems: CatCareLibraryItem[];
  catalogProducts: CatCareCatalogProduct[];
  routineOwnerItemKeys: string[];
  routineOwnerItemKeysByCatId: Record<string, string[]>;
  routineItems: CatCareRoutineItem[];
};

export type CatCareEventsWorkspace = {
  cats: CatCareCatSummary[];
  selectedCat: CatCareCatSummary | null;
  events: CatCareEvent[];
  libraryItems: CatCareLibraryItem[];
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
  generationSource: CarePlanRow["generation_source"];
  scenario: CarePlanRow["scenario"];
  aiInputSummary: Database["public"]["Tables"]["care_plans"]["Row"]["ai_input_summary"];
  startOn: string | null;
  endOn: string | null;
  handoffNotes: string | null;
  publishedAt: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  submissionCount?: number;
  tasks: CatCareTask[];
  submissions: CatCareSubmission[];
};

export type CatCareWorkspace = {
  cats: CatCareCatSummary[];
  eventCount: number;
  itemCount: number;
  planCount: number;
  publishedPlanCount: number;
  routineCount: number;
  submissionCount: number;
};

type CatCareWorkspaceStats = Omit<CatCareWorkspace, "cats">;

export type CatCareCatsWorkspace = {
  cats: CatCareCat[];
};

export type CatCarePlanListWorkspace = {
  cats: CatCareCatSummary[];
  plans: CatCarePlan[];
};

type CreateCatInput = {
  name: string;
  gender: CatGender;
  birthDate: string | null;
  lifeStage: CatLifeStage;
  breed: string | null;
  weightKg: number | null;
  photoUrl: string | null;
  safetyNotes: string | null;
  notes: string | null;
};

type CreatePlanInput = {
  catId: string;
  catIds: string[];
  scenario: CarePlanRow["scenario"];
  title: string;
  visitCount: number;
  startOn: string | null;
  endOn: string | null;
  handoffNotes: string | null;
  tasks: Array<{
    title: string;
    instructions: string | null;
    sortOrder: number;
    required: boolean;
    category?: CareTaskRow["category"];
    enabled?: boolean;
    frequency?: string | null;
    source?: CareTaskRow["source"];
    sourceRef?: string | null;
    timeHint?: string | null;
  }>;
};

type CreateCareItemInput = {
  catId?: string;
  currentCatId?: string | null;
  defaultAmount?: string | null;
  defaultFrequency?: string | null;
  instructions: string | null;
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
  visibleToSitter?: boolean;
};

const CAT_SELECT =
  "id, owner_id, name, gender, birth_date, life_stage, breed, weight_kg, photo_url, safety_notes, notes, created_at, updated_at";
const CAT_SUMMARY_SELECT = "id, name";
const ROUTINE_SELECT =
  "id, owner_id, cat_id, title, source, is_default, notes, created_at, updated_at";
const ROUTINE_ITEM_SELECT =
  "id, routine_id, category, title, frequency, time_hint, instructions, enabled, sort_order, created_at, updated_at";
const CARE_ITEM_SELECT =
  "id, owner_id, cat_id, item_type, name, default_amount, default_frequency, instructions, visible_to_sitter, created_at, updated_at";
const PRODUCT_CATALOG_SELECT =
  "id, item_type, brand, product_name, display_name, aliases, country_region, source, is_active, created_at, updated_at";
const OWNER_ITEM_SELECT =
  "id, owner_id, catalog_product_id, item_type, display_name, brand, notes, created_at, updated_at";
const CAT_ITEM_ASSIGNMENT_SELECT =
  "id, owner_id, cat_id, owner_item_id, default_amount, default_frequency, instructions, visible_to_sitter, created_at, updated_at";
const CARE_EVENT_SELECT =
  "id, owner_id, cat_id, event_type, title, note, related_item_name, severity, occurred_on, started_on, ended_on, created_at, updated_at";
const CATCARE_ANALYTICS_PROVIDER = "posthog";
const MAX_ROUTINE_FREQUENCY_COUNT = 12;
const catCareOwnerCacheTtlMs = 5 * 60_000;
const catListCacheTtlMs = catCareOwnerCacheTtlMs;
const catSummaryCacheTtlMs = catCareOwnerCacheTtlMs;
const catCareWorkspaceStatsCacheTtlMs = catCareOwnerCacheTtlMs;
const catCarePlanSummaryCacheTtlMs = catCareOwnerCacheTtlMs;
const catCarePlanDetailCacheTtlMs = catCareOwnerCacheTtlMs;
const catCareEventListCacheTtlMs = catCareOwnerCacheTtlMs;
const ownerLibraryItemCacheTtlMs = catCareOwnerCacheTtlMs;
const catItemAssignmentCacheTtlMs = catCareOwnerCacheTtlMs;
const routineSourceCatCacheTtlMs = catCareOwnerCacheTtlMs;
const routineOwnerItemKeyCacheTtlMs = catCareOwnerCacheTtlMs;
const defaultRoutineCacheTtlMs = catCareOwnerCacheTtlMs;
const catSummaryCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareCatSummary[];
  }
>();
const catListCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareCat[];
  }
>();
const catCareWorkspaceStatsCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareWorkspaceStats;
  }
>();
const catCarePlanSummaryCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCarePlan[];
  }
>();
const catCarePlanDetailCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCarePlan;
  }
>();
const catCareEventListCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareEvent[];
  }
>();
const ownerLibraryItemCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareLibraryItem[];
  }
>();
const catItemAssignmentCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatItemAssignmentRow[];
  }
>();
const routineSourceCatCache = new Map<
  string,
  {
    expiresAt: number;
    value: string[];
  }
>();
const routineOwnerItemKeyCache = new Map<
  string,
  {
    expiresAt: number;
    value: Record<string, string[]>;
  }
>();
const defaultRoutineCache = new Map<
  string,
  {
    expiresAt: number;
    value: CatCareRoutine | null;
  }
>();

const listCachedActiveCatalogRows = unstable_cache(
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

async function loadActiveCatalogProducts(): Promise<
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

async function loadCatSummaries(
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

function readCatSummaryCache(ownerId: string) {
  const entry = catSummaryCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catSummaryCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeCatSummaryCache(ownerId: string, value: CatCareCatSummary[]) {
  catSummaryCache.set(ownerId, {
    expiresAt: Date.now() + catSummaryCacheTtlMs,
    value
  });
}

function clearCatSummaryCache(ownerId: string) {
  catSummaryCache.delete(ownerId);
}

async function loadCats(
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

function readCatListCache(ownerId: string) {
  const entry = catListCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catListCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeCatListCache(ownerId: string, value: CatCareCat[]) {
  catListCache.set(ownerId, {
    expiresAt: Date.now() + catListCacheTtlMs,
    value
  });
}

function clearCatListCache(ownerId: string) {
  catListCache.delete(ownerId);
}

async function loadCatCareWorkspaceStats(
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

function readCatCareWorkspaceStatsCache(ownerId: string) {
  const entry = catCareWorkspaceStatsCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catCareWorkspaceStatsCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeCatCareWorkspaceStatsCache(
  ownerId: string,
  value: CatCareWorkspaceStats
) {
  catCareWorkspaceStatsCache.set(ownerId, {
    expiresAt: Date.now() + catCareWorkspaceStatsCacheTtlMs,
    value
  });
}

function clearCatCareWorkspaceStatsCache(ownerId: string) {
  catCareWorkspaceStatsCache.delete(ownerId);
}

async function loadCatCarePlanSummaries(
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

function readCatCarePlanSummaryCache(ownerId: string) {
  const entry = catCarePlanSummaryCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catCarePlanSummaryCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeCatCarePlanSummaryCache(
  ownerId: string,
  value: CatCarePlan[]
) {
  catCarePlanSummaryCache.set(ownerId, {
    expiresAt: Date.now() + catCarePlanSummaryCacheTtlMs,
    value
  });
}

function clearCatCarePlanSummaryCache(ownerId: string) {
  catCarePlanSummaryCache.delete(ownerId);
}

function readCatCarePlanDetailCache(
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

function writeCatCarePlanDetailCache(
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

function clearCatCarePlanDetailCache(ownerId: string, planId?: string) {
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

function makeCatCarePlanDetailCacheKey(
  ownerId: string,
  planId: string,
  includeSubmissions: boolean
) {
  return `${ownerId}:${planId}:${includeSubmissions ? "with-submissions" : "tasks-only"}`;
}

async function loadOwnerLibraryItems(
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

function readOwnerLibraryItemCache(ownerId: string) {
  const entry = ownerLibraryItemCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    ownerLibraryItemCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeOwnerLibraryItemCache(
  ownerId: string,
  value: CatCareLibraryItem[]
) {
  ownerLibraryItemCache.set(ownerId, {
    expiresAt: Date.now() + ownerLibraryItemCacheTtlMs,
    value
  });
}

function clearOwnerLibraryItemCache(ownerId: string) {
  ownerLibraryItemCache.delete(ownerId);
}

async function loadCatItemAssignments(
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

function readCatItemAssignmentCache(ownerId: string) {
  const entry = catItemAssignmentCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catItemAssignmentCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeCatItemAssignmentCache(
  ownerId: string,
  value: CatItemAssignmentRow[]
) {
  catItemAssignmentCache.set(ownerId, {
    expiresAt: Date.now() + catItemAssignmentCacheTtlMs,
    value
  });
}

function clearCatItemAssignmentCache(ownerId: string) {
  catItemAssignmentCache.delete(ownerId);
}

async function loadRoutineSourceCatIds(
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

function readRoutineSourceCatCache(ownerId: string) {
  const entry = routineSourceCatCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    routineSourceCatCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeRoutineSourceCatCache(ownerId: string, value: string[]) {
  routineSourceCatCache.set(ownerId, {
    expiresAt: Date.now() + routineSourceCatCacheTtlMs,
    value
  });
}

function clearRoutineSourceCatCache(ownerId: string) {
  routineSourceCatCache.delete(ownerId);
}

async function loadDefaultRoutine(
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

function readDefaultRoutineCache(ownerId: string, catId: string) {
  const key = makeDefaultRoutineCacheKey(ownerId, catId);
  const entry = defaultRoutineCache.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    defaultRoutineCache.delete(key);
    return undefined;
  }

  return entry.value;
}

function writeDefaultRoutineCache(
  ownerId: string,
  catId: string,
  value: CatCareRoutine | null
) {
  defaultRoutineCache.set(makeDefaultRoutineCacheKey(ownerId, catId), {
    expiresAt: Date.now() + defaultRoutineCacheTtlMs,
    value
  });
}

function clearDefaultRoutineCache(ownerId: string) {
  for (const key of defaultRoutineCache.keys()) {
    if (key.startsWith(`${ownerId}:`)) {
      defaultRoutineCache.delete(key);
    }
  }
}

function makeDefaultRoutineCacheKey(ownerId: string, catId: string) {
  return `${ownerId}:${catId}`;
}

async function loadCareEvents(
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

function readCatCareEventListCache(ownerId: string) {
  const entry = catCareEventListCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    catCareEventListCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeCatCareEventListCache(ownerId: string, value: CatCareEvent[]) {
  catCareEventListCache.set(ownerId, {
    expiresAt: Date.now() + catCareEventListCacheTtlMs,
    value
  });
}

function clearCatCareEventListCache(ownerId: string) {
  catCareEventListCache.delete(ownerId);
}

async function loadCatCarePlans(
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

const routineItemDefinitions = [
  { category: "meal", key: "dry_food", sortOrder: 0, title: "主粮", fallbackFrequency: "daily_2", fallbackTime: "08:30,18:30", fallbackInstructions: "50g" },
  { category: "meal", key: "canned", sortOrder: 1, title: "罐头", fallbackFrequency: "weekly_3", fallbackTime: "14:00,18:30", fallbackInstructions: "半罐" },
  { category: "treat", key: "treats", sortOrder: 2, title: "零食", fallbackFrequency: "daily", fallbackTime: "18:30", fallbackInstructions: "2-3 颗" },
  { category: "water", key: "water", sortOrder: 3, title: "换水", fallbackFrequency: "daily", fallbackTime: "", fallbackInstructions: "换新鲜水，全天保持清洁" },
  { category: "litter", key: "litter", sortOrder: 4, title: "清理猫砂", fallbackFrequency: "daily", fallbackTime: "18:30", fallbackInstructions: "铲 1 次" },
  { category: "play", key: "play", sortOrder: 5, title: "陪玩", fallbackFrequency: "daily", fallbackTime: "18:30", fallbackInstructions: "15 分钟" }
] as const satisfies ReadonlyArray<{
  category: CareRoutineItemRow["category"];
  fallbackFrequency: string;
  key: string;
  sortOrder: number;
  title: string;
  fallbackTime: string;
  fallbackInstructions: string;
}>;

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

  const [catsResult, statsResult] = await Promise.all([
    loadCatSummaries(clientResult.data, ownerResult.data),
    loadCatCareWorkspaceStats(clientResult.data, ownerResult.data)
  ]);

  if (!catsResult.ok) {
    return catsResult;
  }

  if (!statsResult.ok) {
    return statsResult;
  }

  return serviceOk({
    cats: catsResult.data,
    ...statsResult.data
  });
}

export async function getCatCareCatsWorkspace(): Promise<
  ServiceResult<CatCareCatsWorkspace>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const catsResult = await loadCats(clientResult.data, ownerResult.data);

  if (!catsResult.ok) {
    return catsResult;
  }

  return serviceOk({ cats: catsResult.data });
}

export async function getCatCarePlanListWorkspace(): Promise<
  ServiceResult<CatCarePlanListWorkspace>
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
    loadCatSummaries(clientResult.data, ownerResult.data),
    loadCatCarePlanSummaries(clientResult.data, ownerResult.data)
  ]);

  if (!catsResult.ok) {
    return catsResult;
  }

  if (!plansResult.ok) {
    return plansResult;
  }

  return serviceOk({
    cats: catsResult.data,
    plans: plansResult.data
  });
}

export async function getCatCarePlanResultsWorkspace(): Promise<
  ServiceResult<{ plans: CatCarePlan[] }>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const plansResult = await loadCatCarePlanSummaries(
    clientResult.data,
    ownerResult.data
  );

  if (!plansResult.ok) {
    return plansResult;
  }

  return serviceOk({ plans: plansResult.data });
}

export async function getCatCareRoutineWorkspace(
  catId?: string
): Promise<ServiceResult<CatCareRoutineWorkspace>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const catsResult = await loadCatSummaries(clientResult.data, ownerResult.data);

  if (!catsResult.ok) {
    return catsResult;
  }

  const cats = catsResult.data;
  const selectedCat = cats.find((cat) => cat.id === catId) ?? cats[0] ?? null;

  if (!selectedCat) {
    return serviceOk({
      cats,
      items: [],
      libraryItems: [],
      routineSourceCats: [],
      selectedCat: null,
      routine: null
    });
  }

  const [routineResult, careItemsResult, libraryItemsResult, sourceCatIdsResult] = await Promise.all([
    loadDefaultRoutine(clientResult.data, ownerResult.data, selectedCat.id),
    loadCatCareAssignedItems(clientResult.data, ownerResult.data, selectedCat.id, {
      limit: 8
    }),
    loadOwnerLibraryItems(clientResult.data, ownerResult.data),
    loadRoutineSourceCatIds(clientResult.data, ownerResult.data)
  ]);

  if (!routineResult.ok) {
    return routineResult;
  }
  if (!careItemsResult.ok) {
    return careItemsResult;
  }

  if (!libraryItemsResult.ok) {
    return libraryItemsResult;
  }

  if (!sourceCatIdsResult.ok) {
    return sourceCatIdsResult;
  }

  const items = careItemsResult.data;
  const libraryItems = libraryItemsResult.data.length > 0
    ? libraryItemsResult.data
    : dedupeLibraryItems(items.map(mapAssignedItemToLibraryItem));
  const routineCatIds = new Set(sourceCatIdsResult.data);
  const routineSourceCats = cats
    .filter((cat) => cat.id !== selectedCat.id && routineCatIds.has(cat.id))
    .map((cat) => ({ id: cat.id, name: cat.name }));

  if (!routineResult.data) {
    return serviceOk({ cats, items, libraryItems, routineSourceCats, selectedCat, routine: null });
  }

  return serviceOk({
    cats,
    items,
    libraryItems,
    routineSourceCats,
    selectedCat,
    routine: routineResult.data
  });
}

export async function copyCatCareRoutineFromFormData(
  formData: FormData
): Promise<ServiceResult<{ catId: string }>> {
  const sourceCatId = String(formData.get("sourceCatId") ?? "").trim();
  const targetCatId = String(formData.get("targetCatId") ?? "").trim();

  if (!sourceCatId || !targetCatId || sourceCatId === targetCatId) {
    return serviceError("validation_error", "Choose a source cat and target cat.");
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const catsResult = await clientResult.data
    .from("cats")
    .select("id")
    .eq("owner_id", ownerResult.data)
    .in("id", [sourceCatId, targetCatId]);

  if (catsResult.error) {
    return mapSupabaseError(catsResult.error);
  }

  if ((catsResult.data ?? []).length !== 2) {
    return serviceError("validation_error", "Both cats must belong to this account.");
  }

  const sourceRoutineResult = await clientResult.data
    .from("care_routines")
    .select(ROUTINE_SELECT)
    .eq("owner_id", ownerResult.data)
    .eq("cat_id", sourceCatId)
    .eq("is_default", true)
    .maybeSingle();

  if (sourceRoutineResult.error) {
    return mapSupabaseError(sourceRoutineResult.error);
  }

  if (!sourceRoutineResult.data) {
    return serviceError("validation_error", "The source cat does not have a reusable routine yet.");
  }

  const sourceItemsResult = await clientResult.data
    .from("care_routine_items")
    .select(ROUTINE_ITEM_SELECT)
    .eq("routine_id", sourceRoutineResult.data.id)
    .order("sort_order", { ascending: true });

  if (sourceItemsResult.error) {
    return mapSupabaseError(sourceItemsResult.error);
  }

  const sourceItems = sourceItemsResult.data ?? [];

  if (sourceItems.length === 0) {
    return serviceError("validation_error", "The source cat routine has no items to copy.");
  }

  const targetRoutineResult = await clientResult.data
    .from("care_routines")
    .select(ROUTINE_SELECT)
    .eq("owner_id", ownerResult.data)
    .eq("cat_id", targetCatId)
    .eq("is_default", true)
    .maybeSingle();

  if (targetRoutineResult.error) {
    return mapSupabaseError(targetRoutineResult.error);
  }

  const routineResult = targetRoutineResult.data
    ? await clientResult.data
        .from("care_routines")
        .update({ notes: sourceRoutineResult.data.notes, source: "manual", title: "Daily care routine" })
        .eq("id", targetRoutineResult.data.id)
        .select(ROUTINE_SELECT)
        .single()
    : await clientResult.data
        .from("care_routines")
        .insert({
          cat_id: targetCatId,
          is_default: true,
          notes: sourceRoutineResult.data.notes,
          owner_id: ownerResult.data,
          source: "manual",
          title: "Daily care routine"
        })
        .select(ROUTINE_SELECT)
        .single();

  if (routineResult.error) {
    return mapSupabaseError(routineResult.error);
  }

  const deleteResult = await clientResult.data
    .from("care_routine_items")
    .delete()
    .eq("routine_id", routineResult.data.id);

  if (deleteResult.error) {
    return mapSupabaseError(deleteResult.error);
  }

  const copiedItems = sourceItems.map((item) => ({
    category: item.category,
    enabled: item.enabled,
    frequency: item.frequency,
    instructions: item.instructions,
    routine_id: routineResult.data.id,
    sort_order: item.sort_order,
    time_hint: item.time_hint,
    title: item.title
  }));

  const insertResult = await clientResult.data
    .from("care_routine_items")
    .insert(copiedItems)
    .select(ROUTINE_ITEM_SELECT);

  if (insertResult.error) {
    return mapSupabaseError(insertResult.error);
  }

  const syncResult = await syncRoutineProductsToOwnerItems(
    clientResult.data,
    ownerResult.data,
    targetCatId,
    copiedItems
  );

  if (!syncResult.ok) {
    return syncResult;
  }

  clearOwnerLibraryItemCache(ownerResult.data);
  clearCatItemAssignmentCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);
  clearRoutineSourceCatCache(ownerResult.data);
  clearRoutineOwnerItemKeyCache(ownerResult.data);
  clearDefaultRoutineCache(ownerResult.data);
  void trackCatCareProductEvent(ownerResult.data, "catcare_routine_copied", {
    item_count: copiedItems.length,
    source: "owner_flow"
  });

  return serviceOk({ catId: targetCatId });
}

export async function saveCatCareRoutineFromFormData(
  formData: FormData
): Promise<ServiceResult<CatCareRoutine>> {
  const catId = String(formData.get("catId") ?? "").trim();
  const notes = normalizeOptionalText(formData.get("notes"));
  const fields: Record<string, string> = {};

  if (!catId) {
    fields.catId = "required";
  }

  const items = routineItemDefinitions.map((definition) => ({
    category: definition.category,
    enabled: formData.get(`${definition.key}.enabled`) === "on",
    frequency: normalizeRoutineFrequency(
      formData.get(`${definition.key}.frequency`),
      definition.fallbackFrequency
    ),
    instructions: normalizeRoutineInstructions(
      formData.get(`${definition.key}.brand`),
      formData.get(`${definition.key}.instructions`)
    ) ?? definition.fallbackInstructions,
    sort_order: definition.sortOrder,
    time_hint: normalizeRoutineTimes(
      formData.getAll(`${definition.key}.time`),
      definition.fallbackTime
    ),
    title: definition.title
  }));
  const customItems = Array.from({ length: 8 }, (_, index) => {
    const title = normalizeOptionalText(formData.get(`custom.${index}.title`));

    if (!title) {
      return null;
    }

    return {
      category: normalizeRoutineCustomCategory(
        formData.get(`custom.${index}.category`)
      ),
      enabled: formData.get(`custom.${index}.enabled`) === "on",
      frequency: normalizeRoutineFrequency(
        formData.get(`custom.${index}.frequency`),
        "daily"
      ),
      instructions: normalizeOptionalText(
        formData.get(`custom.${index}.instructions`)
      ),
      sort_order: routineItemDefinitions.length + index,
      time_hint: normalizeRoutineTimes(
        formData.getAll(`custom.${index}.time`),
        ""
      ),
      title
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
  const allItems = [...items, ...customItems];

  if (Object.keys(fields).length > 0) {
    return serviceError("validation_error", "Choose a cat before saving routine.", fields);
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const catResult = await clientResult.data
    .from("cats")
    .select("id")
    .eq("owner_id", ownerResult.data)
    .eq("id", catId)
    .single();

  if (catResult.error) {
    return mapSupabaseError(catResult.error);
  }

  const existingResult = await clientResult.data
    .from("care_routines")
    .select(ROUTINE_SELECT)
    .eq("owner_id", ownerResult.data)
    .eq("cat_id", catId)
    .eq("is_default", true)
    .maybeSingle();

  if (existingResult.error) {
    return mapSupabaseError(existingResult.error);
  }

  const routineResult = existingResult.data
    ? await clientResult.data
        .from("care_routines")
        .update({ notes, source: "manual", title: "Daily care routine" })
        .eq("id", existingResult.data.id)
        .select(ROUTINE_SELECT)
        .single()
    : await clientResult.data
        .from("care_routines")
        .insert({
          cat_id: catId,
          is_default: true,
          notes,
          owner_id: ownerResult.data,
          source: "manual",
          title: "Daily care routine"
        })
        .select(ROUTINE_SELECT)
        .single();

  if (routineResult.error) {
    return mapSupabaseError(routineResult.error);
  }

  const deleteResult = await clientResult.data
    .from("care_routine_items")
    .delete()
    .eq("routine_id", routineResult.data.id);

  if (deleteResult.error) {
    return mapSupabaseError(deleteResult.error);
  }

  const itemsResult = await clientResult.data
    .from("care_routine_items")
    .insert(
      allItems.map((item) => ({
        ...item,
        routine_id: routineResult.data.id
      }))
    )
    .select(ROUTINE_ITEM_SELECT)
    .order("sort_order", { ascending: true });

  if (itemsResult.error) {
    return mapSupabaseError(itemsResult.error);
  }

  const syncResult = await syncRoutineProductsToOwnerItems(
    clientResult.data,
    ownerResult.data,
    catId,
    allItems
  );

  if (!syncResult.ok) {
    return syncResult;
  }

  clearOwnerLibraryItemCache(ownerResult.data);
  clearCatItemAssignmentCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);
  clearRoutineSourceCatCache(ownerResult.data);
  clearRoutineOwnerItemKeyCache(ownerResult.data);
  clearDefaultRoutineCache(ownerResult.data);
  void trackCatCareProductEvent(ownerResult.data, "catcare_routine_saved", {
    enabled_item_count: allItems.filter((item) => item.enabled).length,
    item_count: allItems.length,
    custom_item_count: customItems.length,
    source: "owner_flow"
  });

  return serviceOk({
    ...mapRoutine(routineResult.data),
    items: (itemsResult.data ?? []).map(mapRoutineItem)
  });
}

export async function getCatCareItemsWorkspace(
  catId?: string
): Promise<ServiceResult<CatCareItemsWorkspace>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const catsResult = await loadCatSummaries(clientResult.data, ownerResult.data);

  if (!catsResult.ok) {
    return catsResult;
  }

  const cats = catsResult.data;
  const selectedCat = cats.find((cat) => cat.id === catId) ?? cats[0] ?? null;

  if (!selectedCat) {
    return serviceOk({
      catalogProducts: [],
      cats,
      itemTags: [],
      items: [],
      libraryItems: [],
      routineOwnerItemKeys: [],
      routineOwnerItemKeysByCatId: {},
      routineItems: [],
      selectedCat: null
    });
  }

  const [
    allAssignmentsResult,
    libraryItemsResult,
    routineKeysByCatIdResult,
    catalogProducts
  ] = await Promise.all([
    loadCatItemAssignments(clientResult.data, ownerResult.data),
    loadOwnerLibraryItems(clientResult.data, ownerResult.data),
    loadRoutineOwnerItemKeysByCatId(
      clientResult.data,
      ownerResult.data,
      cats.map((cat) => cat.id)
    ),
    loadActiveCatalogProducts()
  ]);

  if (!libraryItemsResult.ok) {
    return libraryItemsResult;
  }

  if (!allAssignmentsResult.ok) {
    return allAssignmentsResult;
  }

  if (!routineKeysByCatIdResult.ok) {
    return routineKeysByCatIdResult;
  }

  if (!catalogProducts.ok) {
    return catalogProducts;
  }

  const assignedItemsFallback =
    allAssignmentsResult.data === null
      ? await loadCatCareAssignedItems(
          clientResult.data,
          ownerResult.data,
          selectedCat.id
        )
      : null;

  if (assignedItemsFallback && !assignedItemsFallback.ok) {
    return assignedItemsFallback;
  }

  const assignedItems = assignedItemsFallback?.data ?? [];
  const selectedCatRoutineOwnerItemKeys =
    routineKeysByCatIdResult.data[selectedCat.id] ?? [];

  return serviceOk({
    cats,
    catalogProducts: catalogProducts.data,
    itemTags: allAssignmentsResult.data === null
      ? assignedItems
          .filter((item) => item.ownerItemId)
          .map((item) => ({
            catId: item.catId,
            defaultAmount: item.defaultAmount,
            defaultFrequency: item.defaultFrequency,
            id: item.id,
            instructions: item.instructions,
            ownerItemId: item.ownerItemId!,
            visibleToSitter: item.visibleToSitter
          }))
      : allAssignmentsResult.data.map(mapCatItemTag),
    items: [],
    libraryItems: libraryItemsResult.data.length === 0 && assignedItems.length > 0
      ? dedupeLibraryItems(assignedItems.map(mapAssignedItemToLibraryItem))
      : libraryItemsResult.data,
    routineItems: [],
    routineOwnerItemKeys: selectedCatRoutineOwnerItemKeys,
    routineOwnerItemKeysByCatId: routineKeysByCatIdResult.data,
    selectedCat
  });
}

export async function createCatCareItemFromFormData(
  formData: FormData
): Promise<ServiceResult<{ catId: string | null; item: CatCareLibraryItem }>> {
  const input = normalizeCareItemInput(formData);

  if (!input.ok) {
    return input;
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const libraryResult = await findOrCreateOwnerItem(
    clientResult.data,
    ownerResult.data,
    input.data
  );

  if (!libraryResult.ok) {
    return libraryResult;
  }

  clearOwnerLibraryItemCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

  return serviceOk({
    catId: input.data.currentCatId ?? null,
    item: libraryResult.data
  });
}

export async function unassignCatCareItemFromFormData(
  formData: FormData
): Promise<ServiceResult<{ catId: string; id: string }>> {
  const id = String(formData.get("id") ?? "").trim();
  const catId = String(formData.get("catId") ?? "").trim();

  if (!id || !catId) {
    return serviceError("validation_error", "Choose a valid item assignment.", {
      id: "required"
    });
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const assignmentResult = await clientResult.data
    .from("cat_item_assignments")
    .select(CAT_ITEM_ASSIGNMENT_SELECT)
    .eq("owner_id", ownerResult.data)
    .eq("cat_id", catId)
    .eq("id", id)
    .maybeSingle();

  if (assignmentResult.error) {
    return mapSupabaseError(assignmentResult.error);
  }

  if (assignmentResult.data) {
    const routineKeysResult = await loadRoutineOwnerItemKeys(
      clientResult.data,
      ownerResult.data,
      catId
    );

    if (!routineKeysResult.ok) {
      return routineKeysResult;
    }

    const libraryResult = await clientResult.data
      .from("owner_item_library")
      .select(OWNER_ITEM_SELECT)
      .eq("owner_id", ownerResult.data)
      .eq("id", assignmentResult.data.owner_item_id)
      .maybeSingle();

    if (libraryResult.error) {
      return mapSupabaseError(libraryResult.error);
    }

    if (
      libraryResult.data &&
      routineKeysResult.data.has(
        makeOwnerItemKey(libraryResult.data.item_type, libraryResult.data.display_name)
      )
    ) {
      return serviceError(
        "validation_error",
        "This item is still used by the current care routine.",
        { id: "routine_reference" }
      );
    }
  }

  const result = await clientResult.data
    .from("cat_item_assignments")
    .delete()
    .eq("owner_id", ownerResult.data)
    .eq("cat_id", catId)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  clearCatCareWorkspaceStatsCache(ownerResult.data);
  clearCatItemAssignmentCache(ownerResult.data);

  return serviceOk({ catId, id: result.data?.id ?? id });
}

export async function deleteCatCareLibraryItemFromFormData(
  formData: FormData
): Promise<ServiceResult<{ currentCatId: string | null; id: string }>> {
  const id = String(formData.get("id") ?? "").trim();
  const currentCatId = String(formData.get("currentCatId") ?? "").trim() || null;

  if (!id) {
    return serviceError("validation_error", "Choose a valid family item.", {
      id: "required"
    });
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const assignmentsResult = await clientResult.data
    .from("cat_item_assignments")
    .delete()
    .eq("owner_id", ownerResult.data)
    .eq("owner_item_id", id);

  if (assignmentsResult.error) {
    return mapSupabaseError(assignmentsResult.error);
  }

  const result = await clientResult.data
    .from("owner_item_library")
    .delete()
    .eq("owner_id", ownerResult.data)
    .eq("id", id)
    .select("id")
    .single();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  clearOwnerLibraryItemCache(ownerResult.data);
  clearCatItemAssignmentCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

  return serviceOk({ currentCatId, id: result.data.id });
}

export async function updateCatCareLibraryItemNotesFromFormData(
  formData: FormData
): Promise<ServiceResult<{ currentCatId: string | null; id: string; notes: string | null }>> {
  const id = String(formData.get("id") ?? "").trim();
  const currentCatId = String(formData.get("currentCatId") ?? "").trim() || null;
  const notes = normalizeOptionalText(formData.get("notes"));

  if (!id || (notes && notes.length > 2000)) {
    return serviceError("validation_error", "Check the family item notes.", {
      notes: "invalid"
    });
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const result = await clientResult.data
    .from("owner_item_library")
    .update({ notes })
    .eq("owner_id", ownerResult.data)
    .eq("id", id)
    .select("id, notes")
    .single();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  clearOwnerLibraryItemCache(ownerResult.data);

  return serviceOk({ currentCatId, id: result.data.id, notes: result.data.notes });
}

export async function getCatCareEventsWorkspace(
  catId?: string
): Promise<ServiceResult<CatCareEventsWorkspace>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const catsResult = await loadCatSummaries(clientResult.data, ownerResult.data);

  if (!catsResult.ok) {
    return catsResult;
  }

  const cats = catsResult.data;
  const selectedCat = cats.find((cat) => cat.id === catId) ?? cats[0] ?? null;

  if (!selectedCat) {
    return serviceOk({
      cats,
      events: [],
      libraryItems: [],
      selectedCat: null
    });
  }

  const [eventsResult, libraryItemsResult] = await Promise.all([
    loadCareEvents(clientResult.data, ownerResult.data),
    loadOwnerLibraryItems(clientResult.data, ownerResult.data)
  ]);

  if (!eventsResult.ok) {
    return eventsResult;
  }

  if (!libraryItemsResult.ok) {
    return libraryItemsResult;
  }

  return serviceOk({
    cats,
    events: eventsResult.data,
    libraryItems: libraryItemsResult.data,
    selectedCat
  });
}

export async function createCatCareEventFromFormData(
  formData: FormData
): Promise<ServiceResult<CatCareEvent>> {
  const input = normalizeCareEventInput(formData);

  if (!input.ok) {
    return input;
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const result = await clientResult.data
    .from("care_events")
    .insert({ ...input.data, owner_id: ownerResult.data })
    .select(CARE_EVENT_SELECT)
    .single();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  clearCatCareEventListCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

  return serviceOk(mapCareEvent(result.data));
}

export async function createCatCareCatFromFormData(
  formData: FormData
): Promise<ServiceResult<CatCareCat>> {
  const inputResult = normalizeCatInput({
    birthDate: formData.get("birthDate"),
    breed: formData.get("breed"),
    gender: formData.get("gender"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl"),
    weightKg: formData.get("weightKg"),
    safetyNotes: formData.get("safetyNotes"),
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

  const photoResult = await uploadCatPhotoIfPresent(
    clientResult.data,
    ownerResult.data,
    formData.get("photo")
  );

  if (!photoResult.ok) {
    return photoResult;
  }

  const { data, error } = await clientResult.data
    .from("cats")
    .insert({
      owner_id: ownerResult.data,
      birth_date: inputResult.data.birthDate,
      breed: inputResult.data.breed,
      gender: inputResult.data.gender,
      life_stage: inputResult.data.lifeStage,
      name: inputResult.data.name,
      photo_url: photoResult.data ?? inputResult.data.photoUrl,
      weight_kg: inputResult.data.weightKg,
      safety_notes: inputResult.data.safetyNotes,
      notes: inputResult.data.notes
    })
    .select(CAT_SELECT)
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  const cat = mapCat(data);
  clearCatListCache(ownerResult.data);
  clearCatSummaryCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);
  void trackCatCareProductEvent(ownerResult.data, "catcare_cat_created", {
    breed: cat.breed,
    has_photo: Boolean(cat.photoUrl),
    source: "owner_flow"
  });

  return serviceOk(cat);
}

export async function getCatCareCatDetail(
  catId: string
): Promise<ServiceResult<CatCareCat>> {
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
    .select(CAT_SELECT)
    .eq("owner_id", ownerResult.data)
    .eq("id", catId)
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk(mapCat(data));
}

export async function updateCatCareCatFromFormData(
  formData: FormData
): Promise<ServiceResult<CatCareCat>> {
  const inputResult = normalizeCatInput({
    birthDate: formData.get("birthDate"),
    breed: formData.get("breed"),
    gender: formData.get("gender"),
    name: formData.get("name"),
    photoUrl: formData.get("photoUrl"),
    weightKg: formData.get("weightKg"),
    safetyNotes: formData.get("safetyNotes"),
    notes: formData.get("notes")
  });
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return serviceError("validation_error", "Choose a valid cat profile.", {
      id: "required"
    });
  }

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

  const photoResult = await uploadCatPhotoIfPresent(
    clientResult.data,
    ownerResult.data,
    formData.get("photo")
  );

  if (!photoResult.ok) {
    return photoResult;
  }

  const update: Database["public"]["Tables"]["cats"]["Update"] = {
    birth_date: inputResult.data.birthDate,
    breed: inputResult.data.breed,
    gender: inputResult.data.gender,
    life_stage: inputResult.data.lifeStage,
    name: inputResult.data.name,
    safety_notes: inputResult.data.safetyNotes,
    notes: inputResult.data.notes,
    weight_kg: inputResult.data.weightKg
  };

  update.photo_url = photoResult.data ?? inputResult.data.photoUrl;

  const { data, error } = await clientResult.data
    .from("cats")
    .update(update)
    .eq("owner_id", ownerResult.data)
    .eq("id", id)
    .select(CAT_SELECT)
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  const cat = mapCat(data);
  clearCatListCache(ownerResult.data);
  clearCatSummaryCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);
  void trackCatCareProductEvent(ownerResult.data, "catcare_cat_updated", {
    breed: cat.breed,
    has_photo: Boolean(cat.photoUrl),
    source: "owner_flow"
  });

  return serviceOk(cat);
}

export async function deleteCatCareCatFromFormData(
  formData: FormData
): Promise<ServiceResult<{ id: string }>> {
  const id = String(formData.get("id") ?? "").trim();

  return deleteCatCareCatById(id);
}

export async function deleteCatCareCatById(
  id: string
): Promise<ServiceResult<{ id: string }>> {

  if (!id) {
    return serviceError("validation_error", "Choose a valid cat profile.", {
      id: "required"
    });
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
    .delete()
    .eq("owner_id", ownerResult.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return mapSupabaseError(error);
  }

  clearCatListCache(ownerResult.data);
  clearCatSummaryCache(ownerResult.data);
  clearCatItemAssignmentCache(ownerResult.data);
  clearCatCareEventListCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);
  clearRoutineSourceCatCache(ownerResult.data);
  void trackCatCareProductEvent(ownerResult.data, "catcare_cat_deleted", {
    source: "owner_flow"
  });

  return serviceOk({ id: data?.id ?? id });
}

export async function createCatCarePlanFromFormData(
  formData: FormData
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

  const catsResult = await clientResult.data
    .from("cats")
    .select(CAT_SELECT)
    .eq("owner_id", ownerResult.data)
    .in("id", inputResult.data.catIds);

  if (catsResult.error) {
    return mapSupabaseError(catsResult.error);
  }

  const selectedCats = inputResult.data.catIds
    .map((catId) => (catsResult.data ?? []).find((cat) => cat.id === catId))
    .filter((cat): cat is CatRow => Boolean(cat));

  if (selectedCats.length === 0) {
    return serviceError("validation_error", "Choose at least one cat.", {
      catIds: "required"
    });
  }

  const planTasksResult = await buildMultiCatPlanTasks(
    clientResult.data,
    ownerResult.data,
    selectedCats,
    inputResult.data.tasks
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
      "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
    );

  if (taskError) {
    await clientResult.data.from("care_plans").delete().eq("id", plan.id);
    return mapSupabaseError(taskError);
  }

  clearCatCarePlanSummaryCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

  return serviceOk({
    ...mapPlan(plan),
    tasks: (taskRows ?? []).map(mapTask),
    submissions: []
  });
}

export async function updateCatCarePlanTasksFromFormData(
  formData: FormData
): Promise<ServiceResult<{ handoffNotes: string | null; id: string; tasks: CatCareTask[] }>> {
  const planId = String(formData.get("planId") ?? "").trim();
  const handoffNotes = normalizeOptionalText(formData.get("handoffNotes"));
  const visitCount = normalizePlanVisitCount(formData.get("visitCount"));
  const taskIds = formData
    .getAll("taskId")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!planId || taskIds.length === 0) {
    return serviceError("validation_error", "Choose a care plan to update.");
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
    .select("id, status, ai_input_summary")
    .eq("owner_id", ownerResult.data)
    .eq("id", planId)
    .single();

  if (planResult.error) {
    return mapSupabaseError(planResult.error);
  }

  if (planResult.data.status !== "draft") {
    return serviceError("validation_error", "Only draft plans can be edited.");
  }

  if (handoffNotes && handoffNotes.length > 2000) {
    return serviceError("validation_error", "Handoff notes are too long.", {
      handoffNotes: "invalid"
    });
  }

  const existingResult = await clientResult.data
    .from("care_tasks")
    .select(
      "id, category, title, instructions, time_hint, frequency, sort_order, source, source_ref, required, enabled"
    )
    .eq("plan_id", planId)
    .in("id", taskIds);

  if (existingResult.error) {
    return mapSupabaseError(existingResult.error);
  }

  const existingTasks = new Map(
    (existingResult.data ?? []).map((task) => [task.id, task])
  );

  for (const taskId of taskIds) {
    if (!existingTasks.has(taskId)) {
      return serviceError("validation_error", "Task does not belong to this plan.");
    }
  }

  const nextTasks: CatCareTask[] = [];
  const taskUpdates = [];

  for (const taskId of taskIds) {
    const existingTask = existingTasks.get(taskId);
    const title = String(formData.get(`task.${taskId}.title`) ?? "").trim();
    const instructions = normalizeOptionalText(
      formData.get(`task.${taskId}.instructions`)
    );
    const timeHint = normalizeTaskTimeHint(formData, `task.${taskId}.timeHint`);

    if (!title || title.length > 160) {
      return serviceError("validation_error", "Task title is required.", {
        title: "invalid"
      });
    }

    const update = {
      category: existingTask?.category ?? "other",
      enabled: formData.get(`task.${taskId}.enabled`) === "on",
      frequency: existingTask?.frequency ?? null,
      id: taskId,
      instructions,
      plan_id: planId,
      required: formData.get(`task.${taskId}.required`) === "on",
      sort_order: existingTask?.sort_order ?? 0,
      source: existingTask?.source ?? "owner",
      source_ref: existingTask?.source_ref ?? null,
      time_hint: timeHint,
      title
    };

    if (
      update.enabled !== existingTask?.enabled ||
      update.instructions !== (existingTask?.instructions ?? null) ||
      update.required !== existingTask?.required ||
      update.time_hint !== (existingTask?.time_hint ?? null) ||
      update.title !== existingTask?.title
    ) {
      taskUpdates.push(update);
    }

    nextTasks.push({
      category: update.category,
      enabled: update.enabled,
      frequency: update.frequency,
      id: update.id,
      instructions: update.instructions,
      planId,
      required: update.required,
      sortOrder: update.sort_order,
      source: update.source,
      timeHint: update.time_hint,
      title: update.title
    });
  }

  if (taskUpdates.length > 0) {
    const updateResult = await clientResult.data
      .from("care_tasks")
      .upsert(taskUpdates, { onConflict: "id" });

    if (updateResult.error) {
      return mapSupabaseError(updateResult.error);
    }
  }

  const newTaskIds = formData
    .getAll("newTaskId")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const legacyNewTaskTitle = String(formData.get("newTask.title") ?? "").trim();
  const pendingNewTaskIds = newTaskIds.length > 0
    ? newTaskIds
    : legacyNewTaskTitle
      ? [""]
      : [];
  const tasksToInsert: CareTaskInsert[] = [];

  for (const [index, newTaskId] of pendingNewTaskIds.entries()) {
    const fieldPrefix = newTaskId ? `newTask.${newTaskId}` : "newTask";
    const newTaskTitle = String(formData.get(`${fieldPrefix}.title`) ?? "").trim();

    if (!newTaskTitle) {
      continue;
    }

    const scopedNewTaskTitle = withTaskScopeTitle(
      newTaskTitle,
      normalizeOptionalText(formData.get(`${fieldPrefix}.scope`))
    );

    if (scopedNewTaskTitle.length > 160) {
      return serviceError("validation_error", "Task title is required.", {
        title: "invalid"
      });
    }

    const relatedItem = normalizeOptionalText(formData.get(`${fieldPrefix}.relatedItem`));
    const newTaskInstructions = withRelatedItemInstruction(
      normalizeOptionalText(formData.get(`${fieldPrefix}.instructions`)),
      relatedItem
    );

    tasksToInsert.push({
      category: normalizeCareTaskCategory(formData.get(`${fieldPrefix}.category`)),
      enabled: formData.get(`${fieldPrefix}.enabled`) === "on",
      frequency: "daily",
      instructions: newTaskInstructions,
      plan_id: planId,
      required: formData.get(`${fieldPrefix}.required`) === "on",
      sort_order: existingTasks.size + index,
      source: "owner",
      source_ref: null,
      time_hint: normalizeTaskTimeHint(formData, `${fieldPrefix}.timeHint`) ?? "08:30",
      title: scopedNewTaskTitle
    });
  }

  if (tasksToInsert.length > 0) {
    const insertResult = await clientResult.data
      .from("care_tasks")
      .insert(tasksToInsert);

    if (insertResult.error) {
      return mapSupabaseError(insertResult.error);
    }
  }

  const planUpdateQuery = clientResult.data
    .from("care_plans")
    .update({
      ai_input_summary: withPlanVisitCount(
        planResult.data.ai_input_summary,
        visitCount
      ),
      handoff_notes: handoffNotes
    })
    .eq("owner_id", ownerResult.data)
    .eq("id", planId)
    .select("handoff_notes")
    .single();

  if (tasksToInsert.length === 0) {
    const planUpdateResult = await planUpdateQuery;

    if (planUpdateResult.error) {
      return mapSupabaseError(planUpdateResult.error);
    }

    clearCatCarePlanSummaryCache(ownerResult.data);
    clearCatCarePlanDetailCache(ownerResult.data, planId);

    return serviceOk({
      handoffNotes: planUpdateResult.data.handoff_notes,
      id: planId,
      tasks: nextTasks.sort((a, b) => a.sortOrder - b.sortOrder)
    });
  }

  const [tasksResult, planUpdateResult] = await Promise.all([
    clientResult.data
      .from("care_tasks")
      .select(
        "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
      )
      .eq("plan_id", planId)
      .order("sort_order", { ascending: true }),
    planUpdateQuery
  ]);

  if (tasksResult.error) {
    return mapSupabaseError(tasksResult.error);
  }

  if (planUpdateResult.error) {
    return mapSupabaseError(planUpdateResult.error);
  }

  clearCatCarePlanSummaryCache(ownerResult.data);
  clearCatCarePlanDetailCache(ownerResult.data, planId);

  return serviceOk({
    handoffNotes: planUpdateResult.data.handoff_notes,
    id: planId,
    tasks: (tasksResult.data ?? []).map(mapTask)
  });
}

async function buildMultiCatPlanTasks(
  client: AppSupabaseClient,
  ownerId: string,
  cats: CatRow[],
  fallbackTasks: CreatePlanInput["tasks"]
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

  for (const event of careEventsResult.data ?? []) {
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
    .eq("plan_id", planId)
    .eq("enabled", true);

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

  clearCatCarePlanSummaryCache(ownerResult.data);
  clearCatCarePlanDetailCache(ownerResult.data, planId);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

  return serviceOk({
    ...mapPlan(data),
    tasks: [],
    submissions: []
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

  clearCatCarePlanSummaryCache(ownerResult.data);
  clearCatCarePlanDetailCache(ownerResult.data, planId);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

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

  clearCatCarePlanSummaryCache(ownerResult.data);
  clearCatCarePlanDetailCache(ownerResult.data, planId);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

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
  const cachedPlan = readCatCarePlanDetailCache(
    ownerResult.data,
    planId,
    includeSubmissions
  );

  if (cachedPlan) {
    return serviceOk(cachedPlan);
  }

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
      "id, plan_id, category, title, instructions, time_hint, frequency, source, source_ref, sort_order, required, enabled, created_at, updated_at"
    )
    .eq("plan_id", planId)
    .order("sort_order", { ascending: true });
  const submissionsQuery =
    !includeSubmissions
      ? null
      : clientResult.data
          .from("care_submissions")
          .select(
            "id, owner_id, plan_id, task_id, submitted_by_label, status, note, abnormal, idempotency_key, created_at"
          )
          .eq("owner_id", ownerResult.data)
          .eq("plan_id", planId)
          .order("created_at", { ascending: false });
  const [tasksResult, submissionsResult] = await Promise.all([
    tasksQuery,
    submissionsQuery
  ]);

  if (tasksResult.error) {
    return mapSupabaseError(tasksResult.error);
  }

  if (submissionsResult?.error) {
    return mapSupabaseError(submissionsResult.error);
  }

  const plan = {
    ...mapPlan(planResult.data),
    submissions: (submissionsResult?.data ?? []).map(mapSubmission),
    tasks: (tasksResult.data ?? []).map(mapTask)
  };

  writeCatCarePlanDetailCache(
    ownerResult.data,
    planId,
    includeSubmissions,
    plan
  );

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

async function getAuthenticatedOwnerId(
  _supabase: AppSupabaseClient
): Promise<ServiceResult<string>> {
  return getCachedAuthenticatedOwnerId();
}

const getCachedAuthenticatedOwnerId = cache(async function getCachedAuthenticatedOwnerId(
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

function normalizeCatInput(input: {
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

function isAllowedCatPhotoUrl(value: string) {
  return (
    isCatIllustrationSrc(value) ||
    value.includes("/storage/v1/object/public/cat-photos/")
  );
}

async function uploadCatPhotoIfPresent(
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

function normalizePlanInput(input: {
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

function normalizePlanScenario(
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

function normalizePlanVisitCount(value: FormDataEntryValue | null) {
  const count = Number(String(value ?? "2").trim());

  return count === 1 || count === 3 ? count : 2;
}

function withRelatedItemInstruction(
  instructions: string | null,
  relatedItem: string | null
) {
  if (!relatedItem) {
    return instructions;
  }

  const line = `关联用品：${relatedItem}`;

  return instructions ? `${line}\n${instructions}` : line;
}

function withTaskScopeTitle(title: string, scope: string | null) {
  if (!scope || title.includes("：") || title.includes(":")) {
    return title;
  }

  return `${scope}：${title}`;
}

function withPlanVisitCount(
  summary: CatCarePlan["aiInputSummary"],
  visitCount: number
) {
  return summary && typeof summary === "object" && !Array.isArray(summary)
    ? { ...summary, visit_count: visitCount }
    : { visit_count: visitCount };
}

function getDefaultPlanTitle(
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

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeTaskTimeHint(formData: FormData, name: string) {
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

function normalizeCareTaskCategory(
  value: FormDataEntryValue | null
): CareTaskRow["category"] {
  const text = String(value ?? "").trim();

  return text === "medicine" || text === "observe" || text === "other"
    ? text
    : "medicine";
}

function normalizeDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function normalizeWeight(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const weight = Number(text);
  return Number.isFinite(weight) && weight > 0 && weight <= 30
    ? Math.round(weight * 10) / 10
    : null;
}

function normalizeRoutineInstructions(
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

function normalizeRoutineFrequency(
  value: FormDataEntryValue | null,
  fallback: string
) {
  const text = String(value ?? "").trim();

  if (isValidRoutineFrequency(text)) {
    return text;
  }

  return text === "weekly" ? "weekly_1" : fallback;
}

function isValidRoutineFrequency(value: string) {
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

function normalizeRoutineTimes(
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

function normalizeRoutineCustomCategory(
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

function normalizeCareItemInput(
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

function normalizeCareItemType(
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

async function loadCatCareAssignedItems(
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

async function loadLegacyCareItems(
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

async function getLegacyCareItemCount(
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

async function findOrCreateOwnerItem(
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

async function syncRoutineProductsToOwnerItems(
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

async function removeStaleRoutineAssignments(
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

async function loadRoutineOwnerItemKeys(
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

function readRoutineOwnerItemKeyCache(ownerId: string, catIds: string[]) {
  const key = makeRoutineOwnerItemKeyCacheKey(ownerId, catIds);
  const entry = routineOwnerItemKeyCache.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    routineOwnerItemKeyCache.delete(key);
    return null;
  }

  return entry.value;
}

function writeRoutineOwnerItemKeyCache(
  ownerId: string,
  catIds: string[],
  value: Record<string, string[]>
) {
  routineOwnerItemKeyCache.set(makeRoutineOwnerItemKeyCacheKey(ownerId, catIds), {
    expiresAt: Date.now() + routineOwnerItemKeyCacheTtlMs,
    value
  });
}

function clearRoutineOwnerItemKeyCache(ownerId: string) {
  for (const key of routineOwnerItemKeyCache.keys()) {
    if (key.startsWith(`${ownerId}:`)) {
      routineOwnerItemKeyCache.delete(key);
    }
  }
}

function makeRoutineOwnerItemKeyCacheKey(ownerId: string, catIds: string[]) {
  return `${ownerId}:${[...catIds].sort().join(",")}`;
}

async function loadRoutineOwnerItemKeysByCatId(
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

type RoutineOwnerItemReference = {
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
};

function getRoutineOwnerItemReference(item: {
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

function getRoutineOwnerItemInput(item: {
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

function makeOwnerItemKey(
  itemType: OwnerItemLibraryRow["item_type"],
  name: string
) {
  return `${itemType}:${name.trim().toLowerCase()}`;
}

function isRoutineManagedOwnerItemType(itemType: OwnerItemLibraryRow["item_type"]) {
  return (
    itemType === "dry_food" ||
    itemType === "wet_food" ||
    itemType === "treat" ||
    itemType === "supplement"
  );
}

function getCustomRoutineOwnerItemType(item: {
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

function parseRoutineProductInstructions(value: string | null) {
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

async function createLegacyCatCareItem(
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

function mapCareItemTypeToTaskCategory(
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

function isRoutineItemRelatedToSupplies(item: CatCareRoutineItem) {
  return (
    item.category === "meal" ||
    item.category === "treat" ||
    item.category === "medicine"
  );
}

function dedupeLibraryItems(items: CatCareLibraryItem[]) {
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

function normalizeCareEventInput(
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

function normalizeCareEventType(
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

function normalizeCareEventSeverity(
  value: FormDataEntryValue | null
): CareEventRow["severity"] {
  const text = String(value ?? "").trim();

  return text === "watch" || text === "urgent" ? text : "normal";
}

function groupByPlan<T extends { planId: string }>(items: T[]) {
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

function countByPlan(items: Array<{ plan_id: string }>) {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item.plan_id, (counts.get(item.plan_id) ?? 0) + 1);
  }

  return counts;
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

function mapCatSummary(row: Pick<CatRow, "id" | "name">): CatCareCatSummary {
  return {
    id: row.id,
    name: row.name
  };
}

function mapRoutine(row: CareRoutineRow): Omit<CatCareRoutine, "items"> {
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

function mapRoutineItem(row: CareRoutineItemRow): CatCareRoutineItem {
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

function mapCareItem(row: CareItemRow): CatCareItem {
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

function mapLibraryItem(row: OwnerItemLibraryRow): CatCareLibraryItem {
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

function mapCatalogProduct(row: ProductCatalogRow): CatCareCatalogProduct {
  return {
    brand: row.brand,
    displayName: row.display_name,
    id: row.id,
    itemType: row.item_type
  };
}

function mapCatItemAssignment(
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

function mapCatItemTag(row: CatItemAssignmentRow): CatCareItemTag {
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

function mapAssignedItemToLibraryItem(item: CatCareItem): CatCareLibraryItem {
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

function mapCareEvent(row: CareEventRow): CatCareEvent {
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

async function trackCatCareProductEvent(
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

function sanitizeCatCareAnalyticsProperties(
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

function mapPlan(row: CarePlanRow): Omit<CatCarePlan, "tasks" | "submissions"> {
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

function mapTask(row: CareTaskRow): CatCareTask {
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

function isMissingCatCareLibraryTable(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    Boolean(
      error.message?.includes("catcare_product_catalog") ||
        error.message?.includes("owner_item_library") ||
        error.message?.includes("cat_item_assignments")
    )
  );
}
