import { Badge, BrandMark, Panel, SectionHeader, StatusBadge } from "@xwlc/ui";

import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getReferenceProductPackageConsumption } from "@/lib/reference-product/package-consumption";

export default async function ReferenceProductPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).referenceProduct;
  const consumption = getReferenceProductPackageConsumption();
  const facts = [
    {
      label: copy.facts.auth,
      value: consumption.authContract
    },
    {
      label: copy.facts.db,
      value: consumption.dbContract
    },
    {
      label: copy.facts.scope,
      value: consumption.anonymousScopePolicy
    },
    {
      label: copy.facts.schema,
      value: consumption.schemaVersion
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark subtitle={copy.subtitle} />
          <Badge tone="in-progress">{copy.badge}</Badge>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-cyan-700">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {copy.description}
          </p>
        </div>

        <Panel>
          <SectionHeader
            action={
              <StatusBadge
                label={copy.status[consumption.actorState]}
                status={
                  consumption.actorState === "verified_owner"
                    ? "ready"
                    : "risk"
                }
              />
            }
            description={copy.contractDescription}
            title={copy.contractTitle}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={fact.label}
              >
                <p className="text-xs font-medium uppercase tracking-normal text-slate-500">
                  {fact.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950 [overflow-wrap:anywhere]">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}
