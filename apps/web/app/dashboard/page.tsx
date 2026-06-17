import {
  capabilityTracks,
  dashboardActions,
  integrationStatuses,
  longContentSample,
  readinessMetrics
} from "@starter/core";
import {
  AppShell,
  BrandMark,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  LongContent,
  MetricCard,
  Panel,
  ProgressBar,
  SectionHeader,
  StatusBadge
} from "@starter/ui";

import {
  DashboardIcon,
  DeployIcon,
  GrowthIcon,
  IntegrationsIcon,
  OverviewIcon,
  RefreshIcon,
  SpecsIcon
} from "../../components/app-icons";

const navItems = [
  {
    href: "/",
    label: "Overview",
    description: "Landing",
    icon: <OverviewIcon />
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Command center",
    active: true,
    icon: <DashboardIcon />
  },
  {
    href: "#specs",
    label: "Specs",
    description: "SDD",
    icon: <SpecsIcon />
  },
  {
    href: "#integrations",
    label: "Integrations",
    description: "Providers",
    icon: <IntegrationsIcon />
  },
  {
    href: "#deploy",
    label: "Deploy",
    description: "Preview",
    icon: <DeployIcon />
  },
  {
    href: "#growth",
    label: "Growth",
    description: "Loops",
    icon: <GrowthIcon />
  }
];

export default function DashboardPage() {
  return (
    <AppShell
      action={
        <Button href="/" icon={<OverviewIcon />} variant="secondary">
          Overview
        </Button>
      }
      brand={<BrandMark subtitle="Template workspace" />}
      navItems={navItems}
      user={{
        name: "Demo operator",
        role: "Template maintainer"
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-700">GNE-70 · APP-00</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              Template Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              A restrained SaaS workspace for tracking product shell readiness,
              implementation tracks, provider setup, and the edge states that
              keep the template usable outside ideal data.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button href="#edge-states" variant="secondary">
              View states
            </Button>
            <Button href="#next-actions">Next actions</Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {readinessMetrics.map((metric) => (
            <MetricCard
              detail={metric.detail}
              key={metric.label}
              label={metric.label}
              status={metric.status}
              value={metric.value}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel>
            <SectionHeader
              description="Each row is intentionally compact and ready to become a real module status surface."
              title="Capability tracks"
            />
            <div className="mt-5 divide-y divide-slate-200">
              {capabilityTracks.map((track) => (
                <div className="py-4 first:pt-0 last:pb-0" key={track.name}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-950">
                          {track.name}
                        </h2>
                        <StatusBadge status={track.status} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {track.description}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-medium text-slate-400">
                      {track.owner}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={track.progress} />
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-500">
                      {track.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel id="next-actions">
            <SectionHeader
              description="Linear-backed examples for the next implementation pass."
              title="Next actions"
            />
            <div className="mt-5 divide-y divide-slate-200">
              {dashboardActions.map((action) => (
                <div className="py-4 first:pt-0 last:pb-0" key={action.issue}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        {action.issue}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-slate-950">
                        {action.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {action.description}
                      </p>
                    </div>
                    <StatusBadge status={action.status} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel id="integrations">
            <SectionHeader
              description="Provider readiness remains explicit so app code does not become tightly coupled."
              title="Integration readiness"
            />
            <div className="mt-5 divide-y divide-slate-200">
              {integrationStatuses.map((integration) => (
                <div
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  key={integration.name}
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-950">
                      {integration.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {integration.description}
                    </p>
                  </div>
                  <StatusBadge status={integration.status} />
                </div>
              ))}
            </div>
          </Panel>

          <div id="edge-states" className="grid gap-4 md:grid-cols-2">
            <EmptyState
              action={<Button variant="secondary">Create spec</Button>}
              description="No feature spec has been selected. Start from a Linear issue, then copy the SDD template."
              title="No active spec"
            />
            <LoadingState rows={3} />
            <ErrorState
              action={
                <Button icon={<RefreshIcon />} variant="secondary">
                  Retry check
                </Button>
              }
              description="A provider check failed, but the core dashboard remains usable while the integration is repaired."
              title="Integration check failed"
            />
            <LongContent label="Long content constraint">
              {longContentSample}
            </LongContent>
          </div>
        </section>

        <section
          id="specs"
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] md:grid-cols-3"
        >
          <div className="min-w-0 md:col-span-1">
            <h2 className="text-base font-semibold text-slate-950">
              Spec-first workflow
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The shell is built to keep product intent, engineering scope, and
              validation visible before implementation begins.
            </p>
          </div>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
            {["Product spec", "Engineering spec", "Acceptance"].map((label) => (
              <div className="border-l border-slate-200 pl-4" key={label}>
                <p className="text-sm font-semibold text-slate-950">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ready to be copied for the next module.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
