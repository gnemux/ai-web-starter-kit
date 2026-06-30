"use server";

import { revalidatePath } from "next/cache";

import type { ServiceResult } from "@xwlc/core";

import {
  createReferenceCarePlanFromFormData,
  createReferenceCatFromFormData,
  publishReferenceCarePlan,
  type ReferenceCarePlan,
  type ReferenceCat
} from "@/lib/reference-product/product-service";

export type ReferenceCatActionState = ServiceResult<ReferenceCat> | null;
export type ReferencePlanActionState = ServiceResult<ReferenceCarePlan> | null;

export async function createReferenceCatAction(
  _previousState: ReferenceCatActionState,
  formData: FormData
): Promise<ReferenceCatActionState> {
  const result = await createReferenceCatFromFormData(formData);

  if (result.ok) {
    revalidatePath("/reference-product");
  }

  return result;
}

export async function createReferencePlanAction(
  _previousState: ReferencePlanActionState,
  formData: FormData
): Promise<ReferencePlanActionState> {
  const result = await createReferenceCarePlanFromFormData(formData);

  if (result.ok) {
    revalidatePath("/reference-product");
  }

  return result;
}

export async function publishReferencePlanAction(
  formData: FormData
): Promise<void> {
  const planId = String(formData.get("planId") ?? "");

  if (planId) {
    await publishReferenceCarePlan(planId);
    revalidatePath("/reference-product");
  }
}
