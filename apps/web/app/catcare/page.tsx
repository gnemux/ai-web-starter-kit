import { Badge, Button, ErrorState } from "@xwlc/ui";
import {
  type BillingEntitlementSnapshot,
  type ServiceResult
} from "@xwlc/core";
import Link from "next/link";

import {
  CatCareAiCreditIcon,
  CatCareAiChecklistIcon,
  CatCareCareEventsIcon,
  CatCareCarePlanIcon,
  CatCareCarePlanMetricIcon,
  CatCareCatCountIcon,
  CatCareFeedingRoutineIcon,
  CatCarePetSuppliesIcon,
  CatCarePendingIcon,
  CatCareProfileIcon,
  CatCareShareLinkIcon
} from "@/components/catcare-icons";
import {
  CatCareHeroImage,
  CatCareMetricCard
} from "@/components/catcare-ui";
import { getDictionary } from "@/lib/i18n";
import { getCurrentBillingEntitlements } from "@/lib/services/billing";
import {
  getCatCareWorkspace,
  type CatCareCatSummary
} from "@/lib/catcare/product-service";

import { getCatCareContentContext } from "./catcare-shell";
import { CatCarePlusCircleIcon } from "./catcare-action-icons";

export default async function CatCarePage() {
  const [context, workspaceResult, billingResult] = await Promise.all([
    getCatCareContentContext(),
    getCatCareWorkspace(),
    getCurrentBillingEntitlements()
  ]);
  const { copy } = context;

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        {workspaceResult.ok ? (
          <CatCareWorkspace
            cats={workspaceResult.data.cats}
            billingLabels={copy.account.billing}
            billingResult={billingResult}
            eventCount={workspaceResult.data.eventCount}
            itemCount={workspaceResult.data.itemCount}
            labels={copy.catcare.owner}
            planCount={workspaceResult.data.planCount}
            publishedPlanCount={workspaceResult.data.publishedPlanCount}
            routineCount={workspaceResult.data.routineCount}
            submissionCount={workspaceResult.data.submissionCount}
          />
        ) : (
          <ErrorState
            badgeLabel={copy.common.status.risk}
            description={`${workspaceResult.error.code}: ${workspaceResult.error.message}`}
            title={copy.catcare.owner.serviceErrorTitle}
          />
        )}
      </div>
    </>
  );
}

function CatCareWorkspace({
  billingLabels,
  billingResult,
  cats,
  eventCount,
  itemCount,
  labels,
  planCount,
  publishedPlanCount,
  routineCount,
  submissionCount
}: {
  billingLabels: ReturnType<typeof getDictionary>["account"]["billing"];
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  cats: CatCareCatSummary[];
  eventCount: number;
  itemCount: number;
  labels: ReturnType<typeof getDictionary>["catcare"]["owner"];
  planCount: number;
  publishedPlanCount: number;
  routineCount: number;
  submissionCount: number;
}) {
  const currentPlan = billingResult.ok ? billingResult.data.planId : "free";
  const creditLabel = billingResult.ok
    ? formatCatCareAiSummaryLabel(currentPlan, billingLabels)
    : labels.dashboard.creditUnavailable;
  const onboarding = getOnboardingProgress({
    cats,
    eventCount,
    itemCount,
    planCount,
    publishedPlanCount,
    routineCount
  });
  const firstCatQuery = cats[0]?.id
    ? `?cat_id=${encodeURIComponent(cats[0].id)}`
    : "";

  return (
    <div className="grid gap-5">
      <DashboardHero
        labels={labels}
        planLabel={billingLabels.planNames[currentPlan]}
      />

      <ActivationPanel
        firstCatId={cats[0]?.id}
        hasCats={cats.length > 0}
        labels={labels}
        onboarding={onboarding}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Link className="block transition hover:-translate-y-0.5" href="/catcare/cats">
          <CatCareMetricCard
            icon={<CatCareCatCountIcon className="h-8 w-8" />}
            label={labels.metrics.cats}
            sublabel={labels.dashboard.catsSublabel}
            value={cats.length}
          />
        </Link>
        <Link
          className="block transition hover:-translate-y-0.5"
          href={`/catcare/plans${firstCatQuery}`}
        >
          <CatCareMetricCard
            icon={<CatCareCarePlanMetricIcon className="h-8 w-8" />}
            label={labels.metrics.published}
            sublabel={labels.dashboard.plansSublabel}
            value={planCount}
          />
        </Link>
        <a className="block transition hover:-translate-y-0.5" href="/catcare/results">
          <CatCareMetricCard
            icon={<CatCarePendingIcon className="h-8 w-8" />}
            label={labels.planList.noSubmissions}
            sublabel={labels.dashboard.pendingSublabel}
            value={submissionCount}
          />
        </a>
        <CatCareMetricCard
          icon={<CatCareAiCreditIcon className="h-8 w-8" />}
          label={labels.metrics.aiCredit}
          sublabel={labels.dashboard.creditSublabel}
          value={creditLabel}
        />
      </div>

      <Button
        className="min-h-14 w-full justify-center rounded-xl bg-teal-700 text-base hover:bg-teal-800"
        href="/catcare/cats/new"
        icon={<CatCarePlusCircleIcon />}
      >
        {labels.dashboard.addCatCta}
      </Button>

    </div>
  );
}

