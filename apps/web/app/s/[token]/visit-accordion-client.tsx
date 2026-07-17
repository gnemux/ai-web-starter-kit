"use client";

import { useEffect, useRef, useState } from "react";

import type { AnonymousCareTaskSubmissionView } from "@/lib/catcare/product-service";
import { prepareClientImageForUpload } from "@/lib/media/client-image";
import { reconcileEvidenceAttachmentCount } from "@/lib/media/evidence-upload-state";

import {
  CarePhotoLightbox,
  type CarePhotoLightboxItem
} from "../../catcare/care-photo-lightbox-client";
import { CatCareTaskCategoryIcon } from "../../catcare/catcare-item-type-icon";
import {
  formatOwnerLabel,
  formatTaskAction,
  getCategoryLabel,
  getCategoryStyle,
  getOwnerTagStyle,
  parseTaskTitle
} from "../../catcare/plans/plan-task-display";
import { submitAnonymousCareTaskAction } from "./actions";

type AnonymousTask = {
  category: Parameters<typeof getCategoryLabel>[0];
  frequency: string | null;
  instructions: string | null;
  locked: boolean;
  photoRequired: boolean;
  required: boolean;
  serviceDate: string;
  submission: AnonymousCareTaskSubmissionView | null;
  submissionRef: string;
  sortOrder: number;
  title: string;
  visitTime: string;
};

type SelectedEvidence = {
  file: File;
  id: string;
  previewUrl: string;
};

const careEvidencePickerMaxBytes = 15 * 1024 * 1024;
const careEvidenceNetworkMaxBytes = 3 * 1024 * 1024;

type AnonymousVisitSection = {
  tasks: AnonymousTask[];
  timeLabel: string;
};

type AnonymousServiceDay = {
  date: string;
  dateLabel: string;
  locked: boolean;
  statusLabel: string;
  visits: AnonymousVisitSection[];
};

