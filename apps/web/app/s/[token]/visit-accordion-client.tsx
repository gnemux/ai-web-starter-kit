"use client";

import { useRef, useState } from "react";

import type { CarePhotoViewerLabels } from "../../catcare/care-photo-lightbox-client";
import type { CareSubmissionLabels } from "./care-evidence-picker-client";
import { TaskStep } from "./task-step-client";
import type { AnonymousServiceDay } from "./visit-model";
import {
  formatDaySummary,
  formatVisitSummary,
  getTaskKey,
  isDaySubmitted
} from "./visit-display";

export function AnonymousVisitAccordion({
  careSubmissionLabels,
  days,
  photoViewerLabels,
  today,
  token
}: {
  careSubmissionLabels: CareSubmissionLabels;
  days: AnonymousServiceDay[];
  photoViewerLabels: CarePhotoViewerLabels;
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
                              careSubmissionLabels={careSubmissionLabels}
                              key={`${day.date}-${visit.timeLabel}-${task.sortOrder}-${task.title}`}
                              step={taskIndex + 1}
                              task={task}
                              photoViewerLabels={photoViewerLabels}
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
