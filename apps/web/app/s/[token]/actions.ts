"use server";

import { revalidatePath } from "next/cache";

import { submitAnonymousCareSubmissionFromFormData } from "@/lib/catcare/product-service";

export async function submitAnonymousCareTaskAction(formData: FormData) {
  const result = await submitAnonymousCareSubmissionFromFormData(formData);
  const token = String(formData.get("token") ?? "").trim();

  if (token) {
    revalidatePath(`/s/${token}`);
  }

  return result;
}
