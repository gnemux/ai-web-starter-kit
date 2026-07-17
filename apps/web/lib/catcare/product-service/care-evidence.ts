import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";

import {
  careEvidenceInputMaxBytes,
  careEvidenceMaxCount,
  normalizePrivateImage,
  validatePrivateImageFile
} from "../../media/private-image";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "../../supabase/server";
import { getAuthenticatedOwnerId, mapSupabaseError } from "./core";
import { resolveCarePlanShareToken } from "./share-tokens";

const careEvidenceBucket = "care-evidence";

export type CatCareEvidenceAttachment = {
  byteSize: number;
  contentType: "image/webp";
  createdAt: string;
  downloadUrl: string;
  height: number;
  id: string;
  previewUrl: string;
  width: number;
};

export async function uploadAnonymousCareEvidence(input: {
  file: FormDataEntryValue | null;
  secret: string;
  submissionId: string;
}): Promise<ServiceResult<{ alreadyUploaded: boolean; attachment: CatCareEvidenceAttachment }>> {
  const fileResult = validatePrivateImageFile(input.file, careEvidenceInputMaxBytes);

  if (!fileResult.ok) {
    return fileResult;
  }

  if (!isUuid(input.submissionId)) {
    return serviceError("validation_error", "提交记录无效。", {
      submissionId: "invalid"
    });
  }

  const tokenResult = await resolveCarePlanShareToken(
    input.secret,
    new Date(),
    randomUUID()
  );

  if (!tokenResult.ok) {
    return tokenResult;
  }

  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const [planResult, submissionResult] = await Promise.all([
    adminResult.data
      .from("care_plans")
      .select("id, status")
      .eq("id", tokenResult.data.resourceId)
      .eq("owner_id", tokenResult.data.ownerId)
      .single(),
    adminResult.data
      .from("care_submissions")
      .select("id, task_id")
      .eq("id", input.submissionId)
      .eq("plan_id", tokenResult.data.resourceId)
      .eq("owner_id", tokenResult.data.ownerId)
      .single()
  ]);

  if (planResult.error || submissionResult.error) {
    return serviceError("forbidden", "这条照护记录不允许上传照片。");
  }

  if (planResult.data.status !== "published") {
    return serviceError("forbidden", "这个照护计划当前不可上传照片。");
  }

  const normalizedResult = await normalizePrivateImage(fileResult.data, {
    maxDimension: 1600
  });

  if (!normalizedResult.ok) {
    return normalizedResult;
  }

  const contentSha256 = createHash("sha256")
    .update(normalizedResult.data.body)
    .digest("hex");
  const loadExisting = () => adminResult.data
    .from("care_submission_attachments")
    .select("id, byte_size, content_type, width, height, created_at, position, content_sha256")
    .eq("submission_id", input.submissionId)
    .order("position", { ascending: true });
  const existingResult = await loadExisting();

  if (existingResult.error) {
    return mapSupabaseError(existingResult.error);
  }

  const duplicate = (existingResult.data ?? []).find(
    (item) => item.content_sha256 === contentSha256
  );

  if (duplicate) {
    return serviceOk({
      alreadyUploaded: true,
      attachment: mapEvidenceAttachment(duplicate)
    });
  }

  if ((existingResult.data?.length ?? 0) >= careEvidenceMaxCount) {
    return serviceError("validation_error", "每项照护结果最多上传 3 张照片。", {
      photo: "limit_reached"
    });
  }

  const attachmentId = randomUUID();
  const objectPath = `${tokenResult.data.ownerId}/${tokenResult.data.resourceId}/${input.submissionId}/${attachmentId}.webp`;
  const storageResult = await adminResult.data.storage
    .from(careEvidenceBucket)
    .upload(objectPath, normalizedResult.data.body, {
      cacheControl: "31536000",
      contentType: normalizedResult.data.contentType,
      upsert: false
    });

  if (storageResult.error) {
    return serviceError("system_error", "照片上传失败，请稍后重试。");
  }

  const cleanupUploadedObject = async () => {
    const cleanupResult = await adminResult.data.storage
      .from(careEvidenceBucket)
      .remove([objectPath]);

    if (cleanupResult.error) {
      console.error("Care evidence orphan cleanup failed", { attachmentId });
      return false;
    }

    return true;
  };
  let currentAttachments = existingResult.data ?? [];

  for (let attempt = 0; attempt < careEvidenceMaxCount; attempt += 1) {
    const concurrentDuplicate = currentAttachments.find(
      (item) => item.content_sha256 === contentSha256
    );

    if (concurrentDuplicate) {
      if (!(await cleanupUploadedObject())) {
        return serviceError("system_error", "照片上传未能安全收口，请稍后重试。");
      }

      return serviceOk({
        alreadyUploaded: true,
        attachment: mapEvidenceAttachment(concurrentDuplicate)
      });
    }

    const usedPositions = new Set(currentAttachments.map((item) => item.position));
    const position = [0, 1, 2].find((item) => !usedPositions.has(item));

    if (position === undefined) {
      if (!(await cleanupUploadedObject())) {
        return serviceError("system_error", "照片上传未能安全收口，请稍后重试。");
      }

      return serviceError("validation_error", "每项照护结果最多上传 3 张照片。", {
        photo: "limit_reached"
      });
    }

    const insertResult = await adminResult.data
      .from("care_submission_attachments")
      .insert({
        byte_size: normalizedResult.data.byteSize,
        content_sha256: contentSha256,
        content_type: normalizedResult.data.contentType,
        height: normalizedResult.data.height,
        id: attachmentId,
        object_path: objectPath,
        owner_id: tokenResult.data.ownerId,
        plan_id: tokenResult.data.resourceId,
        position,
        submission_id: input.submissionId,
        task_id: submissionResult.data.task_id,
        width: normalizedResult.data.width
      })
      .select("id, byte_size, content_type, width, height, created_at, position, content_sha256")
      .single();

    if (!insertResult.error) {
      return serviceOk({
        alreadyUploaded: false,
        attachment: mapEvidenceAttachment(insertResult.data)
      });
    }

    if (insertResult.error.code !== "23505") {
      if (!(await cleanupUploadedObject())) {
        return serviceError("system_error", "照片上传未能安全收口，请稍后重试。");
      }

      return mapSupabaseError(insertResult.error);
    }

    const refreshedResult = await loadExisting();

    if (refreshedResult.error) {
      if (!(await cleanupUploadedObject())) {
        return serviceError("system_error", "照片上传未能安全收口，请稍后重试。");
      }

      return mapSupabaseError(refreshedResult.error);
    }

    currentAttachments = refreshedResult.data ?? [];
  }

  if (!(await cleanupUploadedObject())) {
    return serviceError("system_error", "照片上传未能安全收口，请稍后重试。");
  }

  return serviceError("system_error", "照片上传冲突，请稍后重试。");
}

