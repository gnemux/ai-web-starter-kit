import {
  Badge,
  Panel
} from "@xwlc/ui";

import { getCurrentBillingEntitlements } from "@/lib/services/billing";

import {
  AccountAppShell,
  AccountPageHeader,
  getAccountPageContext
} from "../account-shell";

export default async function AccountUsagePage() {
  const [context, billingResult] = await Promise.all([
    getAccountPageContext("/account/usage"),
    getCurrentBillingEntitlements()
  ]);
  const { copy } = context;
  const snapshot = billingResult.ok ? billingResult.data : null;
  const isPro = snapshot?.planId === "pro";
  const creditSummary = isPro
    ? copy.account.billing.catcareDisplay.proCreditSummary
    : copy.account.billing.catcareDisplay.freeCreditSummary;

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
                {copy.account.billing.catcareDisplay.creditPackEmpty}
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
