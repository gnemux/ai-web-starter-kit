import {
  getCurrentBillingActivity,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";

import {
  AccountAppShell,
  AccountPageHeader,
  getAccountPageContext
} from "../account-shell";
import { BillingOverview } from "../billing-overview";

export default async function AccountBillingPage() {
  const [context, billingResult, activityResult] = await Promise.all([
    getAccountPageContext("/account/billing"),
    getCurrentBillingEntitlements(),
    getCurrentBillingActivity()
  ]);
  const { copy } = context;

  return (
    <AccountAppShell activeNav="billing" context={context}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AccountPageHeader
          description={copy.account.billing.description}
          eyebrow={copy.account.billing.eyebrow}
          title={copy.account.billing.title}
        />

        <BillingOverview
          activityResult={activityResult}
          billingResult={billingResult}
          labels={copy.account.billing}
        />
      </div>
    </AccountAppShell>
  );
}
