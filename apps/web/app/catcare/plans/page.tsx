import { EmptyState, ErrorState } from "@xwlc/ui";

import {
  CatCarePlusCircleIcon,
  CatCareSaveIcon
} from "../catcare-action-icons";
import {
  CatCareButton,
  CatCareField,
  CatCarePanel,
  CatCareStepBar,
  catCareInputClass
} from "../owner-flow-components";
import { createCatCarePlanAction } from "../actions";
import { DateRangeInputsClient } from "./date-range-inputs-client";
import {
  getCatCarePlanListWorkspace,
  type CatCarePlan
} from "@/lib/catcare/product-service";
import { PlansListClient } from "./plans-list-client";

const scenarioOptions = [
  ["weekend_away", "周末出门", "适合 1-3 天短期照护"],
  ["business_trip", "出差", "适合工作日多天照护"],
  ["friend_visit", "朋友上门", "适合熟人临时代看"],
  ["other", "其它", "自定义临时场景"]
] as const;

type PlansSearchParams = Promise<{ cat_id?: string }>;

export default async function CatCarePlansPage({
  searchParams
}: {
  searchParams: PlansSearchParams;
}) {
  await searchParams;
  const result = await getCatCarePlanListWorkspace();
  const activePlans = result.ok
    ? result.data.plans.filter((plan) => !isHistoryPlan(plan))
    : [];
  const historyPlans = result.ok
    ? result.data.plans.filter(isHistoryPlan)
    : [];

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="Needs review"
          description={`${result.error.code}: ${result.error.message}`}
          title="照护计划暂时不可用"
        />
      ) : (
        <div className="mx-auto grid w-full max-w-[1196px] gap-6">
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

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_25rem]">
            <CatCarePanel>
              <h2 className="text-2xl font-semibold text-[#101a32]">
                生成清单
              </h2>
              {result.data.cats.length > 0 ? (
                <form
                  action={createCatCarePlanAction}
                  className="mt-5 grid gap-4"
                >
                  <CatCareField label="照护猫咪">
                    <div className="grid gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2 sm:grid-cols-2">
                      {result.data.cats.map((cat) => (
                        <label
                          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-[#526177] ring-1 ring-[#e2e6ee] transition has-[:checked]:bg-[#07847f] has-[:checked]:text-white has-[:checked]:shadow-sm has-[:checked]:shadow-teal-900/15"
                          key={cat.id}
                        >
                          <input
                            className="sr-only"
                            defaultChecked={true}
                            name="catIds"
                            type="checkbox"
                            value={cat.id}
                          />
                          {cat.name}
                        </label>
                      ))}
                    </div>
                  </CatCareField>
                  <CatCareField label="场景">
                    <div className="grid gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2">
                      {scenarioOptions.map(([value, label, description], index) => (
                        <label
                          className="grid min-h-14 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#526177] ring-1 ring-[#e2e6ee] transition has-[:checked]:bg-[#07847f] has-[:checked]:text-white has-[:checked]:shadow-sm has-[:checked]:shadow-teal-900/15"
                          key={value}
                        >
                          <input
                            className="sr-only"
                            defaultChecked={index === 0}
                            name="scenario"
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
                  <CatCareButton fullWidth type="submit">
                    <CatCareSaveIcon />
                    生成并确认清单
                  </CatCareButton>
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
                  智能输入总结
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                  生成会引用猫咪档案、喂养习惯、家庭用品、近 30 天事件和主人备注。
                </p>
                <img
                  alt=""
                  aria-hidden="true"
                  className="mt-4 h-40 w-full rounded-2xl object-contain"
                  src="/catcare/card-cat-free.png"
                />
                <div className="mt-4 grid gap-3">
                  <AiInputRow label="猫咪档案" value={`${result.data.cats.length} 只猫咪`} />
                  <AiInputRow label="喂养习惯" value="已设置日常习惯" />
                  <AiInputRow label="食物用品" value="家庭用品库" />
                  <AiInputRow label="近 30 天事件" value="事件记录会参与建议" />
                  <AiInputRow label="主人备注" value="随本次计划提交" />
                </div>
              </CatCarePanel>
            </aside>
          </div>

          <CatCarePanel>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#101a32]">
                  已有计划
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                  生成新计划是主流程；进行中和历史计划放在这里统一查看。
                </p>
              </div>
              <span className="w-fit rounded-full bg-[#f2fbf8] px-3 py-1 text-sm font-semibold text-[#07847f] ring-1 ring-[#d9eee7]">
                {activePlans.length} 个进行中
              </span>
            </div>
            <PlansListClient
              activePlans={activePlans}
              historyPlans={historyPlans}
            />
          </CatCarePanel>
        </div>
      )}
    </>
  );
}

function isHistoryPlan(plan: CatCarePlan) {
  return plan.status === "closed" || plan.status === "reviewed";
}

function AiInputRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e6ee] bg-[#fbfdfc] px-4 py-3">
      <span className="text-sm font-semibold text-[#526177]">{label}</span>
      <span className="text-sm font-semibold text-[#07847f]">{value}</span>
    </div>
  );
}
