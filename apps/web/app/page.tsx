import { Badge, BrandMark, Button } from "@xwlc/ui";

import { AccountMenu } from "@/components/account-menu";
import { ArrowRightIcon } from "@/components/app-icons";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccountForPublicShell } from "@/lib/services/auth";

export default async function HomePage() {
  const [locale, accountResult] = await Promise.all([
    getRequestLocale(),
    getCurrentAccountForPublicShell()
  ]);
  const copy = getDictionary(locale);
  const currentAccount = accountResult;
  const currentAccountLabel =
    currentAccount?.profile?.displayName ||
    currentAccount?.user.email ||
    copy.common.accountMenu.signedIn;
  const primaryHref = currentAccount
    ? "/reference-product"
    : "/login?mode=signup&next=/reference-product";
  const primaryLabel = currentAccount
    ? copy.home.primaryActionSignedIn
    : copy.home.primaryAction;
  const secondaryHref = currentAccount ? "/reference-product" : "#product-flow";
  const secondaryLabel = currentAccount
    ? copy.home.secondaryActionSignedIn
    : copy.home.secondaryAction;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark subtitle={copy.home.brandSubtitle} />
          <div className="flex items-center justify-end gap-3">
            {currentAccount ? (
              <AccountMenu
                avatarUrl={currentAccount.profile?.avatarUrl}
                email={currentAccount.user.email}
                labels={copy.common.accountMenu}
                name={currentAccountLabel}
              />
            ) : (
              <Button href="/login?next=/reference-product" variant="secondary">
                {copy.common.login}
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(26rem,1.1fr)] lg:px-8">
        <div className="min-w-0">
          <Badge tone="ready">{copy.home.badge}</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-normal text-slate-950 sm:text-5xl">
            {copy.home.title}
            <span className="block text-cyan-700">{copy.home.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.home.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={primaryHref} icon={<ArrowRightIcon />}>
              {primaryLabel}
            </Button>
            <Button href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {copy.home.stats.map((stat) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4"
                key={stat.label}
              >
                <p className="text-2xl font-semibold text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ProductPreview labels={copy.home.preview} />
      </section>

      <section className="border-t border-slate-200 bg-white" id="product-flow">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {copy.home.callouts.map((item) => (
            <CalloutCard item={item} key={item.title} />
          ))}
        </div>
      </section>
    </main>
  );
}

type LandingCallout = {
  description: string;
  title: string;
};

type LandingPreviewLabels = {
  account: string;
  activePlan: string;
  aiCredit: string;
  billing: string;
  cat: string;
  handoff: string;
  note: string;
  plan: string;
  publish: string;
  result: string;
  taskOne: string;
  taskTwo: string;
  title: string;
};

function CalloutCard({ item }: { item: LandingCallout }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-semibold text-slate-950">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {item.description}
      </p>
    </div>
  );
}

function ProductPreview({ labels }: { labels: LandingPreviewLabels }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm shadow-slate-900/[0.04]">
      <div className="border-b border-slate-200 bg-slate-950 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-cyan-200">
              CatCare Studio
            </p>
            <h2 className="mt-2 text-xl font-semibold">{labels.title}</h2>
          </div>
          <Badge tone="ready">{labels.publish}</Badge>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">
            {labels.account}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {labels.cat}
          </p>
          <div className="mt-5 grid gap-3">
            <MiniFact label={labels.billing} value="Plus" />
            <MiniFact label={labels.aiCredit} value="84k" />
          </div>
        </aside>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">
                {labels.activePlan}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                {labels.plan}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {labels.note}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">
                {labels.result}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {labels.handoff}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <TaskRow label="01" text={labels.taskOne} />
            <TaskRow label="02" text={labels.taskTwo} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function TaskRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-500">
        {label}
      </span>
      <p className="text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}
