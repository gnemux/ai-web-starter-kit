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

import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentAccount } from "@/lib/services/auth";

import {
  DashboardIcon,
  DeployIcon,
  IntegrationsIcon,
  OverviewIcon,
  SpecsIcon
} from "../../components/app-icons";
import { ProfileForm } from "./profile-form";

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
    icon: <DashboardIcon />
  },
  {
    href: "/account",
    label: "Account",
    description: "Profile",
    active: true,
    icon: <IntegrationsIcon />
  },
  {
    href: "/dashboard#specs",
    label: "Specs",
    description: "SDD",
    icon: <SpecsIcon />
  },
  {
    href: "/dashboard#deploy",
    label: "Deploy",
    description: "Preview",
    icon: <DeployIcon />
  }
];

export default async function AccountPage() {
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect("/login?next=/account");
  }

  const displayName = accountResult.data.profile?.displayName ?? "";
  const userLabel = displayName || accountResult.data.user.email || "Signed user";

  return (
    <AppShell
      action={<SignOutButton />}
      brand={<BrandMark subtitle="Account settings" />}
      navItems={navItems}
      user={{
        name: userLabel,
        role: accountResult.data.user.email
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-700">GNE-89 · AUTH-04</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              Account settings
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Profile data is stored in Supabase with RLS and accessed through
              the Auth service boundary.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button href="/dashboard" variant="secondary">
              Dashboard
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            detail="Supabase Auth validates the session before protected pages render."
            label="Session"
            status="ready"
            value="Active"
          />
          <MetricCard
            detail="The profile row is user-owned and protected by RLS."
            label="Profile"
            status={accountResult.data.profile ? "ready" : "in-progress"}
            value={accountResult.data.profile ? "Ready" : "Empty"}
          />
          <MetricCard
            detail="Auth events are captured only when PostHog public env is configured."
            label="Analytics"
            status="in-progress"
            value="Safe"
          />
        </section>

        <Panel>
          <SectionHeader
            action={<StatusBadge status="ready" />}
            description="Update the reusable profile fields that downstream products can extend."
            title="Profile"
          />
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Email</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {accountResult.data.user.email}
            </p>
          </div>
          <ProfileForm initialDisplayName={displayName} />
        </Panel>
      </div>
    </AppShell>
  );
}
