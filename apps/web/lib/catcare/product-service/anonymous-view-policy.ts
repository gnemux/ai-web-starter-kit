import { createHash } from "node:crypto";

import type { Database } from "../../supabase/database.types";

export function createAnonymousTaskSubmissionRef(
  scopeKey: string,
  taskId: string
) {
  return createHash("sha256")
    .update(`${scopeKey}:${taskId}`, "utf8")
    .digest("base64url")
    .slice(0, 32);
}

export function getAnonymousTaskVisitTimes(task: {
  category: Database["public"]["Tables"]["care_tasks"]["Row"]["category"];
  frequency: string | null;
  timeHint: string | null;
}) {
  const times = (task.timeHint ?? "")
    .split(/[，,]/)
    .map((time) => time.trim())
    .filter(isAnonymousVisitTime);

  return times.length > 0 ? times : getAnonymousFallbackTaskTimes(task);
}

export function isLegacyPrepareTask(task: { source: string; title: string }) {
  return task.source === "care_item" || task.title.includes("：准备 ");
}

function isAnonymousVisitTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function getAnonymousFallbackTaskTimes(task: {
  category: Database["public"]["Tables"]["care_tasks"]["Row"]["category"];
  frequency: string | null;
}) {
  const category = task.category ?? "other";
  const count =
    category === "meal" || category === "treat" || category === "medicine"
      ? getAnonymousDailyFrequencyCount(task.frequency)
      : 1;
  const slots: Record<string, string[]> = {
    environment: ["18:30"],
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

function getAnonymousDailyFrequencyCount(frequency: string | null) {
  const match = /^daily(?:_(\d+))?$/.exec(frequency ?? "");

  return Math.max(1, Math.min(4, Number(match?.[1] ?? "1") || 1));
}
