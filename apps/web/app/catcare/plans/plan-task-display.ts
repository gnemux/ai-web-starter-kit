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

export function formatOwnerLabel(owner: string | null | undefined) {
  return !owner || owner === "家庭共用" ? "全部猫咪" : owner;
}

export function getOwnerTagStyle(owner: string | null | undefined) {
  const label = formatOwnerLabel(owner);

  if (label === "全部猫咪") {
    return "bg-[#e6f7f2] text-[#07847f] ring-[#bfe5d7]";
  }

  if (label === "汤圆") {
    return "bg-[#e6f7f2] text-[#07847f] ring-[#bfe5d7]";
  }

  if (label === "饺子") {
    return "bg-[#fff4e8] text-[#9a5b16] ring-[#efd1ad]";
  }

  return label.charCodeAt(0) % 2 === 0
    ? "bg-[#fff4e8] text-[#9a5b16] ring-[#efd1ad]"
    : "bg-[#eef4ff] text-[#315a9f] ring-[#cddbf8]";
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
