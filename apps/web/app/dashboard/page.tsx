import { type DemoItem } from "@xwlc/core";
import {
  AppShell,
  BrandMark,
  EmptyState,
  ErrorState,
  Panel,
  SectionHeader,
  StatusBadge
} from "@xwlc/ui";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { getWorkspaceNavItems } from "@/components/workspace-nav";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccount } from "@/lib/services/auth";
import {
  getAiTextReviewState,
  type AiTextReviewState
} from "@/lib/services/ai";
import { listDemoItems } from "@/lib/services/demo-items";

import { AiWorkflowForm } from "./ai-workflow-form";
import { DemoItemForm } from "./demo-item-form";

export default async function DashboardPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect("/demo/login?next=/dashboard");
  }

  const aiReviewResult = getAiTextReviewState();
  const demoItemsResult = await listDemoItems();
  const displayName = accountResult.data.profile?.displayName;
  const userLabel =
    displayName || accountResult.data.user.email || copy.dashboard.eyebrow;
  return (
    <AppShell
      action={
        <AccountMenu
          avatarUrl={accountResult.data.profile?.avatarUrl}
          email={accountResult.data.user.email}
          labels={copy.common.accountMenu}
          name={userLabel}
          surface="demo"
        />
      }
      brand={<BrandMark subtitle={copy.dashboard.shellSubtitle} />}
      navItems={getWorkspaceNavItems(copy, "dashboard", { surface: "demo" })}
      user={{
        name: userLabel,
        role: accountResult.data.user.email
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-700">
              {copy.dashboard.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              {copy.dashboard.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {copy.dashboard.description}
            </p>
          </div>
        </section>

        <Panel id="ai-workflow">
          <SectionHeader
            action={
              <StatusBadge
                label={
                  aiReviewResult.ok
                    ? copy.dashboard.ai.statusReady
                    : copy.dashboard.ai.statusError
                }
                status={aiReviewResult.ok ? "ready" : "risk"}
              />
            }
            description={copy.dashboard.ai.description}
            title={copy.dashboard.ai.title}
          />

          {aiReviewResult.ok ? (
            <>
              <AiWorkflowFacts
                labels={copy.dashboard.ai}
                state={aiReviewResult.data}
              />
              <AiWorkflowForm
                errorLabels={copy.errors.ai}
                labels={copy.dashboard.ai}
                model={aiReviewResult.data.model}
                modelOptions={aiReviewResult.data.modelOptions}
              />
            </>
          ) : (
            <div className="mt-5">
              <ErrorState
                badgeLabel={copy.common.status.risk}
                description={`${aiReviewResult.error.code}: ${aiReviewResult.error.message}`}
                title={copy.dashboard.ai.serviceErrorTitle}
              />
            </div>
          )}
        </Panel>

        <Panel id="demo-data">
          <SectionHeader
            action={
              <StatusBadge
                label={
                  demoItemsResult.ok
                    ? copy.dashboard.demo.statusReady
                    : copy.dashboard.demo.statusError
                }
                status={demoItemsResult.ok ? "ready" : "risk"}
              />
            }
            description={copy.dashboard.demo.description}
            title={copy.dashboard.demo.title}
          />

          {demoItemsResult.ok ? (
            <DemoItemsList
              items={demoItemsResult.data.items}
              labels={copy.dashboard.demo}
            />
          ) : (
            <ErrorState
              badgeLabel={copy.common.status.risk}
              description={`${demoItemsResult.error.code}: ${demoItemsResult.error.message}`}
              title={copy.dashboard.demo.serviceErrorTitle}
            />
          )}

          <DemoItemForm
            errorLabels={copy.errors.demo}
            labels={copy.dashboard.demo}
          />
        </Panel>
      </div>
    </AppShell>
  );
}

function AiWorkflowFacts({
  labels,
  state
}: {
  labels: {
    providerMode: string;
    model: string;
    usageRecordPending: string;
    modelSelectLabel: string;
    reasons: Record<string, string>;
    creditRequested: string;
    usageRecord: string;
    usageRecordDeferred: string;
    usageRecordRecorded: string;
    creditUnit: string;
  };
  state: AiTextReviewState;
}) {
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <AiFact label={labels.providerMode} value={state.mode} />
      <AiFact label={labels.model} value={state.modelLabel} />
      <AiFact
        label={labels.creditRequested}
        value={`${state.requestedCredits.toLocaleString()} ${labels.creditUnit}`}
      />
      <AiFact label={labels.usageRecord} value={labels.usageRecordPending} />
    </dl>
  );
}

function AiFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

type DemoItemLabels = {
  emptyTitle: string;
  emptyDescription: string;
  privateItemsTitle: string;
  publicItemsTitle: string;
  itemVisibility: {
    private: string;
    public: string;
  };
  itemStatus: {
    active: string;
    archived: string;
  };
};

function DemoItemsList({
  items,
  labels
}: {
  items: DemoItem[];
  labels: DemoItemLabels;
}) {
  const privateItems = items.filter((item) => item.visibility === "private");
  const publicItems = items.filter((item) => item.visibility === "public");

  if (items.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState
          description={labels.emptyDescription}
          title={labels.emptyTitle}
        />
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-5">
      <DemoItemsGroup
        items={privateItems}
        labels={labels}
        title={labels.privateItemsTitle}
      />
      <DemoItemsGroup
        items={publicItems}
        labels={labels}
        title={labels.publicItemsTitle}
      />
    </div>
  );
}

function DemoItemsGroup({
  items,
  labels,
  title
}: {
  items: DemoItem[];
  labels: DemoItemLabels;
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-normal text-slate-500">
        {title}
      </h3>
      <div className="mt-2 divide-y divide-slate-200">
        {items.map((item) => (
          <div className="py-4 first:pt-0 last:pb-0" key={item.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-950">
                    {item.title}
                  </h4>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500">
                    {labels.itemVisibility[item.visibility]}
                  </span>
                </div>
                {item.notes ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.notes}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-xs font-medium text-slate-400">
                {labels.itemStatus[item.status]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
