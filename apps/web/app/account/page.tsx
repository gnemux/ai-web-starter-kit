import { redirect } from "next/navigation";

import {
  AppShell,
  BrandMark,
  Button,
  MetricCard,
  Panel,
  SectionHeader,
  StatusBadge
} from "@starter/ui";

import { DashboardIcon, IntegrationsIcon, OverviewIcon } from "@/components/app-icons";
import { SignOutButton } from "@/components/sign-out-button";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccount } from "@/lib/services/auth";

import { ProfileForm } from "./profile-form";

export default async function AccountPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect("/login?next=/account");
  }

  const displayName = accountResult.data.profile?.displayName ?? "";
  const userLabel = displayName || accountResult.data.user.email || copy.account.title;
  const hasProfileName = Boolean(displayName);
  const navItems = [
    {
      href: "/",
      label: copy.common.nav.overview,
      description: copy.common.navDescription.overview,
      icon: <OverviewIcon />
    },
    {
      href: "/dashboard",
      label: copy.common.nav.dashboard,
      description: copy.common.navDescription.dashboard,
      icon: <DashboardIcon />
    },
    {
      href: "/account",
      label: copy.common.nav.account,
      description: copy.common.navDescription.account,
      active: true,
      icon: <IntegrationsIcon />
    }
  ];

  return (
    <AppShell
      action={<SignOutButton labels={copy.common} />}
      brand={<BrandMark subtitle={copy.account.shellSubtitle} />}
      navItems={navItems}
      user={{
        name: userLabel,
        role: accountResult.data.user.email
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-700">
              {copy.account.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              {copy.account.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {copy.account.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button href="/dashboard" variant="secondary">
              {copy.account.dashboardButton}
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            detail={copy.account.metrics.session.detail}
            label={copy.account.metrics.session.label}
            status="ready"
            statusLabel={copy.common.status.ready}
            value={copy.account.metrics.session.value}
          />
          <MetricCard
            detail={
              hasProfileName
                ? copy.account.metrics.profile.readyDetail
                : copy.account.metrics.profile.emptyDetail
            }
            label={copy.account.metrics.profile.label}
            status={hasProfileName ? "ready" : "in-progress"}
            statusLabel={
              hasProfileName
                ? copy.common.status.ready
                : copy.common.status.inProgress
            }
            value={
              hasProfileName
                ? copy.account.metrics.profile.ready
                : copy.account.metrics.profile.empty
            }
          />
          <MetricCard
            detail={copy.account.metrics.analytics.detail}
            label={copy.account.metrics.analytics.label}
            status="in-progress"
            statusLabel={copy.common.status.inProgress}
            value={copy.account.metrics.analytics.value}
          />
        </section>

        <Panel>
          <SectionHeader
            action={
              <StatusBadge
                label={copy.common.status.ready}
                status="ready"
              />
            }
            description={copy.account.profile.description}
            title={copy.account.profile.title}
          />
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">
              {copy.account.emailLabel}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {accountResult.data.user.email}
            </p>
          </div>
          <ProfileForm
            errorLabels={copy.errors.profile}
            initialDisplayName={displayName}
            labels={copy.account.profile}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
