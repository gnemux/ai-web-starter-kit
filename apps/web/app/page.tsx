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
  const primaryHref = currentAccount ? "/dashboard" : "/login?mode=signup";
  const primaryLabel = currentAccount
    ? copy.common.dashboard
    : copy.home.primaryAction;
  const secondaryHref = currentAccount ? "/account" : "/login";
  const secondaryLabel = currentAccount
    ? copy.common.account
    : copy.home.secondaryAction;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark subtitle={copy.common.brandSubtitle} />
          <div className="flex justify-end">
            {currentAccount ? (
              <AccountMenu
                avatarUrl={currentAccount.profile?.avatarUrl}
                email={currentAccount.user.email}
                labels={copy.common.accountMenu}
                name={currentAccountLabel}
              />
            ) : (
              <Button href="/login" variant="secondary">
                {copy.common.login}
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col items-center justify-center px-4 pt-8 pb-16 text-center sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-center">
          <Badge tone="neutral">{copy.home.badge}</Badge>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.14] tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
            {copy.home.title}
            <span className="block text-cyan-700">{copy.home.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 tracking-normal text-slate-600 sm:text-lg">
            {copy.home.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={primaryHref} icon={<ArrowRightIcon />}>
              {primaryLabel}
            </Button>
            <Button href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </Button>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-600">
            {copy.home.trustLine}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-normal text-slate-400">
            {copy.home.metaLine}
          </p>
        </div>

        <div className="mt-10 grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-stretch">
          <LandingPreview labels={copy.home.preview} />
          <LandingCallouts items={copy.home.callouts} />
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
  activity: string;
  description: string;
  label: string;
  primaryPanel: string;
  secondaryPanel: string;
  status: string;
  statusValue: string;
  title: string;
};

function LandingCallouts({ items }: { items: readonly LandingCallout[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {items.map((item) => (
        <CalloutCard item={item} key={item.title} />
      ))}
    </div>
  );
}

function CalloutCard({ item }: { item: LandingCallout }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-left">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white">
          {item.title.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-950">
            {item.title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function LandingPreview({ labels }: { labels: LandingPreviewLabels }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm shadow-slate-900/[0.04]">
      <div className="flex min-h-12 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
          </div>
          <p className="truncate text-xs font-semibold uppercase text-slate-500">
            {labels.label}
          </p>
        </div>
        <p className="hidden shrink-0 text-xs font-semibold text-cyan-700 sm:block">
          {labels.statusValue}
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[12rem_1fr]">
        <aside className="border-b border-slate-200 bg-white p-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase text-slate-400">
            {labels.status}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {labels.statusValue}
          </p>
          <div className="mt-6 grid gap-2" aria-hidden="true">
            <span className="h-9 rounded-md bg-slate-950" />
            <span className="h-9 rounded-md bg-slate-100" />
            <span className="h-9 rounded-md bg-slate-100" />
          </div>
        </aside>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-950">
                {labels.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {labels.description}
              </p>
            </div>
            <div className="shrink-0 rounded-md border border-slate-200 px-3 py-2">
              <p className="text-xs font-semibold uppercase text-slate-400">
                {labels.activity}
              </p>
              <div className="mt-2 flex gap-1" aria-hidden="true">
                <span className="h-1.5 w-8 rounded-full bg-cyan-600" />
                <span className="h-1.5 w-6 rounded-full bg-slate-200" />
                <span className="h-1.5 w-5 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_15rem]">
            <section className="min-h-56 border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  {labels.primaryPanel}
                </h3>
                <span className="h-7 w-20 rounded-md bg-white" aria-hidden="true" />
              </div>
              <div className="mt-6 grid gap-3" aria-hidden="true">
                <span className="h-3 w-3/5 rounded-full bg-slate-300" />
                <span className="h-3 w-4/5 rounded-full bg-slate-200" />
                <span className="h-3 w-2/3 rounded-full bg-slate-200" />
              </div>
              <div className="mt-8 grid min-h-24 grid-cols-3 gap-3" aria-hidden="true">
                <span className="border border-slate-200 bg-white" />
                <span className="border border-slate-200 bg-white" />
                <span className="border border-slate-200 bg-white" />
              </div>
            </section>

            <section className="border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700">
                {labels.secondaryPanel}
              </h3>
              <div className="mt-5 grid gap-3" aria-hidden="true">
                <span className="h-9 rounded-md bg-slate-950" />
                <span className="h-9 rounded-md bg-slate-100" />
                <span className="h-2 w-4/5 rounded-full bg-slate-200" />
                <span className="h-2 w-3/5 rounded-full bg-slate-200" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
