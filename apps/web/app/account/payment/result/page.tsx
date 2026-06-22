import {
  Badge,
  Button,
  ErrorState,
  Panel,
  SectionHeader,
  StatusBadge
} from "@starter/ui";

import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPaymentResultState } from "@/lib/services/payment";

import { PaymentShell } from "../payment-shell";

type ResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentResultPage({
  searchParams
}: ResultPageProps) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const stateResult = await getPaymentResultState({
    status: getParam(params.status),
    checkoutSessionId: getParam(params.checkout_session_id),
    priceId: getParam(params.price_id)
  });

  return (
    <PaymentShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {!stateResult.ok ? (
          <ErrorState
            badgeLabel={copy.account.payment.statusNeedsReview}
            description={stateResult.error.message}
            title={copy.account.payment.errorTitle}
          />
        ) : (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cyan-700">
                    {copy.account.payment.resultEyebrow}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
                    {copy.account.payment.resultTitles[stateResult.data.status]}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    {copy.account.payment.resultDescriptions[
                      stateResult.data.status
                    ]}
                  </p>
                </div>
                <Badge tone={resultTone(stateResult.data.status)}>
                  {copy.account.payment.resultLabels[stateResult.data.status]}
                </Badge>
              </div>
            </section>

            <Panel>
              <SectionHeader
                action={
                  <StatusBadge
                    label={copy.account.payment.statusReady}
                    status="ready"
                  />
                }
                description={copy.account.payment.resultBoundaryDescription}
                title={copy.account.payment.resultBoundaryTitle}
              />
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Fact
                  label={copy.account.payment.checkoutSession}
                  value={stateResult.data.checkoutSessionId ?? "-"}
                />
                <Fact
                  label={copy.account.payment.priceId}
                  value={stateResult.data.priceId ?? "-"}
                />
                <Fact
                  label={copy.account.payment.entitlementSource}
                  value={copy.account.payment.resultNoGrant}
                />
                <Fact
                  label={copy.account.billing.currentPlan}
                  value={
                    stateResult.data.billing.ok
                      ? copy.account.billing.planNames[
                          stateResult.data.billing.data.planId
                        ]
                      : copy.account.payment.billingUnavailable
                  }
                />
              </dl>
              <div className="mt-5">
                <Button href="/account/billing">
                  {copy.account.payment.returnToBilling}
                </Button>
              </div>
            </Panel>
          </>
        )}
      </div>
    </PaymentShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resultTone(status: "success" | "cancel" | "failure") {
  if (status === "success") {
    return "ready";
  }

  if (status === "cancel") {
    return "planned";
  }

  return "risk";
}
