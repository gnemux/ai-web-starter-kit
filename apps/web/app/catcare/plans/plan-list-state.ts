import type { CatCarePlan } from "@/lib/catcare/product-service";

type PlanListFacts = Pick<CatCarePlan, "endOn" | "status">;

export function getTodayInShanghai(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric"
  }).format(now);
}

export function isPlanOverdue(plan: PlanListFacts, today: string) {
  return Boolean(plan.endOn && plan.endOn < today);
}

export function isHistoryPlan(plan: PlanListFacts, today: string) {
  return (
    plan.status === "closed" ||
    plan.status === "reviewed" ||
    isPlanOverdue(plan, today)
  );
}
