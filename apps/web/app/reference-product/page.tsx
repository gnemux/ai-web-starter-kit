import {
  AppShell,
  Badge,
  BrandMark,
  Button,
  EmptyState,
  ErrorState,
  Panel
} from "@xwlc/ui";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { getWorkspaceNavItems } from "@/components/workspace-nav";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getReferenceProductPackageConsumption } from "@/lib/reference-product/package-consumption";
import {
  getReferenceProductWorkspace,
  type ReferenceCarePlan,
  type ReferenceCat
} from "@/lib/reference-product/product-service";
import { getCurrentAccount } from "@/lib/services/auth";

import { publishReferencePlanAction } from "./actions";
import { ReferenceCatForm, ReferencePlanForm } from "./reference-product-forms";

export default async function ReferenceProductPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect("/login?next=/reference-product");
  }

  const workspaceResult = await getReferenceProductWorkspace();
  const consumption = getReferenceProductPackageConsumption();
  const displayName = accountResult.data.profile?.displayName;
  const userLabel =
    displayName ||
    accountResult.data.user.email ||
    copy.referenceProduct.owner.eyebrow;

  return (
    <AppShell
      action={
        <AccountMenu
          avatarUrl={accountResult.data.profile?.avatarUrl}
          email={accountResult.data.user.email}
          labels={copy.common.accountMenu}
          name={userLabel}
          showDashboard={false}
        />
      }
      brand={<BrandMark subtitle={copy.referenceProduct.owner.shellSubtitle} />}
      navItems={getWorkspaceNavItems(copy, "referenceProduct", {
        includeDashboard: false
      })}
      user={{
        name: userLabel,
        role: accountResult.data.user.email
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {workspaceResult.ok ? (
          <ReferenceProductWorkspace
            ownerEmail={accountResult.data.user.email}
            cats={workspaceResult.data.cats}
            consumptionState={consumption.actorState}
            labels={copy.referenceProduct.owner}
            plans={workspaceResult.data.plans}
          />
        ) : (
          <ErrorState
            badgeLabel={copy.common.status.risk}
            description={`${workspaceResult.error.code}: ${workspaceResult.error.message}`}
            title={copy.referenceProduct.owner.serviceErrorTitle}
          />
        )}
      </div>
    </AppShell>
  );
}

function ReferenceProductWorkspace({
  cats,
  consumptionState,
  labels,
  ownerEmail,
  plans
}: {
  cats: ReferenceCat[];
  consumptionState: string;
  labels: ReturnType<typeof getDictionary>["referenceProduct"]["owner"];
  ownerEmail: string;
  plans: ReferenceCarePlan[];
}) {
  const publishedCount = plans.filter((plan) => plan.status === "published").length;
  const draftCount = plans.filter((plan) => plan.status === "draft").length;
  const submissionCount = plans.reduce(
    (total, plan) => total + plan.submissions.length,
    0
  );
  const activePlan =
    plans.find((plan) => plan.status === "published") ?? plans[0] ?? null;
  const activeCat = activePlan
    ? cats.find((item) => item.id === activePlan.catId)
    : cats[0];
  const serviceLabel =
    consumptionState === "verified_owner" ? "数据已连接" : "服务需检查";
  const flowSteps = [
    {
      label: "猫咪档案",
      value: cats.length > 0 ? `${cats.length} 个档案` : "待创建",
      tone: cats.length > 0 ? "ready" : "planned"
    },
    {
      label: "照护计划",
      value: plans.length > 0 ? `${plans.length} 份计划` : "待创建",
      tone: plans.length > 0 ? "ready" : "planned"
    },
    {
      label: "交接发布",
      value: publishedCount > 0 ? `${publishedCount} 份已发布` : "待发布",
      tone: publishedCount > 0 ? "ready" : "planned"
    },
    {
      label: "结果回收",
      value: submissionCount > 0 ? `${submissionCount} 条提交` : "等待提交",
      tone: submissionCount > 0 ? "ready" : "planned"
    }
  ] as const;

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="in-progress">CatCare Studio</Badge>
              <Badge tone={consumptionState === "verified_owner" ? "ready" : "risk"}>
                {serviceLabel}
              </Badge>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-normal text-slate-950">
              今天把猫咪交接安排好
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              把喂食、用药、门禁钥匙和异常处理放进一份交接单。照看者完成后，主人回到这里查看结果。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="#care-plan">创建照护计划</Button>
              <Button href="#product-account" variant="secondary">
                查看产品账户
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              当前交接
            </p>
            <h2 className="mt-3 text-lg font-semibold text-slate-950">
              {activePlan?.title ?? "还没有计划"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {activeCat?.name ?? "先创建猫咪档案"}
              {activePlan?.startOn || activePlan?.endOn ? (
                <>
                  {" · "}
                  {activePlan.startOn ?? labels.planList.openDate} -{" "}
                  {activePlan.endOn ?? labels.planList.openDate}
                </>
              ) : null}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label={labels.metrics.cats} value={cats.length} compact />
              <Metric label={labels.metrics.drafts} value={draftCount} compact />
              <Metric label={labels.metrics.published} value={publishedCount} compact />
            </div>
          </div>
        </div>

        <div className="grid border-t border-slate-200 bg-white sm:grid-cols-4">
          {flowSteps.map((step, index) => (
            <div
              className={`border-t border-slate-100 p-4 sm:border-l sm:border-t-0 ${
                index === 0 ? "sm:border-l-0" : ""
              }`}
              key={step.label}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Badge tone={step.tone}>{step.value}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="grid content-start gap-6">
          <Panel id="care-plan">
            <div className="grid gap-6 lg:grid-cols-2">
              <ReferenceCatForm labels={labels} />
              <ReferencePlanForm cats={cats} labels={labels} />
            </div>
          </Panel>

          <CareBoard
            cats={cats}
            labels={labels}
            plans={plans}
            submissionCount={submissionCount}
          />
        </div>

        <div className="grid content-start gap-6">
          <ProductAccountPanel
            labels={labels}
            ownerEmail={ownerEmail}
            publishedCount={publishedCount}
          />
          <SystemBoundaryPanel
            consumptionState={consumptionState}
            labels={labels}
            serviceLabel={serviceLabel}
          />
        </div>
      </div>
    </div>
  );
}

function CareBoard({
  cats,
  labels,
  plans,
  submissionCount
}: {
  cats: ReferenceCat[];
  labels: ReturnType<typeof getDictionary>["referenceProduct"]["owner"];
  plans: ReferenceCarePlan[];
  submissionCount: number;
}) {
  return (
    <Panel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {labels.planList.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            每份计划都是一张可交接的照护卡。发布后，照看结果会回收到同一张卡片。
          </p>
        </div>
        <Badge tone={submissionCount > 0 ? "ready" : "planned"}>
          {submissionCount > 0
            ? labels.planList.hasSubmissions
            : labels.planList.noSubmissions}
        </Badge>
      </div>

      {plans.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {plans.map((plan) => (
            <PlanCard
              cat={cats.find((item) => item.id === plan.catId)}
              key={plan.id}
              labels={labels}
              plan={plan}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            description={labels.planList.emptyDescription}
            title={labels.planList.emptyTitle}
          />
        </div>
      )}
    </Panel>
  );
}

function ProductAccountPanel({
  labels,
  ownerEmail,
  publishedCount
}: {
  labels: ReturnType<typeof getDictionary>["referenceProduct"]["owner"];
  ownerEmail: string;
  publishedCount: number;
}) {
  return (
    <Panel id="product-account">
      <div>
        <h2 className="text-base font-semibold text-slate-950">
          产品账户
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          管理主人资料、照护套餐、支付入口和 AI 辅助额度。
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <CapabilityRow
          actionHref="/account"
          actionLabel={labels.capabilities.accountAction}
          description={ownerEmail}
          label={labels.capabilities.account}
          status={labels.capabilities.connected}
          tone="ready"
        />
        <CapabilityRow
          actionHref="/account/billing"
          actionLabel={labels.capabilities.billingAction}
          description={
            publishedCount > 0
              ? "已有发布计划，后续可按套餐开放分享次数和支付动作。"
              : "发布第一份计划后，这里会承接照护套餐和支付动作。"
          }
          label={labels.capabilities.billing}
          status={labels.capabilities.planned}
          tone="planned"
        />
        <CapabilityRow
          actionHref="/account/usage"
          actionLabel={labels.capabilities.usageAction}
          description="照护摘要、提醒文案和异常整理会使用这里的 AI Credit。"
          label={labels.capabilities.usage}
          status={labels.capabilities.planned}
          tone="planned"
        />
      </div>
    </Panel>
  );
}

function SystemBoundaryPanel({
  consumptionState,
  labels,
  serviceLabel
}: {
  consumptionState: string;
  labels: ReturnType<typeof getDictionary>["referenceProduct"]["owner"];
  serviceLabel: string;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">
          {labels.packageGate}
        </h2>
        <Badge tone={consumptionState === "verified_owner" ? "ready" : "risk"}>
          {serviceLabel}
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        账户和数据服务可用；照护业务对象保留在产品侧，方便后续扩展成独立猫咪照护产品。
      </p>
    </Panel>
  );
}

function CapabilityRow({
  actionHref,
  actionLabel,
  description,
  label,
  status,
  tone
}: {
  actionHref: string;
  actionLabel: string;
  description: string;
  label: string;
  status: string;
  tone: "ready" | "planned";
}) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
          <Badge tone={tone}>{status}</Badge>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <Button href={actionHref} variant="secondary">
        {actionLabel}
      </Button>
    </div>
  );
}

function Metric({
  compact,
  label,
  value
}: {
  compact?: boolean;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <p className="text-xs font-medium uppercase tracking-normal text-slate-500">
        {label}
      </p>
      <p
        className={
          compact
            ? "mt-1 text-xl font-semibold text-slate-950"
            : "mt-2 text-2xl font-semibold text-slate-950"
        }
      >
        {value}
      </p>
    </div>
  );
}

function PlanCard({
  cat,
  labels,
  plan
}: {
  cat?: ReferenceCat;
  labels: ReturnType<typeof getDictionary>["referenceProduct"]["owner"];
  plan: ReferenceCarePlan;
}) {
  const statusTone =
    plan.status === "published"
      ? "ready"
      : plan.status === "closed"
        ? "neutral"
        : plan.status === "reviewed"
          ? "in-progress"
          : "planned";

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950">
              {plan.title}
            </h3>
            <Badge tone={statusTone}>{labels.status[plan.status]}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {cat?.name ?? labels.planList.unknownCat}
            {plan.startOn || plan.endOn ? (
              <>
                {" · "}
                {plan.startOn ?? labels.planList.openDate} -{" "}
                {plan.endOn ?? labels.planList.openDate}
              </>
            ) : null}
          </p>
          {plan.handoffNotes ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {plan.handoffNotes}
            </p>
          ) : null}
        </div>

        {plan.status === "draft" ? (
          <form action={publishReferencePlanAction}>
            <input name="planId" type="hidden" value={plan.id} />
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-slate-900/10 transition hover:bg-slate-800"
              type="submit"
            >
              {labels.planList.publish}
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            {labels.planList.tasks}
          </h4>
          <div className="mt-2 grid gap-2">
            {plan.tasks.map((task) => (
              <div
                className="rounded-md border border-slate-200 bg-white px-3 py-2"
                key={task.id}
              >
                <p className="text-sm font-medium text-slate-950">
                  {task.title}
                </p>
                {task.instructions ? (
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {task.instructions}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            {labels.planList.submissions}
          </h4>
          {plan.submissions.length > 0 ? (
            <div className="mt-2 grid gap-2">
              {plan.submissions.map((submission) => (
                <div
                  className="rounded-md border border-slate-200 bg-white px-3 py-2"
                  key={submission.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-950">
                      {submission.submittedByLabel}
                    </p>
                    <Badge
                      tone={
                        submission.status === "exception" ? "risk" : "ready"
                      }
                    >
                      {labels.submissionStatus[submission.status]}
                    </Badge>
                  </div>
                  {submission.note ? (
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {submission.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-500">
              {labels.planList.submissionsEmpty}
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
