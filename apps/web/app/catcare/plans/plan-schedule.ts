import type { CatCarePlan, CatCareTask } from "@/lib/catcare/product-service";

export type PlanScheduleDay = {
  date: string;
  entries: PlanScheduleEntry[];
};

export type PlanScheduleEntry = {
  task: CatCareTask;
  timeLabel: string | null;
};

export function buildPlanSchedule(plan: CatCarePlan): PlanScheduleDay[] {
  const dates = getPlanDates(plan);

  if (dates.length === 0) {
    return [];
  }

  const days = new Map(dates.map((date) => [date, [] as PlanScheduleEntry[]]));

  for (const task of plan.tasks) {
    if (!task.enabled || isLegacyPrepareTask(task)) {
      continue;
    }

    for (const date of getTaskDates(task, dates)) {
      for (const timeLabel of getTaskTimes(task)) {
        days.get(date)?.push({ task, timeLabel });
      }
    }
  }

  return dates.map((date) => ({
    date,
    entries: sortScheduleEntries(days.get(date) ?? [])
  }));
}

function isLegacyPrepareTask(task: CatCareTask) {
  return task.source === "care_item" || task.title.includes("：准备 ");
}

function getPlanDates(plan: CatCarePlan) {
  if (!plan.startOn) {
    return [];
  }

  const start = parseDate(plan.startOn);
  const end = parseDate(plan.endOn ?? plan.startOn);

  if (!start || !end || end < start) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function getTaskDates(task: CatCareTask, dates: string[]) {
  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(
    task.frequency ?? ""
  );

  if (!match) {
    return [dates[0]];
  }

  if (match[1] === "daily") {
    return dates;
  }

  if (match[1] === "every_2_days") {
    const offset = stableOffset(task, Math.min(2, dates.length));

    return dates.filter((_, index) => index % 2 === offset);
  }

  const count = Math.max(1, Number(match[2] ?? "1"));
  const result: string[] = [];

  // ponytail: deterministic jitter prevents all weekly tasks landing on day one; store task instances when real check-in scheduling arrives.
  for (let start = 0; start < dates.length; start += 7) {
    const week = dates.slice(start, start + 7);
    const slots = Math.min(count, week.length);
    const offset = stableOffset(task, week.length);
    const indexes = new Set<number>();

    for (let index = 0; index < slots; index += 1) {
      indexes.add((Math.floor((index * week.length) / slots) + offset) % week.length);
    }

    Array.from(indexes)
      .sort((left, right) => left - right)
      .forEach((index) => result.push(week[index]));
  }

  return Array.from(new Set(result));
}

function getTaskTimes(task: CatCareTask) {
  const times = (task.timeHint ?? "")
    .split(/[，,]/)
    .map((time) => time.trim())
    .filter((time) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(time))
    .filter(Boolean);

  return times.length > 0 ? times : getFallbackTaskTimes(task);
}

function getFallbackTaskTimes(task: CatCareTask) {
  const category = task.category ?? "other";
  const count =
    category === "meal" || category === "treat" || category === "medicine"
      ? getDailyFrequencyCount(task.frequency)
      : 1;
  const slots: Record<string, string[]> = {
    litter: ["18:30"],
    meal: ["08:30", "18:30", "14:00"],
    medicine: ["08:30", "18:30"],
    observe: ["18:30"],
    other: ["18:30"],
    play: ["18:30"],
    treat: ["18:30", "14:00"],
    water: ["08:30"]
  };

  return (slots[category] ?? slots.other).slice(0, count);
}

function getDailyFrequencyCount(frequency: string | null) {
  const match = /^daily(?:_(\d+))?$/.exec(frequency ?? "");

  return Math.max(1, Math.min(4, Number(match?.[1] ?? "1") || 1));
}

function sortScheduleEntries(entries: PlanScheduleEntry[]) {
  return entries.sort((left, right) => {
    const leftTime = getTimeSortValue(left.timeLabel);
    const rightTime = getTimeSortValue(right.timeLabel);

    return (
      leftTime - rightTime ||
      getCategoryFlowOrder(left.task.category) -
        getCategoryFlowOrder(right.task.category) ||
      left.task.title.localeCompare(right.task.title, "zh-Hans-CN")
    );
  });
}

function getCategoryFlowOrder(category: CatCareTask["category"]) {
  return {
    meal: 10,
    medicine: 20,
    water: 30,
    treat: 40,
    play: 50,
    litter: 60,
    observe: 70,
    environment: 80,
    other: 90
  }[category ?? "other"];
}

function getTimeSortValue(time: string | null) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? "");

  if (!match) {
    return 24 * 60 + 1;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function stableOffset(task: CatCareTask, modulo: number) {
  if (modulo <= 1) {
    return 0;
  }

  let hash = 0;
  const seed = `${task.id}:${task.title}`;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash % modulo;
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
