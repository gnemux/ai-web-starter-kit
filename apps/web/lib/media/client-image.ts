export const clientImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

type ClientImageMimeType = (typeof clientImageMimeTypes)[number];

export type ClientImagePreparationOptions = {
  maxDimension: number;
  maxInputBytes: number;
  maxOutputBytes: number;
  messages?: Partial<ClientImagePreparationMessages>;
};

export type ClientImagePreparationMessages = {
  processingFailed: string;
  oversizedPhoto: string;
  unsafeCompression: string;
  unreadablePhoto: string;
  unsupportedBrowser: string;
  unsupportedPhoto: string;
};

const defaultClientImageMessages: ClientImagePreparationMessages = {
  processingFailed: "照片处理失败，请换一张照片后重试。",
  oversizedPhoto: "单张手机原图不能超过 {megabytes} MB。",
  unsafeCompression:
    "当前浏览器无法把照片安全压缩到上传范围，请换一张照片后重试。",
  unreadablePhoto: "照片无法读取，请重新选择 JPG、PNG 或 WebP 照片。",
  unsupportedBrowser: "当前浏览器无法处理手机原图，请更新浏览器后重试。",
  unsupportedPhoto: "仅支持 JPG、PNG 或 WebP 照片。"
};

export function getBoundedImageDimensions(
  width: number,
  height: number,
  maxDimension: number
) {
  const scale = Math.min(maxDimension / Math.max(width, height), 1);

  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale))
  };
}

export function validateClientImageSelection(
  file: Pick<File, "size" | "type">,
  maxInputBytes: number,
  messageOverrides?: Partial<ClientImagePreparationMessages>
) {
  const messages = { ...defaultClientImageMessages, ...messageOverrides };

  if (!clientImageMimeTypes.includes(file.type as ClientImageMimeType)) {
    return messages.unsupportedPhoto;
  }

  if (file.size > maxInputBytes) {
    return messages.oversizedPhoto.replace(
      "{megabytes}",
      String(Math.floor(maxInputBytes / 1024 / 1024))
    );
  }

  return null;
}

export async function prepareClientImageForUpload(
  file: File,
  options: ClientImagePreparationOptions
) {
  const messages = { ...defaultClientImageMessages, ...options.messages };
  const selectionError = validateClientImageSelection(
    file,
    options.maxInputBytes,
    messages
  );

  if (selectionError) {
    throw new Error(selectionError);
  }

  if (typeof createImageBitmap !== "function") {
    throw new Error(messages.unsupportedBrowser);
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(messages.unreadablePhoto);
  }

  try {
    const dimensions = getBoundedImageDimensions(
      bitmap.width,
      bitmap.height,
      options.maxDimension
    );

    if (
      dimensions.width === bitmap.width &&
      dimensions.height === bitmap.height &&
      file.size <= options.maxOutputBytes
    ) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error(messages.processingFailed);
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height);

    for (const quality of [0.84, 0.74, 0.64, 0.54]) {
      const blob = await canvasToBlob(
        canvas,
        quality,
        messages.processingFailed
      );

      if (
        blob.type === "image/webp" &&
        blob.size <= options.maxOutputBytes
      ) {
        return new File([blob], toWebpName(file.name), {
          lastModified: file.lastModified,
          type: "image/webp"
        });
      }
    }

    throw new Error(messages.unsafeCompression);
  } finally {
    bitmap.close();
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
  processingFailedMessage: string
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error(processingFailedMessage));
      },
      "image/webp",
      quality
    );
  });
}

function toWebpName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").trim() || "care-photo";
  return `${base}.webp`;
}
