import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import type { WorkspaceNavKey } from "@/components/workspace-nav";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccount } from "@/lib/services/auth";
import {
  formatAiCreditAllowanceLabel,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";

import { CatCareShellClient } from "./catcare-shell-client";

export async function getCatCarePageContext(nextPath = "/catcare") {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const [accountResult, billingResult] = await Promise.all([
    getCurrentAccount(),
    getCurrentBillingEntitlements()
  ]);

  if (!accountResult.ok) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const displayName = accountResult.data.profile?.displayName;
  const userLabel =
    displayName ||
    accountResult.data.user.email ||
    copy.catcare.owner.eyebrow;

  const planId = billingResult.ok ? billingResult.data.planId : "free";

  return {
    account: accountResult.data,
    billingPlanLabel: copy.account.billing.planNames[planId],
    creditLabel: billingResult.ok
      ? formatAiCreditAllowanceLabel(billingResult.data.entitlements.ai_tokens)
      : copy.catcare.owner.dashboard.creditUnavailable,
    copy,
    locale,
    userLabel
  };
}

export async function getCatCareContentContext() {
  const locale = await getRequestLocale();

  return {
    copy: getDictionary(locale),
    locale
  };
}

type CatCarePageContext = Pick<
  Awaited<ReturnType<typeof getCatCarePageContext>>,
  "account" | "copy" | "locale" | "userLabel"
> & {
  billingPlanLabel?: string;
  creditLabel?: string;
};

export function CatCareAppShell({
  activeNav,
  children,
  context,
  topBar
}: {
  activeNav: WorkspaceNavKey;
  children: ReactNode;
  context: CatCarePageContext;
  topBar?: ReactNode;
}) {
  return (
    <CatCareShellClient
      activeNav={activeNav}
      avatarUrl={context.account.profile?.avatarUrl}
      billingPlanLabel={context.billingPlanLabel}
      copy={context.copy}
      creditLabel={context.creditLabel}
      email={context.account.user.email}
      locale={context.locale}
      topBar={topBar}
      userLabel={context.userLabel}
    >
      {children}
    </CatCareShellClient>
  );
}
