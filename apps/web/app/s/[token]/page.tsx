import type { Metadata } from "next";

import {
  getAnonymousCarePlanView,
  type AnonymousCarePlanView,
  type AnonymousCareTaskView
} from "@/lib/catcare/product-service";
import {
  getAnonymousCarePlanServiceDates,
  getAnonymousCareTodayIsoDate
} from "@/lib/catcare/product-service/anonymous-submission-policy";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

import {
  formatTaskAction,
  getCategoryStyle,
  getOwnerTagStyle,
  parseTaskTitle
} from "../../catcare/plans/plan-task-display";
import { AnonymousVisitAccordion } from "./visit-accordion-client";
import type { ShareHandoffLabels } from "./visit-model";
import {
  formatFrequency,
  formatShareCategory,
  formatShareOwner
} from "./visit-display";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "CatCare private handoff",
  description: "Private CatCare handoff view."
};

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export default async function AnonymousCarePlanPage({ params }: SharePageProps) {
  const [{ token }, locale] = await Promise.all([params, getRequestLocale()]);
  const result = await getAnonymousCarePlanView(token);
  const ownerDictionary = getDictionary(locale).catcare.owner;

  return (
    <main className="min-h-screen w-screen max-w-[100vw] overflow-x-hidden bg-[#f7f3ee] px-3 py-5 text-[#101a32] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full min-w-0 max-w-full gap-5 sm:max-w-[1196px]">
        {result.ok ? (
          <AnonymousCarePlan
            careSubmissionLabels={ownerDictionary.careSubmission}
            photoViewerLabels={ownerDictionary.photoViewer}
            shareHandoffLabels={ownerDictionary.shareHandoff}
            locale={locale}
            plan={result.data}
            token={token}
          />
        ) : (
          <>
            <AnonymousHeader
              expiresAt={null}
              labels={ownerDictionary.shareHandoff}
              locale={locale}
            />
            <ShareErrorState
              kind={result.error.fields?.token}
              labels={ownerDictionary.shareHandoff}
            />
          </>
        )}
      </div>
    </main>
  );
}

