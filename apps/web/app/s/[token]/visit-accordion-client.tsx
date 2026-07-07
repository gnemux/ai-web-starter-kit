"use client";

import { useRef, useState } from "react";

import {
  formatTaskAction,
  getCategoryLabel,
  getCategoryStyle,
  parseTaskTitle
} from "../../catcare/plans/plan-task-display";

type AnonymousTask = {
  category: Parameters<typeof getCategoryLabel>[0];
  frequency: string | null;
  instructions: string | null;
  required: boolean;
  sortOrder: number;
  title: string;
};

type AnonymousVisitSection = {
  tasks: AnonymousTask[];
  timeLabel: string;
};

export function AnonymousVisitAccordion({
  sections
}: {
  sections: AnonymousVisitSection[];
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

function TaskStep({ step, task }: { step: number; task: AnonymousTask }) {
  const title = parseTaskTitle(task.title);

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
      </div>
    </li>
  );
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
