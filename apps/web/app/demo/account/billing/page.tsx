import {
  getCurrentBillingActivity,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";
import { BillingOverview } from "@/app/account/billing-overview";

import {
  DemoAccountAppShell,
  DemoAccountPageHeader,
  getDemoAccountPageContext
} from "../account-shell";

export default async function DemoAccountBillingPage() {
  const [context, billingResult, activityResult] = await Promise.all([
    getDemoAccountPageContext("/demo/account/billing"),
    getCurrentBillingEntitlements(),
    getCurrentBillingActivity()
  ]);
  const { copy } = context;

  return (
    <DemoAccountAppShell activeNav="billing" context={context}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <DemoAccountPageHeader
          description={copy.account.billing.description}
          eyebrow={copy.demo.badge}
          title={copy.account.billing.title}
        />

        <BillingOverview
          activityResult={activityResult}
          billingResult={billingResult}
          labels={copy.account.billing}
        />
      </div>
    </DemoAccountAppShell>
  );
}
