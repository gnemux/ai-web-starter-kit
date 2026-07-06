import "server-only";

import { serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient } from "../../supabase/server";

import {
  CARE_EVENT_SELECT,
  CatCareEvent,
  CatCareEventsWorkspace,
  clearCatCareEventListCache,
  clearCatCareWorkspaceStatsCache,
  getAuthenticatedOwnerId,
  loadCareEvents,
  loadCatSummaries,
  loadOwnerLibraryItems,
  mapCareEvent,
  mapSupabaseError,
  normalizeCareEventInput
} from "./core";

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