export async function getCatCareEvidenceAttachmentById(
  attachmentId: string
): Promise<ServiceResult<{ body: ArrayBuffer; contentType: string; downloadName: string }>> {
  if (!isUuid(attachmentId)) {
    return serviceError("not_found", "Care evidence not found.");
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerResult = await getAuthenticatedOwnerId(clientResult.data);

  if (!ownerResult.ok) {
    return ownerResult;
  }

  const metadataResult = await clientResult.data
    .from("care_submission_attachments")
    .select("id, object_path, content_type")
    .eq("id", attachmentId)
    .eq("owner_id", ownerResult.data)
    .maybeSingle();

  if (metadataResult.error) {
    return mapSupabaseError(metadataResult.error);
  }

  if (!metadataResult.data) {
    return serviceError("not_found", "Care evidence not found.");
  }

  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const downloadResult = await adminResult.data.storage
    .from(careEvidenceBucket)
    .download(metadataResult.data.object_path);

  if (downloadResult.error) {
    return serviceError("not_found", "Care evidence not found.");
  }

  return serviceOk({
    body: await downloadResult.data.arrayBuffer(),
    contentType: metadataResult.data.content_type,
    downloadName: `catcare-care-evidence-${attachmentId}.webp`
  });
}

export function mapEvidenceAttachment(row: {
  byte_size: number;
  content_type: "image/webp";
  created_at: string;
  height: number;
  id: string;
  width: number;
}): CatCareEvidenceAttachment {
  const previewUrl = `/api/catcare/care-evidence/${row.id}`;

  return {
    byteSize: row.byte_size,
    contentType: row.content_type,
    createdAt: row.created_at,
    downloadUrl: `${previewUrl}?download=1`,
    height: row.height,
    id: row.id,
    previewUrl,
    width: row.width
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
