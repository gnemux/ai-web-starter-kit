import { Badge, ErrorState } from "@xwlc/ui";
import type { ServiceResult } from "@xwlc/core";
import type { ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";
import {
  formatAiCreditsAsUsesLabel,
  type BillingActivity
} from "@/lib/services/billing";

import { formatMoney } from "./billing-overview";

export function CatCareBillingRecords({
  activityResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  labels: Dictionary["account"]["billing"];
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <OrdersPanel activityResult={activityResult} labels={labels} />
      <CreditLedgerPanel activityResult={activityResult} labels={labels} />
    </section>
  );
}

function OrdersPanel({
  activityResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  labels: Dictionary["account"]["billing"];
}) {
  const rows = activityResult.ok ? activityResult.data.paymentRecords : [];

  return (
    <TableCard
      error={activityResult.ok ? null : activityResult.error.message}
      errorTitle={labels.recordsErrorTitle}
      labels={labels}
      title={labels.planRecordsTitle}
    >
      <thead className="whitespace-nowrap bg-slate-50 text-xs font-semibold text-slate-500">
        <tr>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.order}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.type}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.amount}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.status}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.time}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.environment}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length > 0 ? (
          rows.slice(0, 5).map((record) => (
            <tr key={record.id}>
              <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-950">
                {record.id.slice(0, 12)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {formatPaymentRecordTitle(record, labels)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-950">
                {formatMoney(record.amountCents, record.currency)}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <Badge tone={record.status === "paid" ? "ready" : "neutral"}>
                  {labels.orderStatuses[record.status]}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                {formatRecordDate(record.occurredAt)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                {labels.catcareDisplay.sandboxTag}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-5 py-6 text-slate-500" colSpan={6}>
              {labels.emptyPlanRecords}
            </td>
          </tr>
        )}
      </tbody>
    </TableCard>
  );
}

function CreditLedgerPanel({
  activityResult,
  labels
}: {
  activityResult: ServiceResult<BillingActivity>;
  labels: Dictionary["account"]["billing"];
}) {
  const rows = activityResult.ok ? activityResult.data.usageRecords : [];

  return (
    <TableCard
      error={activityResult.ok ? null : activityResult.error.message}
      errorTitle={labels.recordsErrorTitle}
      labels={labels}
      title={labels.aiRecordsTitle}
    >
      <thead className="whitespace-nowrap bg-slate-50 text-xs font-semibold text-slate-500">
        <tr>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.time}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.type}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.change}</th>
          <th className="px-5 py-3">{labels.catcareDisplay.orderColumns.description}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length > 0 ? (
          rows.slice(0, 5).map((record) => (
            <tr key={record.id}>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                {formatRecordDate(record.createdAt)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {labels.usageRecordsTitle}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-950">
                -{formatAiCreditsAsUsesLabel(record.units)} 次
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                {labels.creditConsumptionRecordTitle}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-5 py-6 text-slate-500" colSpan={4}>
              {labels.emptyUsageRecords}
            </td>
          </tr>
        )}
      </tbody>
    </TableCard>
  );
}

function TableCard({
  children,
  error,
  errorTitle,
  labels,
  title
}: {
  children: ReactNode;
  error: string | null;
  errorTitle: string;
  labels: Dictionary["account"]["billing"];
  title: string;
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.04]">
      <div className="p-5 pb-3">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      {error ? (
        <div className="p-5 pt-0">
          <ErrorState
            badgeLabel={labels.statusNeedsReview}
            description={error}
            title={errorTitle}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-slate-100 text-left text-sm">
            {children}
          </table>
        </div>
      )}
    </section>
  );
}

function formatRecordDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatPaymentRecordTitle(
  record: BillingActivity["paymentRecords"][number],
  labels: Dictionary["account"]["billing"]
) {
  if (record.priceId === "ai_credit_pack_100k") {
    return labels.catcareCreditPacksTitle;
  }

  if (isPlanNameKey(record.planId, labels)) {
    return labels.planNames[record.planId];
  }

  return record.planId;
}

function isPlanNameKey(
  value: string,
  labels: Dictionary["account"]["billing"]
): value is keyof Dictionary["account"]["billing"]["planNames"] {
  return Object.prototype.hasOwnProperty.call(labels.planNames, value);
}
