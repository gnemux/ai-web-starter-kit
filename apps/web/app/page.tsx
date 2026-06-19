import { Badge, BrandMark, Button, Panel } from "@starter/ui";

import { ArrowRightIcon } from "@/components/app-icons";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function HomePage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark subtitle={copy.common.brandSubtitle} />
          <Button href="/login" variant="secondary">
            {copy.common.login}
          </Button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="min-w-0">
          <Badge tone="ready">{copy.home.badge}</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            {copy.home.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 tracking-normal text-slate-600 sm:text-lg">
            {copy.home.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/login?mode=signup" icon={<ArrowRightIcon />}>
              {copy.home.primaryAction}
            </Button>
            <Button href="/login" variant="secondary">
              {copy.home.secondaryAction}
            </Button>
          </div>
        </div>

        <Panel className="p-0">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-base font-semibold text-slate-950">
              {copy.home.featureTitle}
            </h2>
          </div>
          <div id="features" className="divide-y divide-slate-200">
            {copy.home.features.map((feature, index) => (
              <div
                className="grid gap-3 p-4 sm:grid-cols-[2.5rem_1fr]"
                key={feature.title}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}
