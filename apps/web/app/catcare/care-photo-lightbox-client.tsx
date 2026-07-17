"use client";

import { useEffect, useRef, useState } from "react";

import type { CatCareEvidenceAttachment } from "@/lib/catcare/product-service";

import { CatCareXIcon } from "./catcare-action-icons";

export type CarePhotoLightboxItem = {
  alt: string;
  caption?: string;
  downloadUrl?: string;
  id: string;
  src: string;
};

export function CarePhotoLightbox({
  activeIndex,
  items,
  onClose,
  onNavigate
}: {
  activeIndex: number | null;
  items: CarePhotoLightboxItem[];
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const safeIndex = activeIndex === null
    ? null
    : Math.min(Math.max(activeIndex, 0), Math.max(items.length - 1, 0));
  const activeItem = safeIndex === null ? null : items[safeIndex];

  useEffect(() => {
    if (!activeItem || safeIndex === null) {
      return;
    }

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const currentIndex = safeIndex;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && items.length > 1) {
        onNavigate((currentIndex - 1 + items.length) % items.length);
      } else if (event.key === "ArrowRight" && items.length > 1) {
        onNavigate((currentIndex + 1) % items.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [activeItem, items.length, onClose, onNavigate, safeIndex]);

  if (!activeItem || safeIndex === null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid bg-[#071018]/90 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-label="照片大图预览"
        aria-modal="true"
        className="mx-auto grid h-full min-h-0 w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-white/15 bg-[#101820] text-white shadow-2xl"
        role="dialog"
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-base font-semibold">照片预览</h2>
            <p className="mt-0.5 text-xs font-semibold text-white/60">
              {safeIndex + 1} / {items.length}
            </p>
          </div>
          <button
            aria-label="关闭照片预览"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#65d6ca]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <CatCareXIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="relative grid min-h-0 place-items-center overflow-hidden bg-black/25 p-3 sm:p-6">
          <img
            alt={activeItem.alt}
            className="max-h-full max-w-full rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            src={activeItem.src}
          />
          {items.length > 1 ? (
            <>
              <button
                aria-label="查看上一张照片"
                className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-black/55 text-2xl text-white transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-[#65d6ca] sm:left-5"
                onClick={() => onNavigate((safeIndex - 1 + items.length) % items.length)}
                type="button"
              >
                ←
              </button>
              <button
                aria-label="查看下一张照片"
                className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-black/55 text-2xl text-white transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-[#65d6ca] sm:right-5"
                onClick={() => onNavigate((safeIndex + 1) % items.length)}
                type="button"
              >
                →
              </button>
            </>
          ) : null}
        </div>

        <footer className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm font-semibold leading-6 text-white/70">
            {activeItem.caption ?? "按 Esc 或使用右上角按钮关闭预览。"}
          </p>
          {activeItem.downloadUrl ? (
            <a
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#19a79d] px-5 text-sm font-semibold text-white transition hover:bg-[#138c84] focus:outline-none focus:ring-2 focus:ring-[#65d6ca]"
              href={activeItem.downloadUrl}
            >
              下载安全处理版
            </a>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

export function CareEvidenceGallery({
  attachments,
  title
}: {
  attachments: CatCareEvidenceAttachment[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const items: CarePhotoLightboxItem[] = attachments.map((attachment, index) => ({
    alt: `${title} 的照护照片 ${index + 1}`,
    caption: "这是服务端清除定位信息并压缩后的安全处理版。",
    downloadUrl: attachment.downloadUrl,
    id: attachment.id,
    src: attachment.previewUrl
  }));

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {attachments.map((attachment, index) => (
          <figure
            className="overflow-hidden rounded-xl border border-[#e2e6ee] bg-[#fbfdfc]"
            key={attachment.id}
          >
            <button
              aria-label={`放大预览 ${title} 的照护照片 ${index + 1}`}
              className="group relative block w-full overflow-hidden bg-[#e8efec] focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#07847f]/30"
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <img
                alt={items[index]?.alt}
                className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                height={attachment.height}
                loading="lazy"
                src={attachment.previewUrl}
                width={attachment.width}
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                放大查看
              </span>
            </button>
            <a
              className="flex min-h-10 items-center justify-center px-3 text-xs font-semibold text-[#07847f]"
              href={attachment.downloadUrl}
            >
              下载安全处理版
            </a>
          </figure>
        ))}
      </div>
      <CarePhotoLightbox
        activeIndex={activeIndex}
        items={items}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