function DashboardHero({
  labels,
  planLabel
}: {
  labels: ReturnType<typeof getDictionary>["catcare"]["owner"];
  planLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.04]">
      <div className="grid min-h-56 gap-0 lg:grid-cols-[minmax(0,1fr)_32rem]">
        <div className="min-w-0 p-6 sm:p-8 lg:p-9">
          <Badge tone="neutral">{planLabel}</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950">
            {labels.dashboard.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            {labels.dashboard.description}
          </p>
        </div>

        <div className="bg-[#fff8f0]">
          <CatCareHeroImage className="h-full" />
        </div>
      </div>
    </section>
  );
}

function ActivationPanel({
  firstCatId,
  hasCats,
  labels,
  onboarding
}: {
  firstCatId?: string;
  hasCats: boolean;
  labels: ReturnType<typeof getDictionary>["catcare"]["owner"];
  onboarding: OnboardingProgress;
}) {
  const catQuery = firstCatId ? `?cat_id=${encodeURIComponent(firstCatId)}` : "";
  const steps = [
    {
      action: labels.catForm.submit,
      href: hasCats ? "/catcare/cats" : "/catcare/cats/new",
      icon: <CatCareProfileIcon />,
      title: labels.sections.cats.title
    },
    {
      action: labels.sections.routines.primary,
      href: `/catcare/routines${catQuery}`,
      icon: <CatCareFeedingRoutineIcon />,
      title: labels.sections.routines.title
    },
    {
      action: labels.sections.items.primary,
      href: `/catcare/items${catQuery}`,
      icon: <CatCarePetSuppliesIcon />,
      title: labels.sections.items.title
    },
    {
      action: labels.sections.events.primary,
      href: `/catcare/events${catQuery}`,
      icon: <CatCareCareEventsIcon />,
      title: labels.sections.events.title
    },
    {
      action: labels.hero.primary.replace("智能", "").replace(" with AI", ""),
      href: `/catcare/plans${catQuery}`,
      icon: <CatCareAiChecklistIcon />,
      title: labels.dashboard.aiChecklist
    },
    {
      action: labels.planList.publish,
      href: `/catcare/plans${catQuery}`,
      icon: <CatCareShareLinkIcon />,
      title: labels.dashboard.publishShare
    }
  ];
  const stepCountLabel = labels.dashboard.workflowStepCount.replace(/^4/, "6");

  return (
    <section
      className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm shadow-slate-900/[0.04] sm:px-8 sm:py-7"
      id="activation"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
          {labels.dashboard.progressTitle} ({stepCountLabel})
        </h2>
        <span className="text-2xl font-semibold text-slate-500 sm:text-3xl">
          {onboarding.label}
        </span>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-teal-600"
          style={{ width: `${onboarding.percent}%` }}
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-6 lg:gap-0">
        {steps.map((step, index) => (
          <Link
            className="group relative grid min-h-32 cursor-pointer justify-items-center rounded-2xl text-center outline-none transition hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60"
            href={step.href}
            key={step.title}
          >
            {index < steps.length - 1 ? (
              <span className="absolute left-[calc(50%+2.35rem)] top-[1.35rem] hidden h-px w-[calc(100%-4.7rem)] border-t-2 border-dashed border-teal-200 lg:block" />
            ) : null}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f7f2] text-lg font-semibold text-teal-700 ring-8 ring-white">
              {index + 1}
            </span>
            <span className="mt-4 flex h-11 w-11 items-center justify-center text-teal-700 outline-none [&_img]:h-10 [&_img]:w-10 [&_svg]:h-10 [&_svg]:w-10">
              {step.icon}
            </span>
            <h3 className="mt-4 whitespace-nowrap text-lg font-semibold leading-6 text-slate-950">
              {step.title}
            </h3>
            <p className="mt-1 whitespace-nowrap text-base leading-6 text-slate-500">
              {step.action}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

type OnboardingProgress = {
  label: string;
  percent: number;
};

function getOnboardingProgress({
  cats,
  eventCount,
  itemCount,
  planCount,
  publishedPlanCount,
  routineCount
}: {
  cats: CatCareCatSummary[];
  eventCount: number;
  itemCount: number;
  planCount: number;
  publishedPlanCount: number;
  routineCount: number;
}): OnboardingProgress {
  const completedSteps = [
    cats.length > 0,
    routineCount > 0,
    itemCount > 0,
    eventCount > 0 || planCount > 0,
    planCount > 0,
    publishedPlanCount > 0
  ].filter(Boolean).length;
  const percent = Math.round((completedSteps / 6) * 100);

  return {
    label: `${percent}%`,
    percent
  };
}

function formatCatCareAiSummaryLabel(
  planId: string,
  labels: ReturnType<typeof getDictionary>["account"]["billing"]
) {
  return planId === "pro"
    ? labels.catcareDisplay.proCreditSummary
    : labels.catcareDisplay.freeCreditSummary;
}
