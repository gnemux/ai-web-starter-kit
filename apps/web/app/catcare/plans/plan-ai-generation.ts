import type { CreateCatCarePlanContext } from "@/lib/catcare/product-service/plans";

export function buildCatCarePlanGenerationPrompt(
  context: CreateCatCarePlanContext
) {
  return [
    "为主人生成猫咪临时照护清单，输出中文，简洁、可执行。",
    "只能依据结构化上下文，不要编造联系人、医疗诊断或未提供的细节。",
    `计划：${context.input.title}`,
    `场景：${formatPlanScenario(context.input.scenario)}`,
    `照护猫咪：${context.cats.map((cat) => cat.name).join("、")}`,
    `日期：${context.input.startOn ?? "未设置"} 至 ${context.input.endOn ?? context.input.startOn ?? "未设置"}`,
    `每日上门次数：${context.input.visitCount}`,
    `生成依据：${context.routineCount} 条习惯，${context.itemCount} 个用品，${context.eventCount} 条近期事件。`,
    `生成结果：${context.taskCount} 项任务。`,
    context.input.handoffNotes ? "主人补充：有额外交接说明。" : "主人补充：无。"
  ].join("\n");
}

function formatPlanScenario(scenario: string) {
  if (scenario === "business_trip") {
    return "出差";
  }

  if (scenario === "friend_visit") {
    return "朋友上门";
  }

  return "周末外出";
}
