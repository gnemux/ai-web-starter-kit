"use server";

import { revalidatePath } from "next/cache";

import {
  submitAnonymousCareSubmissionFromFormData,
  uploadAnonymousCareEvidence
} from "@/lib/catcare/product-service";

export async function submitAnonymousCareTaskAction(formData: FormData) {
  const result = await submitAnonymousCareSubmissionFromFormData(formData);
  const token = String(formData.get("token") ?? "").trim();

  if (!result.ok) {
    return result;
  }

  let attachmentCount = result.data.attachmentCount;
  let mediaUploadError: string | null = null;
  const uploadedPhotoIndexes: number[] = [];
  const photos = formData.getAll("photos");

  for (const [index, file] of photos.entries()) {
    const uploadResult = await uploadAnonymousCareEvidence({
      file,
      secret: token,
      submissionId: result.data.submissionId
    });

    if (!uploadResult.ok) {
      mediaUploadError = uploadResult.error.message;
      continue;
    }

    uploadedPhotoIndexes.push(index);
    attachmentCount = uploadResult.data.attachmentCount;
  }

  if (token) {
    revalidatePath(`/s/${token}`);
  }

  return {
    ...result,
    data: {
      ...result.data,
      attachmentCount: Math.min(attachmentCount, 3),
      mediaUploadError,
      uploadedPhotoIndexes
    }
  };
}
