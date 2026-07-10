import "server-only";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient } from "../../supabase/server";
import { assertCatCarePlanItemCreation, getCatCarePlanLimits } from "../plan-limits";
import { getCurrentBillingPlanId } from "../../services/billing";

import {
  CAT_ITEM_ASSIGNMENT_SELECT,
  CatCareItemsWorkspace,
  CatCareLibraryItem,
  OWNER_ITEM_SELECT,
  clearCatCareWorkspaceStatsCache,
  clearCatItemAssignmentCache,
  clearOwnerLibraryItemCache,
  dedupeLibraryItems,
  findOrCreateOwnerItem,
  getAuthenticatedOwnerId,
  loadActiveCatalogProducts,
  loadCatCareAssignedItems,
  loadCatItemAssignments,
  loadCatSummaries,
  loadOwnerLibraryItems,
  loadRoutineOwnerItemKeys,
  loadRoutineOwnerItemKeysByCatId,
  makeOwnerItemKey,
  mapAssignedItemToLibraryItem,
  mapCatItemTag,
  mapLibraryItem,
  mapSupabaseError,
  normalizeCareItemInput,
  normalizeOptionalText
} from "./core";

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

  const planResult = await getCurrentBillingPlanId();

  if (!planResult.ok) {
    return planResult;
  }

  const maxItems = getCatCarePlanLimits(planResult.data).maxItems;
  const libraryResult = await findOrCreateOwnerItem(
    clientResult.data,
    ownerResult.data,
    input.data,
    maxItems === null
      ? undefined
      : {
          beforeInsert: (currentItemCount) =>
            assertCatCarePlanItemCreation({
              currentItemCount,
              planId: planResult.data
            })
        }
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

export async function updateCatCareLibraryItemFromFormData(
  formData: FormData
): Promise<
  ServiceResult<{ currentCatId: string | null; item: CatCareLibraryItem }>
> {
  const id = String(formData.get("id") ?? "").trim();
  const currentCatId = String(formData.get("currentCatId") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const brand = normalizeOptionalText(formData.get("brand"));
  const notes = normalizeOptionalText(formData.get("notes"));

  if (!id || name.length < 1 || name.length > 120 || (notes && notes.length > 2000)) {
    const fields: Record<string, string> = {};

    if (!id) {
      fields.id = "required";
    }

    if (name.length < 1) {
      fields.name = "required";
    } else if (name.length > 120) {
      fields.name = "invalid";
    }

    if (notes && notes.length > 2000) {
      fields.notes = "invalid";
    }

    return serviceError("validation_error", "Check the family item details.", fields);
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
    .update({ brand, display_name: name, notes })
    .eq("owner_id", ownerResult.data)
    .eq("id", id)
    .select(OWNER_ITEM_SELECT)
    .single();

  if (result.error) {
    return mapSupabaseError(result.error);
  }

  clearOwnerLibraryItemCache(ownerResult.data);
  clearCatCareWorkspaceStatsCache(ownerResult.data);

  return serviceOk({ currentCatId, item: mapLibraryItem(result.data) });
}
