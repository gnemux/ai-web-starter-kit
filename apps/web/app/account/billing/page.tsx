import {
  getCurrentBillingActivity,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Dictionary, Locale } from "@/lib/i18n";

import {
  AccountAppShell,
  getAccountPageContext
} from "../account-shell";
import { CatCareBillingOverview } from "../catcare-billing-overview";

export default async function AccountBillingPage() {
  const [context, billingResult, activityResult] = await Promise.all([
    getAccountPageContext("/account/billing"),
    getCurrentBillingEntitlements(),
    getCurrentBillingActivity()
  ]);
  const { copy } = context;
  const planId = billingResult.ok ? billingResult.data.planId : "free";
  const aiCreditLabel =
    planId === "pro"
      ? copy.account.billing.catcareDisplay.proCreditSummary
      : copy.account.billing.catcareDisplay.freeCreditSummary;

  return (
    <AccountAppShell
      activeNav="billing"
      context={context}
      topBar={
        <BillingTopBar
          aiCreditLabel={aiCreditLabel}
          labels={copy}
          planLabel={copy.account.billing.planNames[planId]}
          locale={context.locale}
        />
      }
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <CatCareBillingOverview
          activityResult={activityResult}
          billingResult={billingResult}
          labels={copy.account.billing}
        />
      </div>
    </AccountAppShell>
  );
}

function BillingTopBar({
  aiCreditLabel,
  labels,
  locale,
  planLabel
}: {
  aiCreditLabel: string;
  labels: Dictionary;
  locale: Locale;
  planLabel: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-6">
      <h1 className="truncate text-3xl font-semibold tracking-normal text-slate-950">
        {labels.account.billing.catcareHeroTitle}
      </h1>
      <div className="flex shrink-0 items-center gap-5">
        <span className="rounded-full bg-slate-100 px-5 py-2 text-base font-semibold text-slate-950">
          {planLabel}
        </span>
        <span className="text-base font-semibold text-slate-950">
          {labels.account.billing.catcareCreditTitle} {aiCreditLabel}
        </span>
        <LanguageSwitcher labels={labels.common} locale={locale} />
      </div>
    </div>
  );
}
