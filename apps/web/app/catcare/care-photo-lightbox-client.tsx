"use client";

import { useEffect, useRef, useState } from "react";

import type { CatCareEvidenceAttachment } from "@/lib/catcare/product-service";
import type { Dictionary } from "@/lib/i18n";

import { CatCareXIcon } from "./catcare-action-icons";
import { useDialogFocusBoundary } from "./use-dialog-focus-boundary";

export type CarePhotoViewerLabels =
  Dictionary["catcare"]["owner"]["photoViewer"];

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
  labels,
  onClose,
  onNavigate
}: {
  activeIndex: number | null;
  items: CarePhotoLightboxItem[];
  labels: CarePhotoViewerLabels;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const safeIndex = activeIndex === null
    ? null
    : Math.min(Math.max(activeIndex, 0), Math.max(items.length - 1, 0));
  const activeItem = safeIndex === null ? null : items[safeIndex];

  useDialogFocusBoundary({
    active: Boolean(activeItem),
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    lockBodyScroll: true,
    onClose
  });

  useEffect(() => {
    if (!activeItem || safeIndex === null) {
      return;
    }

    const currentIndex = safeIndex;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" && items.length > 1) {
        onNavigate((currentIndex - 1 + items.length) % items.length);
      } else if (event.key === "ArrowRight" && items.length > 1) {
        onNavigate((currentIndex + 1) % items.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
        aria-label={labels.dialogLabel}
        aria-modal="true"
        className="mx-auto grid h-full min-h-0 w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-white/15 bg-[#101820] text-white shadow-2xl"
        role="dialog"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-base font-semibold">{labels.title}</h2>
            <p className="mt-0.5 text-xs font-semibold text-white/60">
              {safeIndex + 1} / {items.length}
            </p>
          </div>
          <button
            aria-label={labels.close}
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
                aria-label={labels.previous}
                className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-black/55 text-2xl text-white transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-[#65d6ca] sm:left-5"
                onClick={() => onNavigate((safeIndex - 1 + items.length) % items.length)}
                type="button"
              >
                ←
              </button>
              <button
                aria-label={labels.next}
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
            {activeItem.caption ?? labels.closeHint}
          </p>
          {activeItem.downloadUrl ? (
            <a
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#19a79d] px-5 text-sm font-semibold text-white transition hover:bg-[#138c84] focus:outline-none focus:ring-2 focus:ring-[#65d6ca]"
              href={activeItem.downloadUrl}
            >
              {labels.downloadSafe}
            </a>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

export function CareEvidenceGallery({
  attachments,
  labels,
  title
}: {
  attachments: CatCareEvidenceAttachment[];
  labels: CarePhotoViewerLabels;
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const items: CarePhotoLightboxItem[] = attachments.map((attachment, index) => ({
    alt: `${labels.evidenceAlt} ${index + 1}: ${title}`,
    caption: labels.evidenceCaption,
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
              aria-label={`${labels.enlargePhoto} ${index + 1}: ${title}`}
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
                {labels.enlarge}
              </span>
            </button>
            <a
              className="flex min-h-10 items-center justify-center px-3 text-xs font-semibold text-[#07847f]"
              href={attachment.downloadUrl}
            >
              {labels.downloadSafe}
            </a>
          </figure>
        ))}
      </div>
      <CarePhotoLightbox
        activeIndex={activeIndex}
        items={items}
        labels={labels}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
