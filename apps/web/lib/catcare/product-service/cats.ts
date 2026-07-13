import "server-only";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import { createSupabaseServerClient } from "../../supabase/server";
import type { Database } from "../../supabase/database.types";
import { assertCatCarePlanCatCreation } from "../plan-limits";
import { getCurrentBillingPlanId } from "../../services/billing";

import {
  CAT_SELECT,
  CatCareCat,
  getAuthenticatedOwnerId,
  getCatPhotoProxyUrl,
  getCatPhotoStoragePath,
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
    .eq("owner_id", ownerResult.data)
    .is("deleted_at", null);

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
    .is("deleted_at", null)
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

  if (
    inputResult.data.photoUrl?.startsWith("/api/catcare/cat-photos/") &&
    inputResult.data.photoUrl !== getCatPhotoProxyUrl(id)
  ) {
    return serviceError("validation_error", "Choose a valid cat photo.", {
      photoUrl: "invalid"
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

  if (photoResult.data) {
    update.photo_url = photoResult.data;
  } else if (inputResult.data.photoUrl !== getCatPhotoProxyUrl(id)) {
    update.photo_url = inputResult.data.photoUrl;
  }

  const { data, error } = await clientResult.data
    .from("cats")
    .update(update)
    .eq("owner_id", ownerResult.data)
    .eq("id", id)
    .is("deleted_at", null)
    .select(CAT_SELECT)
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  const cat = mapCat(data);
  await trackCatCareProductEvent(ownerResult.data, "catcare_cat_updated", {
    breed: cat.breed,
    has_photo: Boolean(cat.photoUrl),
    source: "owner_flow"
  });

  return serviceOk(cat);
}

export async function getCatCareCatPhotoById(
  id: string
): Promise<ServiceResult<{ body: ArrayBuffer; contentType: string }>> {
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
    .select("photo_url")
    .eq("owner_id", ownerResult.data)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (catResult.error) {
    return mapSupabaseError(catResult.error);
  }

  const path = getCatPhotoStoragePath(
    catResult.data?.photo_url ?? null,
    ownerResult.data
  );

  if (!path) {
    return serviceError("not_found", "Cat photo not found.");
  }

  const downloadResult = await clientResult.data.storage
    .from("cat-photos")
    .download(path);

  if (downloadResult.error) {
    return serviceError("not_found", "Cat photo not found.");
  }

  return serviceOk({
    body: await downloadResult.data.arrayBuffer(),
    contentType: downloadResult.data.type || "application/octet-stream"
  });
}

export async function deleteCatCareCatFromFormData(
  formData: FormData
): Promise<ServiceResult<{ deletedAt: string | null; id: string }>> {
  const id = String(formData.get("id") ?? "").trim();

  return deleteCatCareCatById(id);
}

export async function deleteCatCareCatById(
  id: string
): Promise<ServiceResult<{ deletedAt: string | null; id: string }>> {

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

  const { data, error } = await clientResult.data.rpc(
    "soft_delete_cat_profile",
    { target_cat_id: id }
  );

  if (error) {
    return mapSupabaseError(error);
  }

  const outcome = data?.[0];

  if (!outcome || outcome.outcome === "not_found") {
    return serviceError("not_found", "Cat profile not found.");
  }

  if (outcome.outcome === "active_plan_conflict") {
    return serviceError(
      "validation_error",
      "请先处理包含这只猫咪的进行中照护计划，再删除档案。",
      {
        planId: outcome.blocking_plan_id ?? "unknown",
        reason: outcome.blocking_reason ?? "active_plan"
      }
    );
  }

  if (outcome.outcome !== "soft_deleted" && outcome.outcome !== "already_deleted") {
    return serviceError("system_error", "Cat profile could not be deleted.");
  }

  if (outcome.outcome === "soft_deleted") {
    await trackCatCareProductEvent(ownerResult.data, "catcare_cat_deleted", {
      deletion_mode: "soft",
      source: "owner_flow"
    });
  }

  return serviceOk({ deletedAt: outcome.deleted_at, id });
}
