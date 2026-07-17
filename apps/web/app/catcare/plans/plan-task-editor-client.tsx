"use client";

import { useState } from "react";

import type { CatCareTask } from "@/lib/catcare/product-service";

import {
  CatCareEditIcon,
  CatCarePlusCircleIcon,
  CatCareTrashIcon
} from "../catcare-action-icons";
import { CatCareTimeInput } from "../routines/routine-schedule-control";
import { PlanTaskTimeInputs } from "./plan-task-time-inputs-client";

export function PlanTaskEditor({
  catNames = [],
  enabledById,
  itemOptions = [],
  newTaskInitialTime = "08:30",
  onEnabledChange,
  tasks
}: {
  catNames?: string[];
  enabledById: Record<string, boolean>;
  itemOptions?: string[];
  newTaskInitialTime?: string;
  onEnabledChange: (taskId: string, enabled: boolean) => void;
  tasks: CatCareTask[];
}) {
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const activeTasks = tasks.filter((task) => enabledById[task.id] ?? task.enabled);
  const inactiveTasks = tasks.filter((task) => !(enabledById[task.id] ?? task.enabled));

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <TaskEditorMetric label="将执行" value={`${activeTasks.length} 项`} />
        <TaskEditorMetric label="暂不执行" value={`${inactiveTasks.length} 项`} />
        <TaskEditorMetric label="可新增" value="临时任务" />
      </div>
      <div className="grid gap-2">
        {activeTasks.map((task, index) => (
          <TaskEditorRow
            enabled
            index={index}
            key={task.id}
            onDisable={() => {
              onEnabledChange(task.id, false);
              setOpenTaskId(null);
            }}
            onToggle={() => setOpenTaskId(openTaskId === task.id ? null : task.id)}
            open={openTaskId === task.id}
            task={task}
          />
        ))}
      </div>

      {inactiveTasks.length > 0 ? (
        <section className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[#526177]">暂不执行</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#75839a] ring-1 ring-[#d9e0ea]">
              {inactiveTasks.length} 项
            </span>
          </div>
          <div className="grid gap-2">
            {inactiveTasks.map((task, index) => (
              <TaskEditorRow
                enabled={false}
                index={activeTasks.length + index}
                key={task.id}
                onDisable={() => undefined}
                onRestore={() =>
                  onEnabledChange(task.id, true)
                }
                onToggle={() => undefined}
                open={false}
                task={task}
              />
            ))}
          </div>
        </section>
      ) : null}

      <NewTaskCard
        catNames={catNames}
        initialTime={newTaskInitialTime}
        itemOptions={itemOptions}
      />
    </div>
  );
}

function TaskEditorMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e2e6ee] bg-white px-4 py-3">
      <p className="text-xs font-semibold text-[#75839a]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#101a32]">{value}</p>
    </div>
  );
}

