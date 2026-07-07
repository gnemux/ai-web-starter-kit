"use client";

import { useState } from "react";

import type { CatCarePlan, CatCareTask } from "@/lib/catcare/product-service";

import { CatCareSaveIcon } from "../catcare-action-icons";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import { CatCareButton } from "../owner-flow-components";
import { CatCareTimeInput } from "../routines/routine-schedule-control";
import { getPlanCatNames } from "./plan-cat-names";
import { PlanTaskEditor } from "./plan-task-editor-client";
import { PlanScheduleView } from "./plan-schedule-view";

type PlanTaskSaveResult =
  | { data: { handoffNotes: string | null; id: string; tasks: CatCareTask[] }; ok: true }
  | { error: { message: string }; ok: false };

export function PlanTaskSaveForm({
  action,
  itemOptions = [],
  onSaved,
  plan,
  planId,
  tasks
}: {
  action: (formData: FormData) => Promise<PlanTaskSaveResult>;
  itemOptions?: string[];
  onSaved?: (result: { handoffNotes: string | null; tasks: CatCareTask[] }) => void;
  plan: CatCarePlan;
  planId: string;
  tasks: CatCareTask[];
}) {
  const [currentTasks, setCurrentTasks] = useState(tasks);
  const [enabledById, setEnabledById] = useState(() =>
    Object.fromEntries(tasks.map((task) => [task.id, task.enabled]))
  );
  const [editorVersion, setEditorVersion] = useState(0);
  const [newTaskInitialTime, setNewTaskInitialTime] = useState(
    () => inferVisitTimes(tasks, getPlanVisitCount(plan))[0] ?? "08:30"
  );
  const [pending, setPending] = useState(false);
  const toast = useCatCareToast();
  const visitCount = getPlanVisitCount(plan);

  function updateTaskEnabled(taskId: string, enabled: boolean) {
    setEnabledById((current) => ({ ...current, [taskId]: enabled }));
    setCurrentTasks((items) =>
      items.map((task) => (task.id === taskId ? { ...task, enabled } : task))
    );
  }

  return (
    <div className="grid gap-6">
      <CatCareToast message={null} toast={toast.toast} />
      <form
        action={async (formData) => {
          setPending(true);

          const result = await action(formData);

          setPending(false);

          if (!result.ok) {
            toast.showError(result.error.message);
            return;
          }

          setCurrentTasks(result.data.tasks);
          setEnabledById(
            Object.fromEntries(result.data.tasks.map((task) => [task.id, task.enabled]))
          );
          onSaved?.({
            handoffNotes: result.data.handoffNotes,
            tasks: result.data.tasks
          });
          toast.showSuccess("清单微调已保存。发布前可继续检查执行日历。");
        }}
        className={`grid gap-3 ${pending ? "pointer-events-none opacity-70" : ""}`}
      >
        <input name="planId" type="hidden" value={planId} />
        <label className="grid gap-2 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
          <span className="text-base font-semibold text-[#101a32]">
            交接备注
          </span>
          <textarea
            className="min-h-28 rounded-2xl border border-[#d9e0ea] bg-white px-4 py-3 text-base font-semibold leading-7 text-[#101a32] outline-none transition placeholder:text-[#9aa7ba] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
            defaultValue={plan.handoffNotes ?? ""}
            maxLength={2000}
            name="handoffNotes"
            placeholder="例如：钥匙放在门口密码盒；饺子容易跑门，开门先挡一下。"
          />
        </label>
        <VisitTimeControls
          onApply={(visitTimes) => {
            setCurrentTasks((items) =>
              items.map((task) => ({
                ...task,
                enabled: enabledById[task.id] ?? task.enabled,
                timeHint: snapTaskTimesToVisits(task.timeHint, visitTimes)
              }))
            );
            setNewTaskInitialTime(visitTimes[0] ?? "08:30");
            setEditorVersion((version) => version + 1);
          }}
          tasks={currentTasks}
          visitCount={visitCount}
        />
        <PlanTaskEditor
          catNames={getPlanCatNames(plan)}
          enabledById={enabledById}
          key={`${editorVersion}-${currentTasks.map((task) => task.id).join("|")}`}
          itemOptions={itemOptions}
          newTaskInitialTime={newTaskInitialTime}
          onEnabledChange={updateTaskEnabled}
          tasks={currentTasks}
        />
        <div className="pt-2">
          <CatCareButton type="submit" variant="secondary">
            <CatCareSaveIcon />
            保存微调
          </CatCareButton>
        </div>
      </form>
      <PlanScheduleView
        description="先看每天到访批次和重点，只有异常任务需要在上方微调。每周/隔日任务已分散到具体日期。"
        plan={{ ...plan, tasks: currentTasks }}
      />
    </div>
  );
}

