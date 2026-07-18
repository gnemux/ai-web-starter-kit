"use client";

import { useState } from "react";

import {
  CarePhotoLightbox,
  type CarePhotoLightboxItem,
  type CarePhotoViewerLabels
} from "../../catcare/care-photo-lightbox-client";
import type { SelectedEvidence } from "./visit-model";

export function EvidencePicker({
  attachmentCount,
  files,
  onChange,
  onRemove,
  photoRequired,
  photoViewerLabels,
  processing
}: {
  attachmentCount: number;
  files: SelectedEvidence[];
  onChange: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  photoRequired: boolean;
  photoViewerLabels: CarePhotoViewerLabels;
  processing: boolean;
}) {
  const remaining = Math.max(3 - attachmentCount - files.length, 0);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const previewItems: CarePhotoLightboxItem[] = files.map((item, index) => ({
    alt: `${photoViewerLabels.localAlt} ${index + 1}`,
    caption: photoViewerLabels.localCaption,
    id: item.id,
    src: item.previewUrl
  }));

  return (
    <>
      <div className="grid gap-3 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-3">
        <div>
          <p className="text-sm font-semibold text-[#101a32]">
            照护照片{photoRequired ? "（主人要求）" : "（可选）"}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#75839a]">
            最多 3 张，可选择单张不超过 15 MB 的手机原图；上传前会自动压缩，服务端会再次清除定位信息，仅主人登录后可查看。
          </p>
        </div>
        {files.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {files.map((item, index) => (
              <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-[#d9e0ea]" key={item.id}>
                <button
                  aria-label={`${photoViewerLabels.enlargePhoto}: ${item.file.name}`}
                  className="group block w-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#07847f]/30"
                  onClick={() => setActivePreviewIndex(index)}
                  type="button"
                >
                  <img
                    alt={`${photoViewerLabels.localAlt} ${index + 1}`}
                    className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                    src={item.previewUrl}
                  />
                  <span className="absolute bottom-1 left-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                    {photoViewerLabels.enlarge}
                  </span>
                </button>
                <button
                  aria-label={`${photoViewerLabels.removePhoto}: ${item.file.name}`}
                  className="absolute right-1 top-1 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-sm font-bold text-white"
                  onClick={() => onRemove(item.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {remaining > 0 ? (
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#7ebdb8] bg-white px-4 text-sm font-semibold text-[#07847f] has-[:disabled]:cursor-wait has-[:disabled]:border-[#d9e0ea] has-[:disabled]:text-[#75839a]">
            {processing ? "正在压缩照片…" : `选择照片（还可选 ${remaining} 张）`}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={processing}
              multiple
              onChange={(event) => {
                onChange(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
              type="file"
            />
          </label>
        ) : (
          <p className="text-xs font-semibold text-[#526177]">已达到 3 张上限。</p>
        )}
      </div>
      <CarePhotoLightbox
        activeIndex={activePreviewIndex}
        items={previewItems}
        labels={photoViewerLabels}
        onClose={() => setActivePreviewIndex(null)}
        onNavigate={setActivePreviewIndex}
      />
    </>
  );
}

