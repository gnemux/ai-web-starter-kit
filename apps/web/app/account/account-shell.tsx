import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell, BrandMark } from "@xwlc/ui";

import { AccountMenu } from "@/components/account-menu";
import {
  getWorkspaceNavItems,
  type WorkspaceNavKey
} from "@/components/workspace-nav";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccount } from "@/lib/services/auth";

export async function getAccountPageContext(nextPath = "/account") {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect(`/login?next=${nextPath}`);
  }

  const displayName = accountResult.data.profile?.displayName ?? "";
  const userLabel =
    displayName || accountResult.data.user.email || copy.account.title;

  return {
    account: accountResult.data,
    copy,
    displayName,
    userLabel
  };
}

type AccountPageContext = Awaited<ReturnType<typeof getAccountPageContext>>;

export function AccountAppShell({
  activeNav,
  children,
  context
}: {
  activeNav: WorkspaceNavKey;
  children: ReactNode;
  context: AccountPageContext;
}) {
  return (
    <AppShell
      action={
        <AccountMenu
          avatarUrl={context.account.profile?.avatarUrl}
          email={context.account.user.email}
          labels={context.copy.common.accountMenu}
          name={context.userLabel}
          showDashboard={false}
        />
      }
      brand={<BrandMark subtitle={context.copy.account.shellSubtitle} />}
      navItems={getWorkspaceNavItems(context.copy, activeNav, {
        includeDashboard: false
      })}
      user={{
        name: context.userLabel,
        role: context.account.user.email
      }}
    >
      {children}
    </AppShell>
  );
}

export function AccountPageHeader({
  description,
  eyebrow,
  title
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-cyan-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </section>
  );
}
