import { randomUUID } from "crypto";

import { EmptyState, ErrorState } from "@xwlc/ui";

import { CatCarePlusCircleIcon } from "../catcare-action-icons";
import { CatCareScenarioIcon } from "../catcare-item-type-icon";
import {
  CatCareButton,
  CatCareField,
  CatCarePanel,
  CatCareStepBar,
  catCareInputClass
} from "../owner-flow-components";
import { createCatCarePlanAction } from "../actions";
import { DateRangeInputsClient } from "./date-range-inputs-client";
import { PlanCreateSubmitButton } from "./plan-create-submit-button";
import {
  getCatCarePlanListWorkspace,
  type CatCarePlan
} from "@/lib/catcare/product-service";
import {
  formatCatCareLimit,
  getCatCarePlanLimits
} from "@/lib/catcare/plan-limits";
import { getAiTextReviewState } from "@/lib/services/ai";
import {
  formatAiCreditsAsUsesLabel,
  getAiCreditAllowanceUsage,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";
import { PaymentReturnNotice } from "@/app/account/payment/payment-return-notice";
import { PlansListClient } from "./plans-list-client";

const scenarioOptions = [
  ["business_trip", "出差", "短期出差或工作行程，需要他人照看猫咪。"],
  ["weekend_away", "周末外出", "周末或短时间外出游玩，需要临时照看。"],
  ["friend_visit", "朋友上门", "朋友来家中做客，需要临时照看。"]
] as const;

type PlansSearchParams = Promise<{
  cat_id?: string;
  checkout_result?: string;
  paywall?: string;
  payment_result?: string;
  plan_error?: string;
}>;

export default async function CatCarePlansPage({
  searchParams
}: {
  searchParams: PlansSearchParams;
}) {
  const [query, result, billingResult] = await Promise.all([
    searchParams,
    getCatCarePlanListWorkspace(),
    getCurrentBillingEntitlements()
  ]);
  const activePlans = result.ok
    ? result.data.plans.filter((plan) => !isHistoryPlan(plan))
    : [];
  const historyPlans = result.ok
    ? result.data.plans.filter(isHistoryPlan)
    : [];
  const currentPlan = billingResult.ok ? billingResult.data.planId : "free";
  const planLimits = getCatCarePlanLimits(currentPlan);
  const aiUsage = billingResult.ok
    ? getAiCreditAllowanceUsage(billingResult.data.entitlements.ai_tokens)
    : null;
  const hasAiQuota = aiUsage ? aiUsage.remaining > 0 : true;
  const aiReviewState = getAiTextReviewState();
  const generationRequestId = randomUUID();
  const showPlanPaywall = query.paywall === "ai_quota" || !hasAiQuota;

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="需检查"
          description={`${result.error.code}: ${result.error.message}`}
          title="照护计划暂时不可用"
        />
      ) : (
        <div className="mx-auto grid w-full max-w-[1196px] gap-6">
          <PaymentReturnNotice
            context="catcare"
            status={query.payment_result ?? query.checkout_result}
          />
          <div>
            <h1 className="text-3xl font-semibold text-[#101a32]">
              场景与智能输入
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#526177]">
              选择猫咪、出门场景和日期，系统会基于档案、习惯、用品和事件生成照护清单。
            </p>
          </div>
          <CatCareStepBar
            steps={[
              { active: true, label: "选择场景" },
              { label: "时间与频率" },
              { label: "智能输入总结" },
              { label: "生成清单" }
            ]}
          />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_27rem]">
            <CatCarePanel>
              <h2 className="text-2xl font-semibold text-[#101a32]">
                智能辅助生成照护清单
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                先选择照护场景和日期，系统会汇总真实资料并通过智能能力检查，生成一份可确认的任务清单。
              </p>
              <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#f7faf9] px-4 py-3 text-sm font-semibold leading-6 text-[#526177] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  智能生成会参考猫咪档案、喂养习惯、家庭用品、近期事件和补充说明。
                </p>
                <p className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#07847f] ring-1 ring-[#d9eee7]">
                  {aiReviewState.ok
                    ? `${formatPlanAiMode(aiReviewState.data.mode)} · ${formatPlanAiCost(aiReviewState.data.requestedCredits)} 次`
                    : aiReviewState.error.message}
                </p>
              </div>
              {result.data.cats.length > 0 ? (
                <form
                  action={createCatCarePlanAction}
                  className="mt-5 grid gap-4"
                >
                  <input
                    name="generationRequestId"
                    type="hidden"
                    value={generationRequestId}
                  />
                  {showPlanPaywall ? (
                    <PlanQuotaPaywallCard currentPlan={currentPlan} />
                  ) : null}
                  {query.plan_error === "validation" ? (
                    <PlanFormErrorCard />
                  ) : null}
                  <CatCareField label="照护猫咪">
                    <div className="grid gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2 sm:grid-cols-2">
                      {result.data.cats.map((cat, index) => {
                        const disabled =
                          planLimits.maxCats !== null && index >= planLimits.maxCats;

                        return (
                        <label
                          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-[#526177] ring-1 ring-[#e2e6ee] transition has-[:checked]:bg-[#07847f] has-[:checked]:text-white has-[:checked]:shadow-sm has-[:checked]:shadow-teal-900/15 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-slate-50 has-[:disabled]:text-slate-400"
                          key={cat.id}
                        >
                          <input
                            className="sr-only"
                            defaultChecked={!disabled}
                            disabled={disabled}
                            name="catIds"
                            type="checkbox"
                            value={cat.id}
                          />
                          {cat.name}
                        </label>
                        );
                      })}
                    </div>
                    {planLimits.maxCats !== null &&
                    result.data.cats.length > planLimits.maxCats ? (
                      <p className="mt-2 text-xs font-semibold leading-5 text-[#7a8699]">
                        当前{billingResult.ok ? "套餐" : "默认"}最多选择
                        {formatCatCareLimit(planLimits.maxCats, "只猫咪")}
                        生成照护计划；已保存猫咪不会被删除。
                      </p>
                    ) : null}
                  </CatCareField>
                  <CatCareField label="临时照护场景">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {scenarioOptions.map(([value, label, description], index) => (
                        <label
                          className="group relative grid min-h-36 cursor-pointer content-start gap-5 rounded-2xl border border-[#d9e0ea] bg-white p-5 text-left transition hover:border-[#9ccfc7] hover:bg-[#fbfdfc] has-[:checked]:border-[#07847f] has-[:checked]:bg-[#f2fbf8] has-[:checked]:shadow-sm has-[:checked]:shadow-teal-900/10"
                          key={value}
                        >
                          <input
                            className="sr-only"
                            defaultChecked={index === 0}
                            name="scenario"
                            type="radio"
                            value={value}
                          />
                          <span className="flex items-center gap-4">
                            <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${getScenarioIconTone(value)}`}>
                              <CatCareScenarioIcon
                                className="h-10 w-10"
                                scenario={value}
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block whitespace-nowrap text-xl font-semibold leading-7 text-[#101a32]">
                                {label}
                              </span>
                            </span>
                          </span>
                          <span className="block text-sm font-semibold leading-6 text-[#526177]">
                            {description}
                          </span>
                        </label>
                      ))}
                    </div>
                  </CatCareField>
                  <CatCareField label="每日上门次数">
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2">
                      {[
                        ["1", "1 次", "集中完成"],
                        ["2", "2 次", "早晚照护"],
                        ["3", "3 次", "少量多次"]
                      ].map(([value, label, description]) => (
                        <label
                          className="grid min-h-14 rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-[#526177] ring-1 ring-[#e2e6ee] transition has-[:checked]:bg-[#07847f] has-[:checked]:text-white has-[:checked]:shadow-sm has-[:checked]:shadow-teal-900/15"
                          key={value}
                        >
                          <input
                            className="sr-only"
                            defaultChecked={value === "2"}
                            name="visitCount"
                            type="radio"
                            value={value}
                          />
                          <span>{label}</span>
                          <span className="mt-1 text-xs opacity-80">
                            {description}
                          </span>
                        </label>
                      ))}
                    </div>
                  </CatCareField>
                  <DateRangeInputsClient />
                  <CatCareField label="额外交接说明">
                    <textarea
                      className={`${catCareInputClass} min-h-32 py-4 leading-6`}
                      name="handoffNotes"
                      placeholder="例如：不要让猫进阳台；钥匙放在门口密码盒。"
                    />
                  </CatCareField>
                  <PlanCreateSubmitButton disabled={!hasAiQuota} />
                </form>
              ) : (
                <div className="mt-8">
                  <EmptyState
                    description="先创建猫咪档案和喂养习惯，再生成照护计划。"
                    title="还没有猫咪档案"
                  />
                  <div className="mt-5 flex justify-center">
                    <CatCareButton href="/catcare/cats/new">
                      <CatCarePlusCircleIcon />
                      新建猫咪档案
                    </CatCareButton>
                  </div>
                </div>
              )}
            </CatCarePanel>

            <aside className="grid content-start gap-5">
              <CatCarePanel>
                <h2 className="text-2xl font-semibold text-[#101a32]">
                  计划记录
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                  进行中和历史计划放在这里，进入页面就能继续确认、查看执行日历或回看结果。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="w-fit rounded-full bg-[#f2fbf8] px-3 py-1 text-sm font-semibold text-[#07847f] ring-1 ring-[#d9eee7]">
                    {activePlans.length} 个进行中
                  </span>
                  <span className="w-fit rounded-full bg-[#f7f9fb] px-3 py-1 text-sm font-semibold text-[#526177] ring-1 ring-[#e2e6ee]">
                    {historyPlans.length} 个历史
                  </span>
                </div>
                <div className="mt-5">
                  <PlansListClient
                    activePlans={activePlans}
                    historyPlans={historyPlans}
                  />
                </div>
              </CatCarePanel>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}

function PlanQuotaPaywallCard({
  currentPlan
}: {
  currentPlan: "free" | "plus" | "pro";
}) {
  const checkoutHref =
    currentPlan === "pro"
      ? "/account/payment/checkout?price_id=ai_credit_pack_100k&return_to=/catcare/plans"
      : "/account/billing";

  return (
    <section className="rounded-2xl border border-[#f0d7a6] bg-[#fff9ed] p-5">
      <p className="text-xs font-semibold text-[#a16100]">智能次数不足</p>
      <h2 className="mt-2 text-xl font-semibold leading-tight text-[#101a32]">
        这次清单还没有生成
      </h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#6b5a42]">
        生成计划和结果复盘共用智能照护次数。购买补充包后会回到这里继续生成，不会丢失当前流程。
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <CatCareButton href={checkoutHref}>
          {currentPlan === "pro" ? "购买一次性智能补充包" : "查看套餐"}
        </CatCareButton>
        <CatCareButton href="/account/billing?return_to=/catcare/plans" variant="secondary">
          查看套餐权益
        </CatCareButton>
      </div>
    </section>
  );
}

function PlanFormErrorCard() {
  return (
    <section className="rounded-2xl border border-[#f0d7a6] bg-[#fff9ed] p-4">
      <p className="text-sm font-semibold leading-6 text-[#8a5a00]">
        请补全照护日期：开始日期不能早于今天，结束日期不能早于开始日期。
      </p>
    </section>
  );
}

function formatPlanAiMode(mode: string) {
  if (mode === "mock") {
    return "模拟智能";
  }

  if (mode === "noop") {
    return "空响应智能";
  }

  if (mode === "sandbox") {
    return "沙盒智能";
  }

  return "智能已接入";
}

function formatPlanAiCost(value: number) {
  return formatAiCreditsAsUsesLabel(value);
}

function isHistoryPlan(plan: CatCarePlan) {
  return plan.status === "closed" || plan.status === "reviewed";
}

function getScenarioIconTone(scenario: (typeof scenarioOptions)[number][0]) {
  if (scenario === "business_trip") {
    return "bg-[#e6f7f2]";
  }

  if (scenario === "friend_visit") {
    return "bg-[#fff4df]";
  }

  return "bg-[#eeefff]";
}
