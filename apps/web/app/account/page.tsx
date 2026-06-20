import { redirect } from "next/navigation";

import {
  AppShell,
  BrandMark,
  Panel,
  SectionHeader
} from "@starter/ui";

import { AccountIcon, DashboardIcon } from "@/components/app-icons";
import { AccountMenu } from "@/components/account-menu";
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
  const userLabel =
    displayName || accountResult.data.user.email || copy.account.title;
  const navItems = [
    {
      href: "/dashboard",
      label: copy.common.nav.dashboard,
      icon: <DashboardIcon />
    },
    {
      href: "/account",
      label: copy.common.nav.account,
      active: true,
      icon: <AccountIcon />
    }
  ];

  return (
    <AppShell
      action={
        <AccountMenu
          avatarUrl={accountResult.data.profile?.avatarUrl}
          email={accountResult.data.user.email}
          labels={copy.common.accountMenu}
          name={userLabel}
        />
      }
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
        </section>

        <Panel>
          <SectionHeader
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
