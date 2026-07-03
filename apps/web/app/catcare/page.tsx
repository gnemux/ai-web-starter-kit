import { Badge, Button, ErrorState } from "@xwlc/ui";
import {
  type BillingEntitlementSnapshot,
  type ServiceResult
} from "@xwlc/core";

import {
  CatCareAddCatIcon,
  CatCareAiCreditIcon,
  CatCareAiChecklistIcon,
  CatCareCareEventsIcon,
  CatCareCarePlanIcon,
  CatCareCarePlanMetricIcon,
  CatCareCatCountIcon,
  CatCareFeedingRoutineIcon,
  CatCarePendingIcon,
  CatCareProfileIcon,
  CatCareShareLinkIcon
} from "@/components/catcare-icons";
import {
  CatCareHeroImage,
  CatCareMetricCard
} from "@/components/catcare-ui";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getCurrentBillingEntitlements } from "@/lib/services/billing";
import {
  getCatCareWorkspace,
  type CatCareCat,
  type CatCarePlan
} from "@/lib/catcare/product-service";

import { CatCareAppShell, getCatCarePageContext } from "./catcare-shell";

export default async function CatCarePage() {
  const context = await getCatCarePageContext("/catcare");
  const { account, copy } = context;
  const [workspaceResult, billingResult] = await Promise.all([
    getCatCareWorkspace(),
    getCurrentBillingEntitlements()
  ]);
  const currentPlanId = billingResult.ok ? billingResult.data.planId : "free";
  const creditLabel = billingResult.ok
    ? formatCatCareAiSummaryLabel(currentPlanId, copy.account.billing)
    : copy.catcare.owner.dashboard.creditUnavailable;

  return (
    <CatCareAppShell
      activeNav="catcare"
      context={context}
      topBar={
        <CatCareTopBar
          creditLabel={creditLabel}
          languageLabels={copy.common}
          labels={copy.catcare.owner}
          locale={context.locale}
          planLabel={copy.account.billing.planNames[currentPlanId]}
        />
      }
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        {workspaceResult.ok ? (
          <CatCareWorkspace
            cats={workspaceResult.data.cats}
            billingLabels={copy.account.billing}
            billingResult={billingResult}
            labels={copy.catcare.owner}
            plans={workspaceResult.data.plans}
          />
        ) : (
          <ErrorState
            badgeLabel={copy.common.status.risk}
            description={`${workspaceResult.error.code}: ${workspaceResult.error.message}`}
            title={copy.catcare.owner.serviceErrorTitle}
          />
        )}
      </div>
    </CatCareAppShell>
  );
}

function CatCareTopBar({
  creditLabel,
  languageLabels,
  labels,
  locale,
  planLabel
}: {
  creditLabel: string;
  languageLabels: ReturnType<typeof getDictionary>["common"];
  labels: ReturnType<typeof getDictionary>["catcare"]["owner"];
  locale: Locale;
  planLabel: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-6">
      <h1 className="truncate text-3xl font-semibold tracking-normal text-slate-950">
        {labels.dashboard.topTitle}
      </h1>
      <div className="flex shrink-0 items-center gap-6">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span>{labels.dashboard.currentPlanLabel}</span>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-base text-slate-950">
            {planLabel}
          </span>
        </span>
        <span className="inline-flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span>{labels.dashboard.aiCreditLabel}</span>
          <span className="max-w-[8rem] truncate rounded-full bg-[#e6f7f2] px-4 py-2 text-base font-semibold text-teal-800">
            {creditLabel}
          </span>
        </span>
        <LanguageSwitcher labels={languageLabels} locale={locale} />
      </div>
    </div>
  );
}

