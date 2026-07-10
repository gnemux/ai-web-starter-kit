import {
  Badge,
  Button,
  Panel
} from "@xwlc/ui";
import { defaultBillingPrices } from "@xwlc/core";

import {
  formatAiCreditAllowanceLabel,
  getAiCreditAllowanceUsage,
  getCurrentBillingEntitlements
} from "@/lib/services/billing";
import { isInternalReturnPathWithin } from "@/lib/services/internal-return";

import {
  AccountAppShell,
  AccountPageHeader,
  getAccountPageContext
} from "../account-shell";

type AccountUsagePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountUsagePage({
  searchParams
}: AccountUsagePageProps) {
  const params = await searchParams;
  const returnTo = normalizeUsageReturnTo(getParam(params.return_to));
  const [context, billingResult] = await Promise.all([
    getAccountPageContext(buildCurrentPath("/account/usage", params)),
    getCurrentBillingEntitlements()
  ]);
  const { copy } = context;
  const snapshot = billingResult.ok ? billingResult.data : null;
  const aiAllowance = snapshot?.entitlements.ai_tokens ?? null;
  const aiUsage = aiAllowance ? getAiCreditAllowanceUsage(aiAllowance) : null;
  const creditSummary = aiAllowance
    ? formatAiCreditAllowanceLabel(aiAllowance)
    : copy.account.billing.catcareDisplay.creditPackEmpty;

  return (
    <AccountAppShell activeNav="usage" context={context}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AccountPageHeader
          description={copy.account.usage.description}
          eyebrow={copy.account.usage.eyebrow}
          title={copy.account.usage.title}
        />

        <Panel className="border-teal-100 bg-[#f5fbfa]">
          <Badge tone="in-progress">CatCare AI</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">
            {copy.account.usage.productTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {copy.account.usage.productDescription}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {copy.account.usage.productFacts.map((fact) => (
              <div
                className="rounded-md border border-teal-100 bg-white p-3 text-sm font-medium leading-6 text-slate-700"
                key={fact}
              >
                {fact}
              </div>
            ))}
          </div>
        </Panel>

        {returnTo ? (
          <Panel className="border-amber-200 bg-[#fff8f0]">
            <Badge tone="planned">{copy.account.usage.paywallEyebrow}</Badge>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                  {copy.account.usage.paywallTitle}
                </h2>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-700">
                  {copy.account.usage.paywallDescription}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {copy.account.usage.returnContext}: {returnTo}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  href={buildCreditPackCheckoutHref(returnTo)}
                >
                  {copy.account.usage.topUpAction}
                </Button>
                <Button href={returnTo} variant="secondary">
                  {copy.account.usage.returnAction}
                </Button>
              </div>
            </div>
          </Panel>
        ) : null}

        <Panel className="border-teal-100 bg-white">
          <div className="grid gap-4 md:grid-cols-[0.85fr_1fr]">
            <div className="rounded-md bg-slate-950 p-6 text-white">
              <p className="text-sm font-semibold text-slate-300">
                {copy.account.billing.planCreditRemaining}
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-normal">
                {creditSummary}
              </p>
              <p className="mt-3 text-sm text-slate-300">
                {copy.account.billing.features.ai_tokens}
              </p>
            </div>
            <div className="grid content-center gap-3 text-sm font-semibold text-slate-700">
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                {copy.account.billing.packCreditRemaining}:{" "}
                {copy.account.billing.catcareDisplay.creditPackEmpty}
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                {copy.account.billing.creditConsumed}:{" "}
                {aiUsage?.used ?? 0}
              </div>
              <div className="rounded-md border border-teal-100 bg-[#f5fbfa] p-4 text-teal-800">
                {copy.account.billing.catcareSandboxNotice}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </AccountAppShell>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCurrentPath(
  pathname: string,
  params: Record<string, string | string[] | undefined>
) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
      return;
    }

    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function normalizeUsageReturnTo(value: string | undefined) {
  const trimmed = String(value ?? "").trim();

  if (
    !trimmed ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return null;
  }

  return isInternalReturnPathWithin(trimmed, "/catcare") ? trimmed : null;
}

function buildCreditPackCheckoutHref(returnTo: string) {
  const creditPack = defaultBillingPrices.find(
    (price) => price.id === "ai_credit_pack_100k"
  );
  const priceId = creditPack?.id ?? "ai_credit_pack_100k";

  return `/account/payment/checkout?price_id=${priceId}&return_to=${encodeURIComponent(returnTo)}`;
}
