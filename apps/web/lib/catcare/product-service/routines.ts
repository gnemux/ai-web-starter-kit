import "server-only";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient } from "../../supabase/server";

import {
  CatCareRoutine,
  CatCareRoutineWorkspacePreload,
  CatCareRoutineWorkspace,
  ROUTINE_ITEM_SELECT,
  ROUTINE_SELECT,
  clearCatCareWorkspaceStatsCache,
  clearCatItemAssignmentCache,
  clearDefaultRoutineCache,
  clearOwnerLibraryItemCache,
  clearRoutineOwnerItemKeyCache,
  clearRoutineSourceCatCache,
  dedupeLibraryItems,
  getAuthenticatedOwnerId,
  loadCatCareAssignedItems,
  loadCatSummaries,
  loadDefaultRoutine,
  loadOwnerLibraryItems,
  loadRoutineSourceCatIds,
  mapAssignedItemToLibraryItem,
  mapRoutine,
  mapRoutineItem,
  mapSupabaseError,
  normalizeOptionalText,
  normalizeRoutineCustomCategory,
  normalizeRoutineFrequency,
  normalizeRoutineInstructions,
  normalizeRoutineTimes,
  routineItemDefinitions,
  syncRoutineProductsToOwnerItems,
  trackCatCareProductEvent
} from "./core";

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

export async function getCatCareRoutineWorkspacePreload(
  catId?: string
): Promise<ServiceResult<CatCareRoutineWorkspacePreload>> {
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
      itemsByCatId: {},
      libraryItems: [],
      routine: null,
      routineByCatId: {},
      routineSourceCats: [],
      routineSourceCatsByCatId: {},
      selectedCat: null
    });
  }

  const [routineResults, careItemResults, libraryItemsResult, sourceCatIdsResult] = await Promise.all([
    Promise.all(cats.map((cat) => loadDefaultRoutine(clientResult.data, ownerResult.data, cat.id))),
    Promise.all(
      cats.map((cat) =>
        loadCatCareAssignedItems(clientResult.data, ownerResult.data, cat.id, {
          limit: 8
        })
      )
    ),
    loadOwnerLibraryItems(clientResult.data, ownerResult.data),
    loadRoutineSourceCatIds(clientResult.data, ownerResult.data)
  ]);

  for (const result of routineResults) {
    if (!result.ok) {
      return result;
    }
  }

  for (const result of careItemResults) {
    if (!result.ok) {
      return result;
    }
  }

  if (!libraryItemsResult.ok) {
    return libraryItemsResult;
  }

  if (!sourceCatIdsResult.ok) {
    return sourceCatIdsResult;
  }

  const routines = routineResults.map((result) => (result.ok ? result.data : null));
  const careItems = careItemResults.map((result) => (result.ok ? result.data : []));
  const routineByCatId = Object.fromEntries(
    cats.map((cat, index) => [cat.id, routines[index] ?? null])
  );
  const itemsByCatId = Object.fromEntries(
    cats.map((cat, index) => [cat.id, careItems[index] ?? []])
  );
  const selectedItems = itemsByCatId[selectedCat.id] ?? [];
  const allAssignedItems = Object.values(itemsByCatId).flat();
  const libraryItems = libraryItemsResult.data.length > 0
    ? libraryItemsResult.data
    : dedupeLibraryItems(allAssignedItems.map(mapAssignedItemToLibraryItem));
  const routineCatIds = new Set(sourceCatIdsResult.data);
  const routineSourceCatsByCatId = Object.fromEntries(
    cats.map((targetCat) => [
      targetCat.id,
      cats
        .filter((cat) => cat.id !== targetCat.id && routineCatIds.has(cat.id))
        .map((cat) => ({ id: cat.id, name: cat.name }))
    ])
  );

  return serviceOk({
    cats,
    items: selectedItems,
    itemsByCatId,
    libraryItems,
    routine: routineByCatId[selectedCat.id] ?? null,
    routineByCatId,
    routineSourceCats: routineSourceCatsByCatId[selectedCat.id] ?? [],
    routineSourceCatsByCatId,
    selectedCat
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
