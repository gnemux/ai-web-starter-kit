"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { closeCatCarePlan } from "@/lib/catcare/product-service";
import { copyCatCareRoutineFromFormData } from "@/lib/catcare/product-service";
import { createCarePlanShareLink } from "@/lib/catcare/product-service";
import { createCatCareCatFromFormData } from "@/lib/catcare/product-service";
import { createCatCareEventFromFormData } from "@/lib/catcare/product-service";
import { createCatCareItemFromFormData } from "@/lib/catcare/product-service";
import { createCatCarePlanFromFormData } from "@/lib/catcare/product-service";
import { deleteCatCareCatFromFormData } from "@/lib/catcare/product-service";
import { deleteCatCareLibraryItemFromFormData } from "@/lib/catcare/product-service";
import { deleteCatCarePlan } from "@/lib/catcare/product-service";
import { publishCatCarePlan } from "@/lib/catcare/product-service";
import { revokeCarePlanShareLink } from "@/lib/catcare/product-service";
import { saveCatCareRoutineFromFormData } from "@/lib/catcare/product-service";
import { unassignCatCareItemFromFormData } from "@/lib/catcare/product-service";
import { updateCatCareCatFromFormData } from "@/lib/catcare/product-service";
import { updateCatCarePlanTasksFromFormData } from "@/lib/catcare/product-service";
import { updateCatCareLibraryItemNotesFromFormData } from "@/lib/catcare/product-service";

export async function createCatCareCatAction(formData: FormData) {
  const result = await createCatCareCatFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");

  const intent = String(formData.get("intent") ?? "draft");
  redirect(
    intent === "routine"
      ? `/catcare/routines?cat_id=${result.data.id}`
      : `/catcare/cats/${result.data.id}?saved=created`
  );
}

export async function updateCatCareCatAction(formData: FormData) {
  const result = await updateCatCareCatFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");
  revalidatePath(`/catcare/cats/${result.data.id}`);
  revalidatePath(`/catcare/cats/${result.data.id}/edit`);

  const intent = String(formData.get("intent") ?? "view");
  redirect(
    intent === "routine"
      ? `/catcare/routines?cat_id=${result.data.id}`
      : `/catcare/cats/${result.data.id}?saved=updated`
  );
}

export async function deleteCatCareCatAction(formData: FormData) {
  const result = await deleteCatCareCatFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/cats");
  revalidatePath(`/catcare/cats/${result.data.id}`);

  redirect("/catcare/cats?saved=deleted");
}

export async function saveCatCareRoutineAction(formData: FormData) {
  const result = await saveCatCareRoutineFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/routines");

  const intent = String(formData.get("intent") ?? "stay");

  redirect(
    intent === "items"
      ? `/catcare/items?cat_id=${result.data.catId}`
      : `/catcare/routines?cat_id=${result.data.catId}&saved=1`
  );
}

export async function saveCatCareRoutineLocalAction(formData: FormData) {
  return saveCatCareRoutineFromFormData(formData);
}

export async function copyCatCareRoutineAction(formData: FormData) {
  const result = await copyCatCareRoutineFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/routines");
  revalidatePath("/catcare/items");

  redirect(`/catcare/routines?cat_id=${result.data.catId}&copied=1`);
}

export async function createCatCareItemAction(formData: FormData) {
  const result = await createCatCareItemFromFormData(formData);
  const currentCatId = String(formData.get("currentCatId") ?? "").trim();
  const itemType = encodeURIComponent(
    String(formData.get("itemType") ?? "dry_food").trim() || "dry_food"
  );

  if (!result.ok) {
    redirect(
      currentCatId
        ? `/catcare/items?cat_id=${currentCatId}&error=save_failed&item_type=${itemType}`
        : `/catcare/items?error=save_failed&item_type=${itemType}`
    );
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(
    result.data.catId
      ? `/catcare/items?cat_id=${result.data.catId}&saved=1&item_type=${itemType}`
      : `/catcare/items?saved=1&item_type=${itemType}`
  );
}

export async function createCatCareItemLocalAction(formData: FormData) {
  return createCatCareItemFromFormData(formData);
}

export async function unassignCatCareItemAction(formData: FormData) {
  const result = await unassignCatCareItemFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(`/catcare/items?cat_id=${result.data.catId}&saved=1`);
}

export async function unassignCatCareItemLocalAction(formData: FormData) {
  return unassignCatCareItemFromFormData(formData);
}

export async function deleteCatCareLibraryItemAction(formData: FormData) {
  const result = await deleteCatCareLibraryItemFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(
    result.data.currentCatId
      ? `/catcare/items?cat_id=${result.data.currentCatId}&saved=1`
      : "/catcare/items?saved=1"
  );
}

export async function deleteCatCareLibraryItemLocalAction(formData: FormData) {
  return deleteCatCareLibraryItemFromFormData(formData);
}

export async function updateCatCareLibraryItemNotesAction(formData: FormData) {
  const result = await updateCatCareLibraryItemNotesFromFormData(formData);
  const currentCatId = String(formData.get("currentCatId") ?? "").trim();

  if (!result.ok) {
    redirect(
      currentCatId
        ? `/catcare/items?cat_id=${currentCatId}&error=save_failed`
        : "/catcare/items?error=save_failed"
    );
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/items");
  redirect(
    result.data.currentCatId
      ? `/catcare/items?cat_id=${result.data.currentCatId}&saved=1`
      : "/catcare/items?saved=1"
  );
}

export async function updateCatCareLibraryItemNotesLocalAction(
  formData: FormData
) {
  return updateCatCareLibraryItemNotesFromFormData(formData);
}

export async function createCatCareEventAction(formData: FormData) {
  const result = await createCatCareEventFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/events");
  redirect(`/catcare/events?cat_id=${result.data.catId}&saved=1`);
}

export async function createCatCareEventLocalAction(formData: FormData) {
  return createCatCareEventFromFormData(formData);
}

export async function createCatCarePlanAction(formData: FormData) {
  const result = await createCatCarePlanFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/plans");
  redirect(`/catcare/plans/${result.data.id}`);
}

export async function publishCatCarePlanAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await publishCatCarePlan(planId);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/plans");
  revalidatePath(`/catcare/plans/${result.data.id}`);
  redirect(`/catcare/plans/${result.data.id}?published=1`);
}

export async function publishCatCarePlanLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();

  return publishCatCarePlan(planId);
}

export async function updateCatCarePlanTasksAction(formData: FormData) {
  const result = await updateCatCarePlanTasksFromFormData(formData);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare/plans");
  revalidatePath(`/catcare/plans/${result.data.id}`);
  redirect(`/catcare/plans/${result.data.id}?saved=1`);
}

export async function updateCatCarePlanTasksLocalAction(formData: FormData) {
  return updateCatCarePlanTasksFromFormData(formData);
}

export async function closeCatCarePlanAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await closeCatCarePlan(planId);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  revalidatePath("/catcare");
  revalidatePath("/catcare/plans");
  revalidatePath(`/catcare/plans/${result.data.id}`);
  redirect(`/catcare/plans/${result.data.id}?closed=1`);
}

export async function closeCatCarePlanLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();

  return closeCatCarePlan(planId);
}

export async function deleteCatCarePlanLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();

  return deleteCatCarePlan(planId);
}

export async function createCarePlanShareLinkLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await createCarePlanShareLink(planId);

  revalidatePath(`/catcare/plans/${planId}`);

  return result;
}

export async function revokeCarePlanShareLinkLocalAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  const result = await revokeCarePlanShareLink(planId);

  revalidatePath(`/catcare/plans/${planId}`);

  return result;
}