function VisitTimeControls({
  onApply,
  tasks,
  visitCount
}: {
  onApply: (visitTimes: string[]) => void;
  tasks: CatCareTask[];
  visitCount: number;
}) {
  const [currentVisitCount, setCurrentVisitCount] = useState(visitCount);
  const [visitTimes, setVisitTimes] = useState(() =>
    inferVisitTimes(tasks, visitCount)
  );

  return (
    <section className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
      <input name="visitCount" type="hidden" value={currentVisitCount} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#101a32]">
            统一到访时间
          </h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
            先定每天上门次数，再把任务归到对应到访批次。
          </p>
        </div>
        <button
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#07847f] bg-white px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#f2fbf8]"
          onClick={() => onApply(visitTimes)}
          type="button"
        >
          应用到任务时间
        </button>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {([
          [1, "1 次", "集中照护"],
          [2, "2 次", "早晚照护"],
          [3, "3 次", "少量多次"]
        ] as const).map(([value, label, description]) => (
          <label
            className="grid min-h-14 cursor-pointer rounded-xl bg-white px-3 py-2 text-center text-sm font-semibold text-[#526177] ring-1 ring-[#e2e6ee] transition has-[:checked]:bg-[#07847f] has-[:checked]:text-white"
            key={value}
          >
            <input
              checked={currentVisitCount === value}
              className="sr-only"
              name="visitCountChoice"
              onChange={() => {
                setCurrentVisitCount(value);
                setVisitTimes(normalizeVisitTimes(visitTimes, value));
              }}
              type="radio"
            />
            <span>{label}</span>
            <span className="mt-1 text-xs opacity-80">{description}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {visitTimes.map((time, index) => (
          <label className="grid gap-2" key={index}>
            <span className="text-xs font-semibold text-[#526177]">
              第 {index + 1} 次到访
            </span>
            <CatCareTimeInput
              name={`visitTime.${index}`}
              onChange={(value) => {
                const next = [...visitTimes];
                next[index] = value;
                setVisitTimes(next);
              }}
              value={time}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function normalizeVisitTimes(currentTimes: string[], visitCount: number) {
  const defaults: Record<number, string[]> = {
    1: ["18:30"],
    2: ["08:30", "18:30"],
    3: ["08:30", "12:30", "18:30"]
  };

  if (visitCount === 1) {
    return [currentTimes.at(-1) ?? defaults[1][0]];
  }

  return Array.from(
    { length: visitCount },
    (_, index) => currentTimes[index] ?? defaults[visitCount]?.[index] ?? "18:30"
  );
}

function getPlanVisitCount(plan: CatCarePlan) {
  const summary = plan.aiInputSummary;
  const value =
    summary && typeof summary === "object" && !Array.isArray(summary)
      ? Number(summary.visit_count)
      : 2;

  return value === 1 || value === 3 ? value : 2;
}

function inferVisitTimes(tasks: CatCareTask[], visitCount: number) {
  const defaults: Record<number, string[]> = {
    1: ["18:30"],
    2: ["08:30", "18:30"],
    3: ["08:30", "12:30", "18:30"]
  };
  const times = Array.from(
    new Set(
      tasks
        .flatMap((task) => parseTaskTimes(task.timeHint))
        .sort((left, right) => timeToMinutes(left) - timeToMinutes(right))
    )
  );

  return Array.from({ length: visitCount }, (_, index) =>
    times[index] ?? defaults[visitCount]?.[index] ?? "18:30"
  );
}

function snapTaskTimesToVisits(timeHint: string | null, visitTimes: string[]) {
  const times = parseTaskTimes(timeHint);

  if (times.length === 0) {
    return visitTimes[0] ?? "18:30";
  }

  return Array.from(
    new Set(
      times
        .map((time) => findClosestVisitTime(time, visitTimes))
    )
  )
    .slice(0, Math.max(1, visitTimes.length))
    .join(",");
}

function findClosestVisitTime(time: string, visitTimes: string[]) {
  return visitTimes.reduce((closest, candidate) =>
    Math.abs(timeToMinutes(candidate) - timeToMinutes(time)) <
    Math.abs(timeToMinutes(closest) - timeToMinutes(time))
      ? candidate
      : closest
  );
}

function parseTaskTimes(value: string | null) {
  return String(value ?? "")
    .split(/[，,、;\n]+/)
    .map((time) => time.trim())
    .filter((time) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(time));
}

function timeToMinutes(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");

  return Number(hour) * 60 + Number(minute);
}
