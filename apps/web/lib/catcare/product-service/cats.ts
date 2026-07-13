import "server-only";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient } from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import { assertCatCarePlanCatCreation } from "../plan-limits";
import { getCurrentBillingPlanId } from "../../services/billing";

import {
  CAT_SELECT,
  CatCareCat,
  clearCatCareEventListCache,
  clearCatCareWorkspaceStatsCache,
  clearCatItemAssignmentCache,
  clearCatListCache,
  clearCatSummaryCache,
  clearRoutineSourceCatCache,
  getAuthenticatedOwnerId,
  mapCat,
  mapSupabaseError,
  normalizeCatInput,
  trackCatCareProductEvent,
  uploadCatPhotoIfPresent
} from "./core";

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

  const planResult = await getCurrentBillingPlanId();

  if (!planResult.ok) {
    return planResult;
  }

  const countResult = await clientResult.data
    .from("cats")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerResult.data);

  if (countResult.error) {
    return mapSupabaseError(countResult.error);
  }

  const catLimitResult = assertCatCarePlanCatCreation({
    currentCatCount: countResult.count ?? 0,
    planId: planResult.data
  });

  if (!catLimitResult.ok) {
    return catLimitResult;
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
  await trackCatCareProductEvent(ownerResult.data, "catcare_cat_created", {
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
  await trackCatCareProductEvent(ownerResult.data, "catcare_cat_updated", {
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
  await trackCatCareProductEvent(ownerResult.data, "catcare_cat_deleted", {
    source: "owner_flow"
  });

  return serviceOk({ id: data?.id ?? id });
}
