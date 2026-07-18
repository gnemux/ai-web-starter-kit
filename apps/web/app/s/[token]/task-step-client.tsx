"use client";

import { useEffect, useRef, useState } from "react";

import { prepareClientImageForUpload } from "@/lib/media/client-image";
import {
  reconcileEvidenceAttachmentCount,
  reconcileSubmittedEvidenceState
} from "@/lib/media/evidence-upload-state";

import { CatCareTaskCategoryIcon } from "../../catcare/catcare-item-type-icon";
import type { CarePhotoViewerLabels } from "../../catcare/care-photo-lightbox-client";
import {
  formatTaskAction,
  getCategoryStyle,
  parseTaskTitle
} from "../../catcare/plans/plan-task-display";
import { submitAnonymousCareTaskAction } from "./actions";
import {
  EvidencePicker,
  type CareSubmissionLabels
} from "./care-evidence-picker-client";
import { TaskSubmissionForm } from "./care-submission-form-client";
import type {
  AnonymousTask,
  SelectedEvidence,
  ShareHandoffLabels
} from "./visit-model";
import {
  careEvidenceNetworkMaxBytes,
  careEvidencePickerMaxBytes
} from "./visit-model";
import {
  CatOwnerBadge,
  formatFrequency,
  formatShareCategory,
  formatShareOwner,
  formatSubmissionStatus
} from "./visit-display";

