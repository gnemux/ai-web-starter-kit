"use client";

import { useRef, useState } from "react";

import type { AnonymousCareTaskSubmissionView } from "@/lib/catcare/product-service";

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
  required: boolean;
  serviceDate: string;
  submission: AnonymousCareTaskSubmissionView | null;
  submissionRef: string;
  sortOrder: number;
  title: string;
  visitTime: string;
};

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
  const [message, setMessage] = useState<string | null>(
    task.submission ? "这项任务已提交" : null
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    formData.set("serviceDate", task.serviceDate);
    formData.set("token", token);
    formData.set("submissionRef", task.submissionRef);
    formData.set("visitTime", task.visitTime);

    const result = await submitAnonymousCareTaskAction(formData);

    setPending(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setSubmission({
      abnormal: result.data.abnormal,
      note: result.data.note,
      serviceDate: result.data.serviceDate,
      status: result.data.status,
      submittedAt: result.data.submittedAt
    });
    setStatus(result.data.status);
    setNote(result.data.note ?? "");
    setMessage(result.data.message);
    onSubmitted();
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
          </div>
        ) : null}
        {!submission ? (
          task.locked ? (
            <p className="mt-4 rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm font-semibold leading-6 text-[#526177]">
              这项任务到 {task.serviceDate} 当天才开放提交。
            </p>
          ) : (
            <TaskSubmissionForm
              error={error}
              note={note}
              onNoteChange={setNote}
              onSubmit={onSubmit}
              pending={pending}
              serviceDate={task.serviceDate}
              status={status}
              submissionRef={task.submissionRef}
              token={token}
              visitTime={task.visitTime}
              onStatusChange={setStatus}
            />
          )
        ) : null}
      </div>
    </li>
  );
}

function TaskSubmissionForm({
  error,
  note,
  onNoteChange,
  onStatusChange,
  onSubmit,
  pending,
  serviceDate,
  status,
  submissionRef,
  token,
  visitTime
}: {
  error: string | null;
  note: string;
  onNoteChange: (value: string) => void;
  onStatusChange: (value: "completed" | "note" | "exception") => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  serviceDate: string;
  status: "completed" | "note" | "exception";
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
      {error ? (
        <p
          className="rounded-xl bg-[#fff4f2] px-3 py-2 text-sm font-semibold leading-6 text-[#b7352c]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#07847f] bg-[#07847f] px-5 text-base font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:bg-[#06706c] disabled:cursor-not-allowed disabled:border-[#d9e0ea] disabled:bg-[#f2f4f7] disabled:text-[#98a4b5] disabled:shadow-none"
        disabled={pending}
        type="submit"
      >
        {pending ? "提交中…" : "提交这项结果"}
      </button>
    </form>
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
