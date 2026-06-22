import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell, BrandMark } from "@starter/ui";

import { AccountIcon, DashboardIcon } from "@/components/app-icons";
import { AccountMenu } from "@/components/account-menu";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccount } from "@/lib/services/auth";

export async function PaymentShell({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect("/login?next=/account/payment");
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
      {children}
    </AppShell>
  );
}