function TaskEditorRow({
  enabled,
  index,
  onDisable,
  onRestore,
  onToggle,
  open,
  task
}: {
  enabled: boolean;
  index: number;
  onDisable: () => void;
  onRestore?: () => void;
  onToggle: () => void;
  open: boolean;
  task: CatCareTask;
}) {
  if (!enabled) {
    return (
      <article className="rounded-xl border border-[#e2e6ee] bg-white px-3 py-3">
        <HiddenTaskFields enabled={false} task={task} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#526177]">
              {task.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#75839a]">
              {[task.timeHint, formatFrequency(task.frequency)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            className="inline-flex h-9 items-center justify-center rounded-xl border border-[#07847f] bg-white px-3 text-xs font-semibold text-[#07847f]"
            onClick={onRestore}
            type="button"
          >
            恢复执行
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-3">
      {open ? null : <HiddenTaskFields enabled task={task} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f7f2] text-sm font-semibold text-[#07847f]">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[#101a32]">
              {task.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#75839a]">
              {[task.timeHint, formatFrequency(task.frequency), task.photoRequired ? "需照片" : null].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#d9e0ea] bg-white px-3 text-xs font-semibold text-[#526177]"
            onClick={onToggle}
            type="button"
          >
            <CatCareEditIcon />
            {open ? "收起" : "编辑"}
          </button>
          <button
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#f0c9c1] bg-[#fffaf9] px-3 text-xs font-semibold text-[#b7352c]"
            onClick={onDisable}
            type="button"
          >
            <CatCareTrashIcon />
            暂不执行
          </button>
        </div>
      </div>

      {open ? <ExpandedTaskFields task={task} /> : null}
    </article>
  );
}

function HiddenTaskFields({
  enabled,
  task
}: {
  enabled: boolean;
  task: CatCareTask;
}) {
  return (
    <>
      <input name="taskId" type="hidden" value={task.id} />
      {enabled ? (
        <input name={`task.${task.id}.enabled`} type="hidden" value="on" />
      ) : null}
      {task.required ? (
        <input name={`task.${task.id}.required`} type="hidden" value="on" />
      ) : null}
      {task.photoRequired ? (
        <input name={`task.${task.id}.photoRequired`} type="hidden" value="on" />
      ) : null}
      <input name={`task.${task.id}.title`} type="hidden" value={task.title} />
      {(task.timeHint ?? "")
        .split(/[，,]/)
        .filter(Boolean)
        .map((time) => (
          <input
            key={time}
            name={`task.${task.id}.timeHint`}
            type="hidden"
            value={time.trim()}
          />
        ))}
      <input
        name={`task.${task.id}.instructions`}
        type="hidden"
        value={task.instructions ?? ""}
      />
    </>
  );
}

function ExpandedTaskFields({ task }: { task: CatCareTask }) {
  return (
    <div className="mt-4 grid gap-3 border-t border-[#e2e6ee] pt-4">
      <input name="taskId" type="hidden" value={task.id} />
      <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#526177]">
        <label className="inline-flex items-center gap-2">
          <input
            className="h-4 w-4 accent-[#07847f]"
            defaultChecked
            name={`task.${task.id}.enabled`}
            type="checkbox"
          />
          执行
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            className="h-4 w-4 accent-[#07847f]"
            defaultChecked={task.required}
            name={`task.${task.id}.required`}
            type="checkbox"
          />
          必做
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            className="h-4 w-4 accent-[#07847f]"
            defaultChecked={task.photoRequired}
            name={`task.${task.id}.photoRequired`}
            type="checkbox"
          />
          要求照片
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-xs font-semibold text-[#526177]">任务</span>
        <input
          className="h-12 rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#16233b] outline-none focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
          defaultValue={task.title}
          name={`task.${task.id}.title`}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-xs font-semibold text-[#526177]">时间</span>
        <PlanTaskTimeInputs
          initialTime={task.timeHint}
          name={`task.${task.id}.timeHint`}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-xs font-semibold text-[#526177]">说明</span>
        <textarea
          className="min-h-24 rounded-xl border border-[#d9e0ea] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#16233b] outline-none focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
          defaultValue={task.instructions ?? ""}
          name={`task.${task.id}.instructions`}
        />
      </label>
      <p className="text-xs font-semibold text-[#75839a]">
        {formatFrequency(task.frequency) ?? "一次性/现场判断"}
      </p>
    </div>
  );
}

function NewTaskCard({
  catNames,
  initialTime,
  itemOptions
}: {
  catNames: string[];
  initialTime: string;
  itemOptions: string[];
}) {
  const categories = [
    ["medicine", "药品/补充剂"],
    ["observe", "观察"],
    ["other", "其它"]
  ] as const;
  const [open, setOpen] = useState(false);
  const scopeOptions =
    catNames.length > 1
      ? [...catNames, "家庭共用"]
      : catNames.length === 1
        ? catNames
        : ["家庭共用"];
  const [draftTasks, setDraftTasks] = useState<DraftNewTask[]>([]);
  const [scope, setScope] = useState(scopeOptions[0] ?? "家庭共用");
  const [enabled, setEnabled] = useState(true);
  const [required, setRequired] = useState(true);
  const [photoRequired, setPhotoRequired] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number][0]>("medicine");
  const [title, setTitle] = useState("");
  const [relatedItem, setRelatedItem] = useState("");
  const [time, setTime] = useState(initialTime);
  const [instructions, setInstructions] = useState("");

  function addDraftTask() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setDraftTasks((items) => [
      ...items,
      {
        category,
        enabled,
        id: `tmp-${Date.now()}-${items.length}`,
        instructions: instructions.trim(),
        relatedItem: relatedItem.trim(),
        photoRequired,
        required,
        scope,
        timeHint: time,
        title: trimmedTitle
      }
    ]);
    setTitle("");
    setRelatedItem("");
    setInstructions("");
    setTime(initialTime);
  }

  return (
    <details
      className="rounded-2xl border border-dashed border-[#9ccfcb] bg-white p-4"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      open={open}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 text-base font-semibold text-[#07847f]">
        <CatCarePlusCircleIcon />
        新增临时任务
      </summary>
      <div className="mt-4 grid gap-4">
        <p className="text-xs font-semibold text-[#75839a]">
          例如加药、临时观察或额外交代；可先加入多条待保存任务，最后统一保存微调。
        </p>
        {draftTasks.length > 0 ? (
          <div className="grid gap-2 rounded-xl border border-[#e2e6ee] bg-[#fbfdfc] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#526177]">
                待保存临时任务
              </span>
              <span className="rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f]">
                {draftTasks.length} 条
              </span>
            </div>
            {draftTasks.map((task) => (
              <article
                className="grid gap-3 rounded-xl border border-[#e2e6ee] bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                key={task.id}
              >
                <HiddenDraftNewTaskFields task={task} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#101a32]">
                    {task.scope}：{task.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#75839a]">
                    {[task.timeHint, task.relatedItem].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  aria-label={`移除临时任务：${task.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#f0c9c1] bg-[#fffaf9] text-[#b7352c] transition hover:bg-[#fff1ef]"
                  onClick={() =>
                    setDraftTasks((items) =>
                      items.filter((item) => item.id !== task.id)
                    )
                  }
                  type="button"
                >
                  <CatCareTrashIcon />
                </button>
              </article>
            ))}
          </div>
        ) : null}
        <div className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">适用对象</span>
          <div className="flex flex-wrap gap-2">
            {scopeOptions.map((scopeOption) => (
              <label
                className="inline-flex h-10 items-center rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#526177] transition has-[:checked]:border-[#07847f] has-[:checked]:bg-[#e6f7f2] has-[:checked]:text-[#07847f]"
                key={scopeOption}
              >
                <input
                  checked={scope === scopeOption}
                  className="sr-only"
                  onChange={() => setScope(scopeOption)}
                  type="radio"
                />
                {scopeOption}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#526177]">
          <label className="inline-flex items-center gap-2">
            <input
              className="h-4 w-4 accent-[#07847f]"
              checked={enabled}
              onChange={(event) => setEnabled(event.currentTarget.checked)}
              type="checkbox"
            />
            执行
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              className="h-4 w-4 accent-[#07847f]"
              checked={required}
              onChange={(event) => setRequired(event.currentTarget.checked)}
              type="checkbox"
            />
            必做
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              className="h-4 w-4 accent-[#07847f]"
              checked={photoRequired}
              onChange={(event) => setPhotoRequired(event.currentTarget.checked)}
              type="checkbox"
            />
            要求照片
          </label>
        </div>
        <div className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">类型</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(([value, label]) => (
              <label
                className="inline-flex h-10 items-center rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#526177] transition has-[:checked]:border-[#07847f] has-[:checked]:bg-[#e6f7f2] has-[:checked]:text-[#07847f]"
                key={value}
              >
                <input
                  checked={category === value}
                  className="sr-only"
                  onChange={() => setCategory(value)}
                  type="radio"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">任务</span>
          <input
            className="h-12 rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#16233b] outline-none focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
            onChange={(event) => setTitle(event.currentTarget.value)}
            placeholder="例如：加药"
            value={title}
          />
        </label>
        {itemOptions.length > 0 ? (
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[#526177]">
              关联用品
            </span>
            <input
              className="h-12 rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#16233b] outline-none focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
              list="catcare-plan-item-options"
              onChange={(event) => setRelatedItem(event.currentTarget.value)}
              placeholder="选择家庭用品或药品"
              value={relatedItem}
            />
            <datalist id="catcare-plan-item-options">
              {itemOptions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
        ) : null}
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">时间</span>
          <CatCareTimeInput
            name="newTaskDraft.timeHint"
            onChange={setTime}
            value={time}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[#526177]">说明</span>
          <textarea
            className="min-h-24 rounded-xl border border-[#d9e0ea] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#16233b] outline-none focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
            onChange={(event) => setInstructions(event.currentTarget.value)}
            placeholder="例如：胶囊半粒，拌进罐头；喂完观察 10 分钟。"
            value={instructions}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#07847f] bg-white px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#f2fbf8]"
            onClick={addDraftTask}
            type="button"
          >
            <CatCarePlusCircleIcon />
            加入待保存
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#526177] transition hover:bg-[#f7fbfa]"
            onClick={() => {
              setTitle("");
              setRelatedItem("");
              setInstructions("");
              setTime(initialTime);
              setOpen(false);
            }}
            type="button"
          >
            取消填写
          </button>
        </div>
      </div>
    </details>
  );
}

type DraftNewTask = {
  category: "medicine" | "observe" | "other";
  enabled: boolean;
  id: string;
  instructions: string;
  photoRequired: boolean;
  relatedItem: string;
  required: boolean;
  scope: string;
  timeHint: string;
  title: string;
};

function HiddenDraftNewTaskFields({ task }: { task: DraftNewTask }) {
  const fieldPrefix = `newTask.${task.id}`;

  return (
    <>
      <input name="newTaskId" type="hidden" value={task.id} />
      <input name={`${fieldPrefix}.scope`} type="hidden" value={task.scope} />
      <input name={`${fieldPrefix}.category`} type="hidden" value={task.category} />
      <input name={`${fieldPrefix}.title`} type="hidden" value={task.title} />
      <input name={`${fieldPrefix}.timeHint`} type="hidden" value={task.timeHint} />
      <input
        name={`${fieldPrefix}.instructions`}
        type="hidden"
        value={task.instructions}
      />
      <input
        name={`${fieldPrefix}.relatedItem`}
        type="hidden"
        value={task.relatedItem}
      />
      {task.enabled ? (
        <input name={`${fieldPrefix}.enabled`} type="hidden" value="on" />
      ) : null}
      {task.required ? (
        <input name={`${fieldPrefix}.required`} type="hidden" value="on" />
      ) : null}
      {task.photoRequired ? (
        <input name={`${fieldPrefix}.photoRequired`} type="hidden" value="on" />
      ) : null}
    </>
  );
}

function formatFrequency(value: string | null) {
  if (!value) {
    return null;
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
