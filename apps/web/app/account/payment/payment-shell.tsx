import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell, BrandMark } from "@xwlc/ui";

import { AccountMenu } from "@/components/account-menu";
import { getWorkspaceNavItems } from "@/components/workspace-nav";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccount } from "@/lib/services/auth";

export async function PaymentShell({
  children,
  nextPath = "/account/payment"
}: {
  children: ReactNode;
  nextPath?: string;
}) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const displayName = accountResult.data.profile?.displayName ?? "";
  const userLabel =
    displayName || accountResult.data.user.email || copy.account.title;
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
      brand={<BrandMark subtitle={copy.account.shellSubtitle} />}
      navItems={getWorkspaceNavItems(copy, "billing", {
        includeDashboard: false
      })}
      user={{
        name: userLabel,
        role: accountResult.data.user.email
      }}
    >
      {children}
    </AppShell>
  );
}
