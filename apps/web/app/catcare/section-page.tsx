import { Badge, Button, EmptyState, Panel } from "@xwlc/ui";

import type { Dictionary } from "@/lib/i18n";

import {
  CatCareAppShell,
  getCatCarePageContext
} from "./catcare-shell";

type SectionKey = keyof Dictionary["catcare"]["owner"]["sections"];

export async function CatCareSectionPage({
  activeNav,
  nextPath,
  section
}: {
  activeNav: Parameters<typeof CatCareAppShell>[0]["activeNav"];
  nextPath: string;
  section: SectionKey;
}) {
  const context = await getCatCarePageContext(nextPath);
  const labels = context.copy.catcare.owner.sections[section];

  return (
    <CatCareAppShell activeNav={activeNav} context={context}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Badge tone="in-progress">{labels.status}</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
                {labels.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {labels.description}
              </p>
            </div>
            <Button href="/catcare" variant="secondary">
              {context.copy.common.nav.catcare}
            </Button>
          </div>
        </section>

        <Panel>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <EmptyState
                description={labels.emptyDescription}
                title={labels.emptyTitle}
              />
              <div className="mt-5 flex justify-center">
                <Button>{labels.primary}</Button>
              </div>
            </div>

            <aside className="rounded-lg border border-teal-100 bg-[#f5fbfa] p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-teal-700">
                {labels.previewTitle}
              </p>
              <div className="mt-4 grid gap-3">
                {labels.previewItems.map((item) => (
                  <div
                    className="rounded-md border border-teal-100 bg-white p-3"
                    key={item.title}
                  >
                    <h2 className="text-sm font-semibold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </Panel>
      </div>
    </CatCareAppShell>
  );
}
