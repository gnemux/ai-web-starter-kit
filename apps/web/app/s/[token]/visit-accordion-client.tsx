"use client";

import { useRef, useState } from "react";

import type { AnonymousCareTaskSubmissionView } from "@/lib/catcare/product-service";

import {
  formatTaskAction,
  getCategoryLabel,
  getCategoryStyle,
  parseTaskTitle
} from "../../catcare/plans/plan-task-display";
import { submitAnonymousCareTaskAction } from "./actions";

type AnonymousTask = {
  category: Parameters<typeof getCategoryLabel>[0];
  frequency: string | null;
  instructions: string | null;
  required: boolean;
  submission: AnonymousCareTaskSubmissionView | null;
  submissionRef: string;
  sortOrder: number;
  title: string;
};

type AnonymousVisitSection = {
  tasks: AnonymousTask[];
  timeLabel: string;
};

export function AnonymousVisitAccordion({
  sections,
  token
}: {
  sections: AnonymousVisitSection[];
  token: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  function toggleVisit(index: number) {
    const nextIndex = openIndex === index ? null : index;

    setOpenIndex(nextIndex);

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
      {sections.map((section, index) => {
        const open = openIndex === index;
        const panelId = `anonymous-visit-${index}`;

        return (
          <section
            className={`scroll-mt-5 rounded-2xl border border-[#d9eee7] p-4 ${
              open ? "bg-white" : "bg-[#fbfdfc]"
            }`}
            key={section.timeLabel}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
          >
            <button
              aria-controls={panelId}
              aria-expanded={open}
              className="w-full text-left"
              onClick={() => toggleVisit(index)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#07847f]">
                    第 {index + 1} 次到访 · {section.timeLabel}
                  </p>
                  <h3 className="mt-1 break-words text-lg font-semibold leading-7 text-[#101a32]">
                    {formatVisitSummary(section.tasks)}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
                  {open ? "收起" : "展开"} · {section.tasks.length} 步
                </span>
              </div>
            </button>
            {open ? (
              <ol className="mt-4 grid gap-3" id={panelId}>
                {section.tasks.map((task, taskIndex) => (
                  <TaskStep
                    key={`${section.timeLabel}-${task.sortOrder}-${task.title}`}
                    step={taskIndex + 1}
                    task={task}
                    token={token}
                  />
                ))}
              </ol>
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
  token
}: {
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
    task.submission ? "这项任务已提交。" : null
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    formData.set("token", token);
    formData.set("submissionRef", task.submissionRef);

    const result = await submitAnonymousCareTaskAction(formData);

    setPending(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setSubmission({
      abnormal: result.data.abnormal,
      note: result.data.note,
      status: result.data.status,
      submittedAt: result.data.submittedAt
    });
    setStatus(result.data.status);
    setNote(result.data.note ?? "");
    setMessage(result.data.message);
  }

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl bg-white p-3 ring-1 ring-[#e2e6ee]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f7f2] text-sm font-bold text-[#07847f]">
        {step}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryStyle(task.category)}`}
          >
            {getCategoryLabel(task.category)}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
            {task.required ? "必做" : "可选"}
          </span>
        </div>
        <h4 className="mt-2 break-words text-base font-semibold leading-7 text-[#101a32]">
          {formatTaskAction(task.title)}
        </h4>
        {title.owner ? (
          <p className="mt-1 text-sm font-semibold text-[#526177]">
            适用猫咪：{title.owner}
          </p>
        ) : null}
        <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
          {formatFrequency(task.frequency)}
        </p>
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
        <form className="mt-4 grid gap-3 border-t border-[#e2e6ee] pt-3" onSubmit={onSubmit}>
          <input name="submissionRef" type="hidden" value={task.submissionRef} />
          <input name="token" type="hidden" value={token} />
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold text-[#526177]">
              提交结果
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { label: "已完成", value: "completed" },
                { label: "补充备注", value: "note" },
                { label: "有异常", value: "exception" }
              ].map((option) => (
                <label
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d9e0ea] bg-white px-3 text-sm font-semibold text-[#526177] transition has-[:checked]:border-[#07847f] has-[:checked]:bg-[#e6f7f2] has-[:checked]:text-[#07847f]"
                  key={option.value}
                >
                  <input
                    checked={status === option.value}
                    className="sr-only"
                    name="status"
                    onChange={() =>
                      setStatus(option.value as "completed" | "note" | "exception")
                    }
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          {status !== "completed" ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#526177]">
                {status === "exception" ? "异常说明（必填）" : "备注（必填）"}
              </span>
              <textarea
                className="min-h-24 w-full resize-y rounded-xl border border-[#d9e0ea] bg-white px-3 py-3 text-base font-semibold leading-7 text-[#101a32] outline-none transition placeholder:text-[#98a4b5] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
                maxLength={2000}
                name="note"
                onChange={(event) => setNote(event.currentTarget.value)}
                placeholder={
                  status === "note"
                    ? "请写下需要主人知道的补充信息"
                    : "请写清异常情况和已采取的处理"
                }
                value={note}
              />
            </label>
          ) : null}
          {error ? (
            <p className="rounded-xl bg-[#fff4f2] px-3 py-2 text-sm font-semibold leading-6 text-[#b7352c]">
              {error}
            </p>
          ) : null}
          {message || submission ? (
            <p className="rounded-xl bg-[#f2fbf8] px-3 py-2 text-sm font-semibold leading-6 text-[#07847f]">
              {message ?? "这项任务已提交。"}
            </p>
          ) : null}
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#07847f] bg-[#07847f] px-5 text-base font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:bg-[#06706c] disabled:cursor-not-allowed disabled:border-[#d9e0ea] disabled:bg-[#f2f4f7] disabled:text-[#98a4b5] disabled:shadow-none"
            disabled={pending}
            type="submit"
          >
            {pending ? "提交中..." : "提交这项结果"}
          </button>
        </form>
        ) : null}
      </div>
    </li>
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
