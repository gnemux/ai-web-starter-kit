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

import { CatCareAppShell } from "../catcare/catcare-shell";

export async function getAccountPageContext(nextPath = "/account") {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const [accountResult, billingResult] = await Promise.all([
    getCurrentAccount(),
    getCurrentBillingEntitlements()
  ]);

  if (!accountResult.ok) {
    redirect(`/login?next=${nextPath}`);
  }

  const planId = billingResult.ok ? billingResult.data.planId : "free";
  const displayName = accountResult.data.profile?.displayName ?? "";
  const userLabel =
    displayName || accountResult.data.user.email || copy.account.title;

  return {
    account: accountResult.data,
    billingPlanLabel: copy.account.billing.planNames[planId],
    copy,
    creditLabel: billingResult.ok
      ? formatAiCreditAllowanceLabel(billingResult.data.entitlements.ai_tokens)
      : copy.catcare.owner.dashboard.creditUnavailable,
    displayName,
    locale,
    userLabel
  };
}

type AccountPageContext = Awaited<ReturnType<typeof getAccountPageContext>>;

export function AccountAppShell({
  activeNav,
  children,
  context,
  topBar
}: {
  activeNav: WorkspaceNavKey;
  children: ReactNode;
  context: AccountPageContext;
  topBar?: ReactNode;
}) {
  return (
    <CatCareAppShell activeNav={activeNav} context={context} topBar={topBar}>
      {children}
    </CatCareAppShell>
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