export function TaskStep({
  step,
  task,
  careSubmissionLabels,
  photoViewerLabels,
  shareHandoffLabels,
  onSubmitted,
  token
}: {
  onSubmitted: () => void;
  careSubmissionLabels: CareSubmissionLabels;
  step: number;
  task: AnonymousTask;
  photoViewerLabels: CarePhotoViewerLabels;
  shareHandoffLabels: ShareHandoffLabels;
  token: string;
}) {
  const title = parseTaskTitle(task.title);
  const [status, setStatus] = useState<
    "completed" | "note" | "exception"
  >(task.submission?.status ?? "completed");
  const [note, setNote] = useState(task.submission?.note ?? "");
  const [submission, setSubmission] = useState(task.submission);
  const [isEditing, setIsEditing] = useState(false);
  const [attachmentCount, setAttachmentCount] = useState(
    task.submission?.attachmentCount ?? 0
  );
  const [evidenceFiles, setEvidenceFiles] = useState<SelectedEvidence[]>([]);
  const evidenceFilesRef = useRef<SelectedEvidence[]>([]);
  const [message, setMessage] = useState<string | null>(
    task.submission ? careSubmissionLabels.taskSubmitted : null
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [processingEvidence, setProcessingEvidence] = useState(false);

  useEffect(() => {
    evidenceFilesRef.current = evidenceFiles;
  }, [evidenceFiles]);

  useEffect(() => () => {
    evidenceFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }, []);

  async function onEvidenceChange(files: FileList | null) {
    if (!files) {
      return;
    }

    const available = Math.max(3 - attachmentCount - evidenceFiles.length, 0);
    const nextFiles = Array.from(files).slice(0, available);
    const prepared: SelectedEvidence[] = [];

    setProcessingEvidence(true);
    setError(null);

    try {
      for (const file of nextFiles) {
        const uploadFile = await prepareClientImageForUpload(file, {
          maxDimension: 1600,
          maxInputBytes: careEvidencePickerMaxBytes,
          maxOutputBytes: careEvidenceNetworkMaxBytes,
          messages: {
            oversizedPhoto: careSubmissionLabels.oversizedPhoto,
            processingFailed: careSubmissionLabels.photoProcessingFailed,
            unsafeCompression: careSubmissionLabels.unsafeCompression,
            unreadablePhoto: careSubmissionLabels.unreadablePhoto,
            unsupportedBrowser: careSubmissionLabels.unsupportedBrowser,
            unsupportedPhoto: careSubmissionLabels.unsupportedPhoto
          }
        });

        prepared.push({
          file: uploadFile,
          id: `${file.name}:${file.size}:${file.lastModified}:${crypto.randomUUID()}`,
          previewUrl: URL.createObjectURL(uploadFile)
        });
      }

      setEvidenceFiles((current) => [...current, ...prepared]);
    } catch (cause) {
      prepared.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setError(
        cause instanceof Error
          ? cause.message
          : careSubmissionLabels.photoProcessingFailed
      );
    } finally {
      setProcessingEvidence(false);
    }
  }

  function removeEvidence(id: string) {
    setEvidenceFiles((current) => {
      const removed = current.find((item) => item.id === id);

      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function clearEvidenceFiles() {
    setEvidenceFiles((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }

  async function uploadEvidence(submissionId: string, baseCount = attachmentCount) {
    const uploadedIds = new Set<string>();
    let nextCount = baseCount;
    let uploadError: string | null = null;

    for (const item of evidenceFiles) {
      const body = new FormData();
      body.set("photo", item.file);
      body.set("token", token);
      const response = await fetch(
        `/api/catcare/share/submissions/${submissionId}/attachments`,
        { body, method: "POST" }
      );
      const payload = (await response.json().catch(() => null)) as
        | {
            alreadyUploaded?: boolean;
            attachmentCount?: number;
            error?: string;
          }
        | null;

      if (!response.ok) {
        uploadError = careSubmissionLabels.photoUploadFailed;
        continue;
      }

      uploadedIds.add(item.id);
      nextCount = reconcileEvidenceAttachmentCount(nextCount, payload ?? {});
    }

    setEvidenceFiles((current) =>
      current.filter((item) => {
        if (!uploadedIds.has(item.id)) {
          return true;
        }

        URL.revokeObjectURL(item.previewUrl);
        return false;
      })
    );
    setAttachmentCount(Math.min(nextCount, 3));

    return { attachmentCount: Math.min(nextCount, 3), error: uploadError };
  }

  async function onEvidenceRetry() {
    if (!submission || evidenceFiles.length === 0 || processingEvidence) {
      return;
    }

    setPending(true);
    setError(null);
    const result = await uploadEvidence(submission.submissionId);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmission((current) =>
      current ? { ...current, attachmentCount: result.attachmentCount } : current
    );
    setMessage(careSubmissionLabels.photoUploadSuccess);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processingEvidence) {
      setError(careSubmissionLabels.photoStillProcessing);
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);
    const wasAlreadySubmitted = Boolean(submission);

    const formData = new FormData(event.currentTarget);
    formData.set("serviceDate", task.serviceDate);
    formData.set("token", token);
    formData.set("submissionRef", task.submissionRef);
    formData.set("visitTime", task.visitTime);
    const submittedEvidence = [...evidenceFiles];
    for (const item of submittedEvidence) {
      formData.append("photos", item.file);
    }

    const result = await submitAnonymousCareTaskAction(formData);

    if (!result.ok) {
      setPending(false);
      setError(careSubmissionLabels.submissionFailed);
      return;
    }

    const reconciledEvidence = reconcileSubmittedEvidenceState({
      attachmentCount: result.data.attachmentCount,
      evidenceIds: submittedEvidence.map((item) => item.id),
      uploadedPhotoIndexes: result.data.uploadedPhotoIndexes
    });
    const uploadedIds = new Set(reconciledEvidence.uploadedIds);
    setEvidenceFiles((current) =>
      current.filter((item) => {
        if (!uploadedIds.has(item.id)) {
          return true;
        }

        URL.revokeObjectURL(item.previewUrl);
        return false;
      })
    );
    const nextAttachmentCount = reconciledEvidence.attachmentCount;
    const mediaError = result.data.mediaUploadError;

    setAttachmentCount(Math.min(nextAttachmentCount, 3));
    setPending(false);
    setSubmission({
      abnormal: result.data.abnormal,
      attachmentCount: nextAttachmentCount,
      note: result.data.note,
      serviceDate: result.data.serviceDate,
      status: result.data.status,
      submissionId: result.data.submissionId,
      submittedAt: result.data.submittedAt
    });
    setIsEditing(false);
    setStatus(result.data.status);
    setNote(result.data.note ?? "");
    setMessage(
      mediaError
        ? careSubmissionLabels.partialPhotoUploadFailed
        : status === "exception" && nextAttachmentCount === 0
          ? careSubmissionLabels.exceptionSubmitted
          : nextAttachmentCount > 0
            ? careSubmissionLabels.photosUploaded.replace(
                "{count}",
                String(nextAttachmentCount)
              )
            : careSubmissionLabels.taskSubmitted
    );
    setError(mediaError ? careSubmissionLabels.photoUploadFailed : null);
    if (!wasAlreadySubmitted) {
      onSubmitted();
    }
  }

  return (
    <li className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#e2e6ee]">
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 bg-[#fbfdfc] px-3 py-3">
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#f2fbf8] ring-1 ring-[#d9eee7]">
          <CatCareTaskCategoryIcon
            category={task.category}
            className="h-9 w-9"
            treatment="plain"
          />
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#07847f] text-[11px] font-bold text-white ring-2 ring-white">
            {step}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ${getCategoryStyle(task.category)}`}
            >
              {formatShareCategory(task.category, shareHandoffLabels)}
            </span>
            <span className="inline-flex min-h-7 items-center rounded-full bg-white px-2.5 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
              {task.required
                ? careSubmissionLabels.required
                : careSubmissionLabels.optional}
            </span>
            {task.photoRequired ? (
              <span className="inline-flex min-h-7 items-center rounded-full bg-[#e6f7f2] px-2.5 text-xs font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
                {careSubmissionLabels.photoRequired}
              </span>
            ) : null}
            <CatOwnerBadge
              name={formatShareOwner(title.owner, shareHandoffLabels)}
              styleOwner={title.owner}
            />
          </div>
          <h4 className="mt-2 break-words text-lg font-semibold leading-7 text-[#101a32]">
            {formatTaskAction(task.title)}
          </h4>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
            {formatFrequency(task.frequency, shareHandoffLabels)}
          </p>
        </div>
      </div>
      <div className="px-3 pb-3">
        {task.instructions ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#101a32]">
            {task.instructions}
          </p>
        ) : null}
        {submission ? (
          <div className="mt-4 rounded-xl bg-[#f2fbf8] px-3 py-3 ring-1 ring-[#d9eee7]">
            <p className="text-sm font-semibold text-[#07847f]">
              {formatSubmissionStatus(submission.status, shareHandoffLabels)}
            </p>
            {submission.note ? (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#101a32]">
                {submission.note}
              </p>
            ) : null}
            <p className="mt-2 text-xs font-semibold text-[#75839a]">
              {message ?? careSubmissionLabels.submittedFallback}
            </p>
            <p className="mt-2 text-xs font-semibold text-[#526177]">
              {careSubmissionLabels.privatePhotos.replace(
                "{count}",
                String(attachmentCount)
              )}
            </p>
            {!isEditing ? (
              <button
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#07847f] bg-white px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#e6f7f2]"
                onClick={() => {
                  setError(null);
                  setIsEditing(true);
                }}
                type="button"
              >
                {careSubmissionLabels.editFeedback}
              </button>
            ) : null}
          </div>
        ) : null}
        {!submission || isEditing ? (
          task.locked ? (
            <p className="mt-4 rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm font-semibold leading-6 text-[#526177]">
              {careSubmissionLabels.lockedUntil.replace(
                "{date}",
                task.serviceDate
              )}
            </p>
          ) : (
            <TaskSubmissionForm
              error={error}
              evidenceFiles={evidenceFiles}
              labels={careSubmissionLabels}
              attachmentCount={attachmentCount}
              note={note}
              onEvidenceChange={onEvidenceChange}
              onEvidenceRemove={removeEvidence}
              onNoteChange={setNote}
              onCancel={
                submission
                  ? () => {
                      setError(null);
                      setStatus(submission.status);
                      setNote(submission.note ?? "");
                      clearEvidenceFiles();
                      setIsEditing(false);
                    }
                  : undefined
              }
              onSubmit={onSubmit}
              pending={pending || processingEvidence}
              processingEvidence={processingEvidence}
              photoRequired={task.photoRequired}
              photoViewerLabels={photoViewerLabels}
              serviceDate={task.serviceDate}
              status={status}
              submissionRef={task.submissionRef}
              token={token}
              visitTime={task.visitTime}
              submitLabel={
                submission
                  ? careSubmissionLabels.saveFeedback
                  : careSubmissionLabels.submitResult
              }
              onStatusChange={setStatus}
            />
          )
        ) : null}
        {submission && !isEditing && attachmentCount < 3 ? (
          <div className="mt-4 grid gap-3 border-t border-[#e2e6ee] pt-4">
            <EvidencePicker
              attachmentCount={attachmentCount}
              disabled={pending}
              files={evidenceFiles}
              labels={careSubmissionLabels}
              onChange={onEvidenceChange}
              onRemove={removeEvidence}
              photoRequired={task.photoRequired}
              photoViewerLabels={photoViewerLabels}
              processing={processingEvidence}
            />
            {error ? (
              <p className="rounded-xl bg-[#fff4f2] px-3 py-2 text-sm font-semibold leading-6 text-[#b7352c]" role="alert">
                {error}
              </p>
            ) : null}
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#07847f] bg-white px-4 text-sm font-semibold text-[#07847f] disabled:cursor-not-allowed disabled:border-[#d9e0ea] disabled:text-[#98a4b5]"
              disabled={pending || processingEvidence || evidenceFiles.length === 0}
              onClick={onEvidenceRetry}
              type="button"
            >
              {processingEvidence
                ? careSubmissionLabels.processingPhotos
                : pending
                  ? careSubmissionLabels.uploading
                  : careSubmissionLabels.retryPhotos}
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
