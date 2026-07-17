import "server-only";

import { serviceError, serviceOk, type ServiceResult } from "@xwlc/core";
import { normalizePrivateImageBuffer } from "./private-image-core";

export { privateImageOutputMaxBytes } from "./private-image-core";

export const privateImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;
export const careEvidenceInputMaxBytes = 4 * 1024 * 1024;
export const catPhotoInputMaxBytes = 5 * 1024 * 1024;
export const careEvidenceMaxCount = 3;

export type NormalizedPrivateImage = {
  body: Buffer;
  byteSize: number;
  contentType: "image/webp";
  height: number;
  width: number;
};

export function validatePrivateImageFile(
  file: FormDataEntryValue | null,
  maxBytes: number
): ServiceResult<File> {
  if (!(file instanceof File) || file.size === 0) {
    return serviceError("validation_error", "请选择一张照片。", {
      photo: "required"
    });
  }

  if (!privateImageMimeTypes.includes(file.type as (typeof privateImageMimeTypes)[number])) {
    return serviceError("validation_error", "仅支持 JPG、PNG 或 WebP 照片。", {
      photo: "invalid_type"
    });
  }

  if (file.size > maxBytes) {
    return serviceError(
      "validation_error",
      `单张照片不能超过 ${Math.floor(maxBytes / 1024 / 1024)} MB。`,
      { photo: "too_large" }
    );
  }

  return serviceOk(file);
}

export async function normalizePrivateImage(
  file: File,
  options: { maxDimension: number }
): Promise<ServiceResult<NormalizedPrivateImage>> {
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const output = await normalizePrivateImageBuffer(input, options);

    return serviceOk({
      body: output.data,
      byteSize: output.data.byteLength,
      contentType: "image/webp",
      height: output.info.height,
      width: output.info.width
    });
  } catch {
    return serviceError("validation_error", "照片无法解析，请换一张再试。", {
      photo: "invalid_content"
    });
  }
}