function AnonymousHeader({
  expiresAt,
  labels,
  locale
}: {
  expiresAt: string | null;
  labels: ShareHandoffLabels;
  locale: Locale;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-3 rounded-[22px] border border-[#e2e6ee] bg-white px-4 py-3 shadow-sm shadow-slate-900/[0.04] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
          <img
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-contain"
            src="/catcare/brand-mark.png"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-[#101a32]">CatCare</p>
          <h1 className="truncate text-2xl font-semibold text-[#101a32]">
            {labels.headerTitle}
          </h1>
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2 text-sm font-semibold sm:w-auto sm:justify-end">
        <span className="max-w-full rounded-full bg-[#e6f7f2] px-3 py-1 leading-5 text-[#07847f]">
          {labels.anonymousAccess}
        </span>
        <span className="max-w-full whitespace-normal break-words rounded-full bg-[#fffaf0] px-3 py-1 leading-5 text-[#8a5a00]">
          {labels.privateShare}
        </span>
        {expiresAt ? (
          <span className="max-w-full whitespace-normal break-words rounded-full bg-white px-3 py-1 leading-5 text-[#526177] ring-1 ring-[#d9e0ea]">
            {labels.expiresAt.replace(
              "{date}",
              formatDateTime(expiresAt, locale)
            )}
          </span>
        ) : null}
      </div>
    </header>
  );
}

function AnonymousCarePlan({
  careSubmissionLabels,
  photoViewerLabels,
  shareHandoffLabels,
  locale,
  plan,
  token
}: {
  careSubmissionLabels: ReturnType<typeof getDictionary>["catcare"]["owner"]["careSubmission"];
  photoViewerLabels: ReturnType<typeof getDictionary>["catcare"]["owner"]["photoViewer"];
  shareHandoffLabels: ShareHandoffLabels;
  locale: Locale;
  plan: AnonymousCarePlanView;
  token: string;
}) {
  const optionalCount = plan.taskCount - plan.requiredTaskCount;
  const serviceDays = buildAnonymousServiceDays(
    plan,
    shareHandoffLabels,
    locale
  );
  const attentionTasks = getAnonymousAttentionTasks(plan.tasks);

  return (
    <>
      <AnonymousHeader
        expiresAt={plan.expiresAt}
        labels={shareHandoffLabels}
        locale={locale}
      />
      <section className="min-w-0 rounded-[24px] border border-[#d9eee7] bg-[#f2fbf8] p-5 shadow-sm shadow-slate-900/[0.04] sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
            {shareHandoffLabels.viewAndSubmit}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
            {shareHandoffLabels.expiresAt.replace(
              "{date}",
              formatDateTime(plan.expiresAt, locale)
            )}
          </span>
        </div>
        <h2 className="mt-4 break-words text-2xl font-semibold leading-tight text-[#101a32] sm:text-3xl">
          {formatAnonymousPlanTitle(plan)}
        </h2>
        <p className="mt-3 max-w-full break-all text-base font-semibold leading-7 text-[#526177] sm:max-w-2xl sm:break-words">
          {shareHandoffLabels.introduction}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {plan.catNames.map((name) => (
            <CatNameChip key={name} name={name} />
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label={shareHandoffLabels.catsLabel}
            value={formatList(plan.catNames, shareHandoffLabels)}
          />
          <SummaryCard
            label={shareHandoffLabels.datesLabel}
            value={formatDateRange(plan, shareHandoffLabels)}
          />
          <SummaryCard
            label={shareHandoffLabels.visitsLabel}
            value={shareHandoffLabels.visitsValue
              .replace("{days}", String(serviceDays.length))
              .replace(
                "{visits}",
                String(getDailyVisitCount(serviceDays))
              )}
          />
        </div>
        <nav
          aria-label={shareHandoffLabels.quickNavLabel}
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          {plan.handoffNotes ? (
            <a
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#89cfc2] bg-white px-5 text-base font-semibold text-[#07847f] transition hover:bg-[#f8fffc]"
              href="#handoff"
            >
              {shareHandoffLabels.ownerNotesLink}
            </a>
          ) : null}
          <a
            className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#07847f] bg-[#07847f] px-5 text-base font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:bg-[#06706c]"
            href="#tasks"
          >
            {shareHandoffLabels.visitsLink}
          </a>
        </nav>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
        <div className="grid gap-5 lg:sticky lg:top-5">
          {plan.handoffNotes ? (
            <section
              className="rounded-[22px] border border-[#e2e6ee] bg-white p-5 shadow-sm shadow-slate-900/[0.04]"
              id="handoff"
            >
              <p className="text-sm font-semibold text-[#07847f]">
                {shareHandoffLabels.ownerNotesTitle}
              </p>
              <p className="mt-3 whitespace-pre-wrap break-words text-base font-semibold leading-7 text-[#101a32]">
                {plan.handoffNotes}
              </p>
            </section>
          ) : null}

          <section className="rounded-[22px] border border-[#e2e6ee] bg-white p-5 shadow-sm shadow-slate-900/[0.04]">
            <p className="text-sm font-semibold text-[#07847f]">
              {shareHandoffLabels.guideTitle}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#526177]">
              {shareHandoffLabels.guideDescription}
            </p>
          </section>
        </div>

        <section
          className="rounded-[22px] border border-[#e2e6ee] bg-white p-5 shadow-sm shadow-slate-900/[0.04]"
          id="tasks"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#07847f]">
                {shareHandoffLabels.tasksEyebrow}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#101a32]">
                {shareHandoffLabels.tasksTitle}
              </h2>
            </div>
            <span className="text-sm font-semibold text-[#526177]">
              {shareHandoffLabels.taskCountSummary
                .replace("{required}", String(plan.requiredTaskCount))
                .replace("{optional}", String(optionalCount))}
            </span>
          </div>

          {attentionTasks.length > 0 ? (
            <section className="mt-5 rounded-2xl border border-[#f4dfb8] bg-[#fffaf0] p-4">
              <p className="text-sm font-semibold text-[#8a5a00]">
                {shareHandoffLabels.beforeVisit}
              </p>
              <div className="mt-3 grid gap-3">
                {attentionTasks.map((task) => (
                  <TaskStep
                    key={`attention-${task.sortOrder}-${task.title}`}
                    labels={shareHandoffLabels}
                    task={task}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <AnonymousVisitAccordion
            careSubmissionLabels={careSubmissionLabels}
            days={serviceDays}
            photoViewerLabels={photoViewerLabels}
            shareHandoffLabels={shareHandoffLabels}
            today={getAnonymousCareTodayIsoDate()}
            token={token}
          />
        </section>
      </div>

      <p className="pb-6 text-center text-xs font-semibold leading-5 text-[#75839a]">
        {shareHandoffLabels.footer}
      </p>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#d9eee7]">
      <p className="text-xs font-semibold text-[#75839a]">{label}</p>
      <p className="mt-2 break-words text-base font-semibold text-[#101a32]">
        {value}
      </p>
    </div>
  );
}

function formatAnonymousPlanTitle(plan: AnonymousCarePlanView) {
  return plan.title
    .replace(/\s*\d{4}[-/]\d{2}[-/]\d{2}\s*至\s*\d{4}[-/]\d{2}[-/]\d{2}\s*$/, "")
    .trim();
}

function CatNameChip({ name }: { name: string }) {
  return (
    <span
      className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-semibold ring-1 ${getOwnerTagStyle(name)}`}
    >
      {name}
    </span>
  );
}

function TaskStep({
  labels,
  step,
  task
}: {
  labels: ShareHandoffLabels;
  step?: number;
  task: AnonymousCareTaskView;
}) {
  const title = parseTaskTitle(task.title);

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl bg-white p-3 ring-1 ring-[#e2e6ee]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f7f2] text-sm font-bold text-[#07847f]">
        {step ?? "!"}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryStyle(task.category)}`}
          >
            {formatShareCategory(task.category, labels)}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
            {task.required ? labels.required : labels.optional}
          </span>
        </div>
        <h4 className="mt-2 break-words text-base font-semibold leading-7 text-[#101a32]">
          {formatTaskAction(task.title)}
        </h4>
        <p className="mt-1 text-sm font-semibold text-[#526177]">
          {labels.appliesTo.replace(
            "{owner}",
            formatShareOwner(title.owner, labels)
          )}
        </p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
          {formatFrequency(task.frequency, labels)}
        </p>
        {task.instructions ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#101a32]">
            {task.instructions}
          </p>
        ) : null}
      </div>
    </li>
  );
}

type ScheduledAnonymousTask = Omit<
  AnonymousCareTaskView,
  "submissionsBySlot"
> & {
  locked: boolean;
  serviceDate: string;
  submission: AnonymousCareTaskView["submissionsBySlot"][string] | null;
  visitTime: string;
};

type AnonymousVisitSection = {
  tasks: ScheduledAnonymousTask[];
  timeLabel: string;
};

type AnonymousServiceDay = {
  date: string;
  dateLabel: string;
  locked: boolean;
  statusLabel: string;
  visits: AnonymousVisitSection[];
};

function buildAnonymousServiceDays(
  plan: AnonymousCarePlanView,
  labels: ShareHandoffLabels,
  locale: Locale
): AnonymousServiceDay[] {
  const today = getAnonymousCareTodayIsoDate();

  return getAnonymousCarePlanServiceDates(plan.startOn, plan.endOn).map((date) => {
    const locked = date > today;
    const visits = buildAnonymousTaskFlow(plan.tasks, date, locked);
    const submitted = isAnonymousServiceDaySubmitted(visits);

    return {
      date,
      dateLabel: formatServiceDate(date, locale),
      locked,
      statusLabel: locked
        ? labels.statusNotStarted
        : submitted
          ? labels.statusAllSubmitted
          : date === today
            ? labels.statusTodayOpen
            : labels.statusLateOpen,
      visits
    };
  });
}

function buildAnonymousTaskFlow(
  tasks: AnonymousCareTaskView[],
  serviceDate: string,
  locked: boolean
): AnonymousVisitSection[] {
  const sections = new Map<string, ScheduledAnonymousTask[]>();

  for (const task of tasks) {
    if (isAnonymousAttentionTask(task)) {
      continue;
    }

    for (const timeLabel of getTaskVisitTimes(task)) {
      sections.set(timeLabel, [
        ...(sections.get(timeLabel) ?? []),
        {
          ...task,
          locked,
          serviceDate,
          submission:
            task.submissionsBySlot[createAnonymousSubmissionSlotKey(
              serviceDate,
              timeLabel
            )] ?? null,
          visitTime: timeLabel
        }
      ]);
    }
  }

  return Array.from(sections.entries())
    .sort(([left], [right]) => getTimeSortValue(left) - getTimeSortValue(right))
    .map(([timeLabel, sectionTasks]) => ({
      tasks: sectionTasks.sort(compareAnonymousTasks),
      timeLabel
    }));
}

function createAnonymousSubmissionSlotKey(serviceDate: string, visitTime: string) {
  return `${serviceDate}:${visitTime}`;
}

function getDailyVisitCount(days: AnonymousServiceDay[]) {
  return Math.max(0, ...days.map((day) => day.visits.length));
}

function isAnonymousServiceDaySubmitted(visits: AnonymousVisitSection[]) {
  const tasks = visits.flatMap((visit) => visit.tasks);

  return tasks.length > 0 && tasks.every((task) => task.submission);
}

function getAnonymousAttentionTasks(tasks: AnonymousCareTaskView[]) {
  return tasks.filter(isAnonymousAttentionTask).sort(compareAnonymousTasks);
}

function isAnonymousAttentionTask(task: AnonymousCareTaskView) {
  return task.category === "observe" || task.title.includes("：准备 ");
}

function compareAnonymousTasks(
  left: Pick<AnonymousCareTaskView, "category" | "sortOrder" | "title">,
  right: Pick<AnonymousCareTaskView, "category" | "sortOrder" | "title">
) {
  return (
    getCategoryFlowOrder(left.category) - getCategoryFlowOrder(right.category) ||
    left.sortOrder - right.sortOrder ||
    left.title.localeCompare(right.title, "zh-Hans-CN")
  );
}

function getCategoryFlowOrder(category: AnonymousCareTaskView["category"]) {
  return {
    meal: 10,
    medicine: 20,
    water: 30,
    treat: 40,
    play: 50,
    litter: 60,
    observe: 70,
    environment: 80,
    other: 90
  }[category ?? "other"];
}

function getTaskVisitTimes(task: AnonymousCareTaskView) {
  const times = (task.timeHint ?? "")
    .split(/[，,]/)
    .map((time) => time.trim())
    .filter((time) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(time));

  return times.length > 0 ? times : getFallbackTaskTimes(task);
}

function getFallbackTaskTimes(task: AnonymousCareTaskView) {
  const category = task.category ?? "other";
  const count =
    category === "meal" || category === "treat" || category === "medicine"
      ? getDailyFrequencyCount(task.frequency)
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

function getDailyFrequencyCount(frequency: string | null) {
  const match = /^daily(?:_(\d+))?$/.exec(frequency ?? "");

  return Math.max(1, Math.min(4, Number(match?.[1] ?? "1") || 1));
}

function getTimeSortValue(time: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);

  if (!match) {
    return 24 * 60 + 1;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function formatServiceDate(date: string, locale: Locale) {
  const weekday = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    timeZone: "Asia/Shanghai",
    weekday: "short"
  }).format(new Date(`${date}T00:00:00+08:00`));

  return `${date} ${weekday}`;
}

function ShareErrorState({
  kind,
  labels
}: {
  kind: string | undefined;
  labels: ShareHandoffLabels;
}) {
  const meta = {
    expired: {
      label: labels.errorExpiredLabel,
      title: labels.errorExpiredTitle,
      description: labels.errorExpiredDescription
    },
    invalid: {
      label: labels.errorInvalidLabel,
      title: labels.errorInvalidTitle,
      description: labels.errorInvalidDescription
    },
    revoked: {
      label: labels.errorRevokedLabel,
      title: labels.errorRevokedTitle,
      description: labels.errorRevokedDescription
    },
    unavailable: {
      label: labels.errorUnavailableLabel,
      title: labels.errorUnavailableTitle,
      description: labels.errorUnavailableDescription
    }
  }[kind ?? "invalid"] ?? {
    label: labels.errorInvalidLabel,
    title: labels.errorInvalidTitle,
    description: labels.errorInvalidDescription
  };

  return (
    <section className="min-w-0 rounded-[24px] border border-[#e2e6ee] bg-white p-6 shadow-sm shadow-slate-900/[0.04]">
      <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#526177]">
        {meta.label}
      </span>
      <h2 className="mt-5 break-words text-3xl font-semibold leading-tight text-[#101a32]">
        {meta.title}
      </h2>
      <p className="mt-3 break-all text-base font-semibold leading-7 text-[#526177]">
        {meta.description}
      </p>
      <div className="mt-6 rounded-2xl bg-[#fbfdfc] px-4 py-4 ring-1 ring-[#e2e6ee]">
        <p className="break-all text-sm font-semibold leading-6 text-[#526177]">
          {labels.errorProtection}
        </p>
      </div>
    </section>
  );
}

function formatList(values: string[], labels: ShareHandoffLabels) {
  return values.length > 0
    ? values.join(labels.listSeparator)
    : labels.catsFallback;
}

function formatDateRange(
  plan: Pick<AnonymousCarePlanView, "endOn" | "startOn">,
  labels: ShareHandoffLabels
) {
  if (!plan.startOn) {
    return labels.ownerInstructionsFallback;
  }

  return plan.endOn && plan.endOn !== plan.startOn
    ? `${plan.startOn}${labels.dateRangeSeparator}${plan.endOn}`
    : plan.startOn;
}

function formatDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
