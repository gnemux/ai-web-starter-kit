"use client";

import type { FormEvent } from "react";

import type { CarePhotoViewerLabels } from "../../catcare/care-photo-lightbox-client";
import { EvidencePicker } from "./care-evidence-picker-client";
import type { SelectedEvidence } from "./visit-model";

export function TaskSubmissionForm({
  attachmentCount,
  error,
  evidenceFiles,
  note,
  onEvidenceChange,
  onEvidenceRemove,
  onCancel,
  onNoteChange,
  onStatusChange,
  onSubmit,
  pending,
  processingEvidence,
  photoRequired,
  photoViewerLabels,
  serviceDate,
  status,
  submitLabel,
  submissionRef,
  token,
  visitTime
}: {
  attachmentCount: number;
  error: string | null;
  evidenceFiles: SelectedEvidence[];
  note: string;
  onEvidenceChange: (files: FileList | null) => void;
  onEvidenceRemove: (id: string) => void;
  onCancel?: () => void;
  onNoteChange: (value: string) => void;
  onStatusChange: (value: "completed" | "note" | "exception") => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  processingEvidence: boolean;
  photoRequired: boolean;
  photoViewerLabels: CarePhotoViewerLabels;
  serviceDate: string;
  status: "completed" | "note" | "exception";
  submitLabel: string;
  submissionRef: string;
  token: string;
  visitTime: string;
}) {
  return (
    <form
      aria-busy={pending}
      className="mt-4 grid gap-3 border-t border-[#e2e6ee] pt-3"
      onSubmit={onSubmit}
    >
      <input name="serviceDate" type="hidden" value={serviceDate} />
      <input name="submissionRef" type="hidden" value={submissionRef} />
      <input name="token" type="hidden" value={token} />
      <input name="visitTime" type="hidden" value={visitTime} />
      <fieldset className="grid gap-2" disabled={pending}>
        <legend className="text-sm font-semibold text-[#526177]">
          提交结果
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { label: "已完成", value: "completed" },
            { label: "完成并备注", value: "note" },
            { label: "有异常", value: "exception" }
          ].map((option) => (
            <label
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d9e0ea] bg-white px-3 text-sm font-semibold text-[#526177] transition has-[:checked]:border-[#07847f] has-[:checked]:bg-[#e6f7f2] has-[:checked]:text-[#07847f] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
              key={option.value}
            >
              <input
                checked={status === option.value}
                className="sr-only"
                name="status"
                onChange={() =>
                  onStatusChange(
                    option.value as "completed" | "note" | "exception"
                  )
                }
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[#526177]">
          {status === "exception"
            ? "异常说明（必填）"
            : status === "note"
              ? "备注（必填，仍算已完成）"
              : "备注（可选）"}
        </span>
        <textarea
          className="min-h-24 w-full resize-y rounded-xl border border-[#d9e0ea] bg-white px-3 py-3 text-base font-semibold leading-7 text-[#101a32] outline-none transition placeholder:text-[#98a4b5] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10 disabled:cursor-not-allowed disabled:bg-[#f2f4f7] disabled:text-[#75839a]"
          disabled={pending}
          maxLength={2000}
          name="note"
          onChange={(event) => onNoteChange(event.currentTarget.value)}
          placeholder={
            status === "exception"
              ? "请写清异常情况和已采取的处理"
              : "可补充位置、食量、精神状态或需要主人知道的事"
          }
          required={status !== "completed"}
          value={note}
        />
      </label>
      <EvidencePicker
        attachmentCount={attachmentCount}
        files={evidenceFiles}
        onChange={onEvidenceChange}
        onRemove={onEvidenceRemove}
        photoRequired={photoRequired}
        photoViewerLabels={photoViewerLabels}
        processing={processingEvidence}
      />
      {error ? (
        <p
          className="rounded-xl bg-[#fff4f2] px-3 py-2 text-sm font-semibold leading-6 text-[#b7352c]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className={`grid gap-2 ${onCancel ? "sm:grid-cols-2" : ""}`}>
        {onCancel ? (
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#d9e0ea] bg-white px-5 text-base font-semibold text-[#526177] transition hover:bg-[#f2f4f7] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            取消修改
          </button>
        ) : null}
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#07847f] bg-[#07847f] px-5 text-base font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:bg-[#06706c] disabled:cursor-not-allowed disabled:border-[#d9e0ea] disabled:bg-[#f2f4f7] disabled:text-[#98a4b5] disabled:shadow-none"
          disabled={pending}
          type="submit"
        >
          {pending ? "提交中…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
