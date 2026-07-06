import type { PlanScheduleEntry } from "./plan-schedule";

export function formatTaskAction(title: string) {
  const separatorIndex = title.indexOf("：");

  return separatorIndex < 1 ? title : title.slice(separatorIndex + 1).trim();
}

export function getCategoryLabel(category: PlanScheduleEntry["task"]["category"]) {
  return {
    environment: "环境",
    litter: "清洁",
    meal: "喂食",
    medicine: "用药",
    observe: "观察",
    other: "其它",
    play: "互动",
    treat: "零食",
    water: "饮水"
  }[category ?? "other"];
}

export function getCategoryStyle(category: PlanScheduleEntry["task"]["category"]) {
  if (category === "medicine" || category === "observe") {
    return "bg-[#fff8e6] text-[#8a5a00]";
  }

  if (category === "litter" || category === "water") {
    return "bg-[#eef4ff] text-[#315a9f]";
  }

  if (category === "play") {
    return "bg-[#fff0ed] text-[#b7352c]";
  }

  return "bg-[#f2fbf8] text-[#07847f]";
}

export function isAttentionEntry(entry: PlanScheduleEntry) {
  return (
    entry.task.source === "event" ||
    entry.task.category === "observe" ||
    entry.task.title.includes("准备 ")
  );
}

export function parseTaskTitle(title: string) {
  const separatorIndex = title.indexOf("：");

  if (separatorIndex < 1) {
    return { action: title, owner: null };
  }

  return {
    action: title.slice(separatorIndex + 1).trim(),
    owner: title.slice(0, separatorIndex).trim()
  };
}