export function AnonymousVisitAccordion({
  days,
  today,
  token
}: {
  days: AnonymousServiceDay[];
  today: string;
  token: string;
}) {
  const initialSubmittedTaskKeys = new Set(
    days.flatMap((day) =>
      day.visits.flatMap((visit) =>
        visit.tasks
          .filter((task) => task.submission)
          .map((task) => getTaskKey(task))
      )
    )
  );
  const todayIndex = days.findIndex((day) => day.date === today);
  const defaultDayIndex =
    todayIndex >= 0 &&
    !days[todayIndex]?.locked &&
    !isDaySubmitted(days[todayIndex], initialSubmittedTaskKeys)
      ? todayIndex
      : -1;
  const [openDayIndex, setOpenDayIndex] = useState<number | null>(
    defaultDayIndex >= 0 ? defaultDayIndex : null
  );
  const [openVisitKey, setOpenVisitKey] = useState<string | null>(
    defaultDayIndex >= 0 && days[defaultDayIndex]?.visits[0]
      ? `${days[defaultDayIndex].date}:0`
      : null
  );
  const [submittedTaskKeys, setSubmittedTaskKeys] = useState<Set<string>>(
    () => initialSubmittedTaskKeys
  );
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  function toggleDay(index: number) {
    const nextIndex = openDayIndex === index ? null : index;

    setOpenDayIndex(nextIndex);
    setOpenVisitKey(
      nextIndex === null || !days[nextIndex]?.visits[0]
        ? null
        : `${days[nextIndex].date}:0`
    );

    if (nextIndex !== null) {
      window.setTimeout(() => {
        itemRefs.current[nextIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 0);
    }
  }

  return (
    <div className="mt-5 grid gap-4">
      {days.map((day, dayIndex) => {
        const dayOpen = openDayIndex === dayIndex;
        const dayPanelId = `anonymous-day-${day.date}`;

        return (
          <section
            className={`scroll-mt-5 rounded-2xl border border-[#d9eee7] p-4 ${
              dayOpen ? "bg-white" : "bg-[#fbfdfc]"
            }`}
            key={day.date}
            ref={(node) => {
              itemRefs.current[dayIndex] = node;
            }}
          >
            <button
              aria-controls={dayPanelId}
              aria-expanded={dayOpen}
              className="w-full text-left"
              onClick={() => toggleDay(dayIndex)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#07847f]">
                    第 {dayIndex + 1} 天 · {day.dateLabel}
                  </p>
                  <h3 className="mt-1 break-words text-lg font-semibold leading-7 text-[#101a32]">
                    {formatDaySummary(day)}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
                  {dayOpen ? "收起" : "展开"} · {day.statusLabel}
                </span>
              </div>
            </button>
            {dayOpen ? (
              <div className="mt-4 grid gap-3" id={dayPanelId}>
                {day.locked ? (
                  <p className="rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm font-semibold leading-6 text-[#526177]">
                    这一天还没到，可以先查看安排；到当天后再提交完成、备注或异常。
                  </p>
                ) : null}
                {day.visits.map((visit, visitIndex) => {
                  const visitKey = `${day.date}:${visitIndex}`;
                  const visitOpen = openVisitKey === visitKey;
                  const visitPanelId = `anonymous-visit-${day.date}-${visitIndex}`;
                  const submittedCount = visit.tasks.filter((task) =>
                    submittedTaskKeys.has(getTaskKey(task))
                  ).length;
                  const allSubmitted = submittedCount === visit.tasks.length;

                  return (
                    <section
                      className={`rounded-xl border p-3 ${
                        allSubmitted
                          ? "border-[#bfe5d7] bg-[#f2fbf8]"
                          : "border-[#e2e6ee] bg-[#fbfdfc]"
                      }`}
                      key={visitKey}
                    >
                      <button
                        aria-controls={visitPanelId}
                        aria-expanded={visitOpen}
                        className="w-full text-left"
                        onClick={() =>
                          setOpenVisitKey(visitOpen ? null : visitKey)
                        }
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#07847f]">
                              第 {visitIndex + 1} 次到访 · {visit.timeLabel}
                            </p>
                            <h4 className="mt-1 break-words text-base font-semibold leading-6 text-[#101a32]">
                              {formatVisitSummary(visit.tasks)}
                            </h4>
                          </div>
                          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
                            {allSubmitted
                              ? "已提交"
                              : visitOpen ? "收起" : "展开"} · {submittedCount}/{visit.tasks.length}
                          </span>
                        </div>
                      </button>
                      {visitOpen ? (
                        <ol className="mt-3 grid gap-3" id={visitPanelId}>
                          {visit.tasks.map((task, taskIndex) => (
                            <TaskStep
                              key={`${day.date}-${visit.timeLabel}-${task.sortOrder}-${task.title}`}
                              step={taskIndex + 1}
                              task={task}
                              onSubmitted={() => {
                                setSubmittedTaskKeys((current) => {
                                  const next = new Set(current);
                                  next.add(getTaskKey(task));
                                  const submittedAfter = visit.tasks.filter(
                                    (item) => next.has(getTaskKey(item))
                                  ).length;

                                  if (submittedAfter === visit.tasks.length) {
                                    window.setTimeout(() => {
                                      setOpenVisitKey(null);
                                      if (isDaySubmitted(day, next)) {
                                        setOpenDayIndex(null);
                                      }
                                    }, 250);
                                  }

                                  return next;
                                });
                              }}
                              token={token}
                            />
                          ))}
                        </ol>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function TaskStep({
  step,
  task,
  onSubmitted,
  token
}: {
  onSubmitted: () => void;
  step: number;
  task: AnonymousTask;
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
    task.submission ? "这项任务已提交" : null
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
          maxOutputBytes: careEvidenceNetworkMaxBytes
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
          : "照片处理失败，请换一张照片后重试。"
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
        uploadError = payload?.error ?? "照片上传失败，请稍后重试。";
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
    setMessage("照片已安全上传，主人可以在照护结果中查看和下载");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processingEvidence) {
      setError("照片仍在处理中，请稍候再提交。");
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
    for (const item of evidenceFiles) {
      formData.append("photos", item.file);
    }

    const result = await submitAnonymousCareTaskAction(formData);

    if (!result.ok) {
      setPending(false);
      setError(result.error.message);
      return;
    }

    const uploadedPhotoIndexes = new Set(result.data.uploadedPhotoIndexes);
    setEvidenceFiles((current) =>
      current.filter((item, index) => {
        if (!uploadedPhotoIndexes.has(index)) {
          return true;
        }

        URL.revokeObjectURL(item.previewUrl);
        return false;
      })
    );
    const nextAttachmentCount = result.data.attachmentCount;
    const mediaError = result.data.mediaUploadError;

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
        ? "照护结果已提交，但部分照片上传失败，请在下方重试"
        : status === "exception" && nextAttachmentCount === 0
          ? "异常已优先提交，请在安全方便时补充照片"
          : nextAttachmentCount > 0
            ? `${result.data.message}，${nextAttachmentCount} 张照片已安全上传`
            : result.data.message
    );
    setError(mediaError);
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
              {getCategoryLabel(task.category)}
            </span>
            <span className="inline-flex min-h-7 items-center rounded-full bg-white px-2.5 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
              {task.required ? "必做" : "可选"}
            </span>
            {task.photoRequired ? (
              <span className="inline-flex min-h-7 items-center rounded-full bg-[#e6f7f2] px-2.5 text-xs font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
                需照片
              </span>
            ) : null}
            <CatOwnerBadge name={formatOwnerLabel(title.owner)} />
          </div>
          <h4 className="mt-2 break-words text-lg font-semibold leading-7 text-[#101a32]">
            {formatTaskAction(task.title)}
          </h4>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
            {formatFrequency(task.frequency)}
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
              {formatSubmissionStatus(submission.status)}
            </p>
            {submission.note ? (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#101a32]">
                {submission.note}
              </p>
            ) : null}
            <p className="mt-2 text-xs font-semibold text-[#75839a]">
              {message ?? "已提交给主人查看"}
            </p>
            <p className="mt-2 text-xs font-semibold text-[#526177]">
              私密照片：{attachmentCount}/3 张
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
                修改状态或备注
              </button>
            ) : null}
          </div>
        ) : null}
        {!submission || isEditing ? (
          task.locked ? (
            <p className="mt-4 rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm font-semibold leading-6 text-[#526177]">
              这项任务到 {task.serviceDate} 当天才开放提交。
            </p>
          ) : (
            <TaskSubmissionForm
              error={error}
              evidenceFiles={evidenceFiles}
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
              serviceDate={task.serviceDate}
              status={status}
              submissionRef={task.submissionRef}
              token={token}
              visitTime={task.visitTime}
              submitLabel={submission ? "保存最新反馈" : "提交这项结果"}
              onStatusChange={setStatus}
            />
          )
        ) : null}
        {submission && !isEditing && attachmentCount < 3 ? (
          <div className="mt-4 grid gap-3 border-t border-[#e2e6ee] pt-4">
            <EvidencePicker
              attachmentCount={attachmentCount}
              files={evidenceFiles}
              onChange={onEvidenceChange}
              onRemove={removeEvidence}
              photoRequired={task.photoRequired}
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
                ? "正在处理照片…"
                : pending
                  ? "上传中…"
                  : "补充上传所选照片"}
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function TaskSubmissionForm({
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
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  processingEvidence: boolean;
  photoRequired: boolean;
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

function EvidencePicker({
  attachmentCount,
  files,
  onChange,
  onRemove,
  photoRequired,
  processing
}: {
  attachmentCount: number;
  files: SelectedEvidence[];
  onChange: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  photoRequired: boolean;
  processing: boolean;
}) {
  const remaining = Math.max(3 - attachmentCount - files.length, 0);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const previewItems: CarePhotoLightboxItem[] = files.map((item, index) => ({
    alt: `待上传照护照片 ${index + 1}`,
    caption: "这是上传前的本机预览；提交后服务端还会清除定位信息并安全压缩。",
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
                  aria-label={`放大预览 ${item.file.name}`}
                  className="group block w-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#07847f]/30"
                  onClick={() => setActivePreviewIndex(index)}
                  type="button"
                >
                  <img
                    alt={`待上传照护照片 ${index + 1}`}
                    className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                    src={item.previewUrl}
                  />
                  <span className="absolute bottom-1 left-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                    放大
                  </span>
                </button>
                <button
                  aria-label={`移除照片 ${item.file.name}`}
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
        onClose={() => setActivePreviewIndex(null)}
        onNavigate={setActivePreviewIndex}
      />
    </>
  );
}

function CatOwnerBadge({ name }: { name: string }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ring-1 ${getOwnerTagStyle(name)}`}
    >
      {name}
    </span>
  );
}

function getTaskKey(task: AnonymousTask) {
  return `${task.serviceDate}:${task.visitTime}:${task.submissionRef}`;
}

function isDaySubmitted(day: AnonymousServiceDay, submittedTaskKeys: Set<string>) {
  const tasks = day.visits.flatMap((visit) => visit.tasks);

  return (
    tasks.length > 0 &&
    tasks.every((task) => submittedTaskKeys.has(getTaskKey(task)))
  );
}

function formatSubmissionStatus(
  status: AnonymousCareTaskSubmissionView["status"]
) {
  if (status === "exception") {
    return "已提交异常";
  }

  if (status === "note") {
    return "已提交备注";
  }

  return "已提交完成";
}

function formatDaySummary(day: AnonymousServiceDay) {
  const visitCount = day.visits.length;
  const taskCount = day.visits.reduce(
    (total, visit) => total + visit.tasks.length,
    0
  );

  return `${visitCount} 次到访 · ${taskCount} 项任务`;
}

function formatFrequency(value: string | null) {
  if (!value) {
    return "按现场情况执行";
  }

  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value);
  const count = match?.[2] ?? "1";

  if (match?.[1] === "weekly") {
    return `每周 ${count} 次`;
  }

  if (match?.[1] === "every_2_days") {
    return `每 2 日 ${count} 次`;
  }

  return `每日 ${count} 次`;
}

function formatVisitSummary(tasks: AnonymousTask[]) {
  const actions = Array.from(
    new Set(tasks.map((task) => formatTaskAction(task.title)))
  );
  const visible = actions.slice(0, 3);

  if (actions.length > visible.length) {
    return `完成${visible.join("、")}等 ${actions.length} 项`;
  }

  return `完成${visible.join("、")}`;
}
