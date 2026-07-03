import {
  getCurrentBillingActivity,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";
import {
  UsageOverview,
  type UsageReviewState
} from "@/app/account/billing-overview";

import {
  DemoAccountAppShell,
  DemoAccountPageHeader,
  getDemoAccountPageContext
} from "../account-shell";

type DemoAccountUsagePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DemoAccountUsagePage({
  searchParams
}: DemoAccountUsagePageProps) {
  const params = await searchParams;
  const [context, billingResult, activityResult] = await Promise.all([
    getDemoAccountPageContext("/demo/account/usage"),
    getCurrentBillingEntitlements(),
    getCurrentBillingActivity()
  ]);
  const { copy } = context;

  return (
    <DemoAccountAppShell activeNav="usage" context={context}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <DemoAccountPageHeader
          description={copy.account.usage.description}
          eyebrow={copy.demo.badge}
          title={copy.account.usage.title}
        />

        <UsageOverview
          activityResult={activityResult}
          billingResult={billingResult}
          labels={copy.account.billing}
          usageReview={getUsageReviewState(params)}
        />
      </div>
    </DemoAccountAppShell>
  );
}

function getUsageReviewState(
  params: Record<string, string | string[] | undefined>
): UsageReviewState {
  const result = getParam(params.usage_result);

  if (!result) {
    return null;
  }

  return {
    consumed: getParam(params.consumed) ?? "0",
    featureKey: getParam(params.feature_key) ?? "ai_tokens",
    plan: getParam(params.plan) ?? "unknown",
    reason: getParam(params.reason) ?? "unknown",
    remaining: getParam(params.remaining) ?? "unknown",
    result
  };
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
