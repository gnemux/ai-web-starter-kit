import {
  getCurrentBillingActivity,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";
import type { Dictionary } from "@/lib/i18n";

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

  return (
    <AccountAppShell
      activeNav="billing"
      context={context}
      topBar={<BillingTopBar labels={copy} />}
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
  labels
}: {
  labels: Dictionary;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-6">
      <h1 className="truncate text-3xl font-semibold tracking-normal text-slate-950">
        {labels.account.billing.catcareHeroTitle}
      </h1>
    </div>
  );
}