function CatCareWorkspace({
  billingLabels,
  billingResult,
  cats,
  labels,
  plans
}: {
  billingLabels: ReturnType<typeof getDictionary>["account"]["billing"];
  billingResult: ServiceResult<BillingEntitlementSnapshot>;
  cats: CatCareCat[];
  labels: ReturnType<typeof getDictionary>["catcare"]["owner"];
  plans: CatCarePlan[];
}) {
  const submissionCount = plans.reduce(
    (total, plan) => total + plan.submissions.length,
    0
  );
  const currentPlan = billingResult.ok ? billingResult.data.planId : "free";
  const creditLabel = billingResult.ok
    ? formatCatCareAiSummaryLabel(currentPlan, billingLabels)
    : labels.dashboard.creditUnavailable;
  const onboarding = getOnboardingProgress(cats, plans);

  return (
    <div className="grid gap-5">
      <DashboardHero
        labels={labels}
        planLabel={billingLabels.planNames[currentPlan]}
      />

      <ActivationPanel
        labels={labels}
        onboarding={onboarding}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CatCareMetricCard
          icon={<CatCareCatCountIcon className="h-8 w-8" />}
          label={labels.metrics.cats}
          sublabel={labels.dashboard.catsSublabel}
          value={cats.length}
        />
        <CatCareMetricCard
          icon={<CatCareCarePlanMetricIcon className="h-8 w-8" />}
          label={labels.metrics.published}
          sublabel={labels.dashboard.plansSublabel}
          value={plans.length}
        />
        <CatCareMetricCard
          icon={<CatCarePendingIcon className="h-8 w-8" />}
          label={labels.planList.noSubmissions}
          sublabel={labels.dashboard.pendingSublabel}
          value={submissionCount}
        />
        <CatCareMetricCard
          icon={<CatCareAiCreditIcon className="h-8 w-8" />}
          label={labels.metrics.aiCredit}
          sublabel={labels.dashboard.creditSublabel}
          value={creditLabel}
        />
      </div>

      <Button
        className="min-h-14 w-full justify-center rounded-xl bg-teal-700 text-base hover:bg-teal-800"
        href="/catcare/cats"
        icon={
          <CatCareAddCatIcon className="h-8 w-8 brightness-0 invert" />
        }
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
  labels,
  onboarding
}: {
  labels: ReturnType<typeof getDictionary>["catcare"]["owner"];
  onboarding: OnboardingProgress;
}) {
  const steps = [
    {
      action: labels.catForm.submit,
      href: "/catcare/cats",
      icon: <CatCareProfileIcon />,
      title: labels.sections.cats.title
    },
    {
      action: labels.sections.routines.primary,
      href: "/catcare/routines",
      icon: <CatCareFeedingRoutineIcon />,
      title: labels.sections.routines.title
    },
    {
      action: labels.sections.events.primary,
      href: "/catcare/events",
      icon: <CatCareCareEventsIcon />,
      title: labels.sections.events.title
    },
    {
      action: labels.hero.primary.replace("用 AI ", "").replace(" with AI", ""),
      href: "/catcare/plans",
      icon: <CatCareAiChecklistIcon />,
      title: labels.dashboard.aiChecklist
    },
    {
      action: labels.planList.publish,
      href: "/catcare/plans",
      icon: <CatCareShareLinkIcon />,
      title: labels.dashboard.publishShare
    }
  ];
  const stepCountLabel = labels.dashboard.workflowStepCount.replace(/^4/, "5");

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

      <div className="mt-8 grid grid-cols-5 gap-0">
        {steps.map((step, index) => (
          <a
            className="group relative grid min-h-32 justify-items-center rounded-2xl text-center outline-none transition hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60"
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
          </a>
        ))}
      </div>
    </section>
  );
}

type OnboardingProgress = {
  label: string;
  percent: number;
};

function getOnboardingProgress(
  cats: CatCareCat[],
  plans: CatCarePlan[]
): OnboardingProgress {
  const completed =
    (cats.length > 0 ? 1 : 0) +
    (plans.length > 0 ? 1 : 0) +
    (plans.some((plan) => plan.status === "published") ? 1 : 0);
  const percent = Math.round((completed / 5) * 100);

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
