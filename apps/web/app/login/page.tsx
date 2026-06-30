import type { AuthMode } from "@xwlc/core";
import { Badge, Button } from "@xwlc/ui";

import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

import { AuthForm } from "./auth-form";

type LoginSearchParams = {
  mode?: string;
  next?: string;
  error?: string;
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const params = await searchParams;
  const initialMode: AuthMode = params.mode === "signup" ? "signup" : "signin";
  const nextPath = normalizeNext(params.next);

  return (
    <main className="min-h-screen bg-[#f6fbfa] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl px-4 py-5 sm:px-6 lg:grid-cols-[minmax(25rem,0.88fr)_minmax(0,1.12fr)] lg:px-8">
        <section className="flex min-h-[calc(100vh-2.5rem)] flex-col justify-between rounded-l-lg border border-slate-200 bg-white px-5 py-6 shadow-sm shadow-slate-900/[0.04] lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <CatCareLogo subtitle={copy.login.subtitle} />
            <Button href="/" variant="secondary">
              {copy.common.backHome}
            </Button>
          </div>

          <div className="mx-auto w-full max-w-md py-8">
            <div className="mb-7">
              <Badge tone="ready">{copy.login.badge}</Badge>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-4xl">
                {copy.login.title}
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {copy.login.description}
              </p>
            </div>

            {params.error === "confirmation_failed" ? (
              <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 p-3">
                <p className="text-sm font-medium text-rose-900">
                  {copy.login.confirmationFailed}
                </p>
              </div>
            ) : null}

            <AuthForm
              errorLabels={copy.errors.auth}
              initialMode={initialMode}
              labels={{
                ...copy.login.form,
                accessDashboard: copy.login.accessDashboard,
                providerNote: copy.login.providerNote,
                startWithEmail: copy.login.startWithEmail,
                welcomeBack: copy.login.welcomeBack
              }}
              nextPath={nextPath}
            />
          </div>

          <p className="text-xs leading-5 text-slate-500">
            {copy.login.providerNote}
          </p>
        </section>

        <aside className="hidden min-h-[calc(100vh-2.5rem)] overflow-hidden rounded-r-lg border-y border-r border-slate-200 bg-[#fff8f0] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex justify-end">
            <Badge tone="in-progress">CatCare</Badge>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <CatIllustration />
            <h2 className="mt-8 max-w-lg text-4xl font-semibold leading-tight tracking-normal text-slate-950">
              {copy.login.sideTitle}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              {copy.login.sideDescription}
            </p>

            <div className="mt-8 grid gap-4">
              {copy.login.productPoints.map((point, index) => (
                <div
                  className="flex items-start gap-4 rounded-lg border border-teal-100 bg-white/80 p-4"
                  key={point.title}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-600 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {point.title}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            {copy.login.securityLine}
          </p>
        </aside>
      </div>
    </main>
  );
}

function normalizeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/reference-product";
  }

  return value;
}

function CatCareLogo({ subtitle }: { subtitle: string }) {
  return (
    <a className="flex min-w-0 items-center gap-3" href="/">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-sm font-semibold text-white">
        CC
      </span>
      <span className="min-w-0">
        <span className="block truncate text-2xl font-semibold text-slate-950">
          CatCare
        </span>
        <span className="block truncate text-xs text-slate-500">
          {subtitle}
        </span>
      </span>
    </a>
  );
}

function CatIllustration() {
  return (
    <div className="relative mx-auto h-72 w-full max-w-lg">
      <div className="absolute inset-x-10 bottom-0 h-20 rounded-[50%] bg-teal-600/20" />
      <div className="absolute left-1/2 top-10 h-52 w-72 -translate-x-1/2 rounded-[42%] bg-teal-500/25" />
      <div className="absolute left-1/2 top-16 h-40 w-52 -translate-x-1/2 rounded-[48%] border border-orange-100 bg-white shadow-sm">
        <span className="absolute -left-2 top-8 h-12 w-12 rotate-45 rounded-sm bg-white" />
        <span className="absolute -right-2 top-8 h-12 w-12 rotate-45 rounded-sm bg-white" />
        <span className="absolute left-16 top-16 h-4 w-4 rounded-full bg-slate-950" />
        <span className="absolute right-16 top-16 h-4 w-4 rounded-full bg-slate-950" />
        <span className="absolute left-1/2 top-24 h-3 w-4 -translate-x-1/2 rounded-full bg-orange-300" />
        <span className="absolute left-16 top-28 h-8 w-20 rounded-[50%] border-b border-slate-300" />
        <span className="absolute right-16 top-28 h-8 w-20 rounded-[50%] border-b border-slate-300" />
      </div>
      <div className="absolute bottom-7 left-1/2 h-8 w-40 -translate-x-1/2 rounded-[50%] bg-white/80" />
    </div>
  );
}
