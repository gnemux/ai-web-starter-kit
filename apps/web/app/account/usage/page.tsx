import {
  getCurrentBillingActivity,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";

import {
  AccountAppShell,
  AccountPageHeader,
  getAccountPageContext
} from "../account-shell";
import { UsageOverview, type UsageReviewState } from "../billing-overview";

type AccountUsagePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountUsagePage({
  searchParams
}: AccountUsagePageProps) {
  const params = await searchParams;
  const [context, billingResult, activityResult] = await Promise.all([
    getAccountPageContext("/account/usage"),
    getCurrentBillingEntitlements(),
    getCurrentBillingActivity()
  ]);
  const { copy } = context;

  return (
    <AccountAppShell activeNav="usage" context={context}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AccountPageHeader
          description={copy.account.usage.description}
          eyebrow={copy.account.usage.eyebrow}
          title={copy.account.usage.title}
        />

        <UsageOverview
          activityResult={activityResult}
          billingResult={billingResult}
          labels={copy.account.billing}
          usageReview={getUsageReviewState(params)}
        />
      </div>
    </AccountAppShell>
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
