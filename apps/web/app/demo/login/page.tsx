import type { AuthMode } from "@xwlc/core";
import { Badge, BrandMark, Button, Panel } from "@xwlc/ui";

import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

import { AuthForm } from "../../login/auth-form";

type DemoLoginSearchParams = {
  mode?: string;
  next?: string;
  error?: string;
};

export default async function DemoLoginPage({
  searchParams
}: {
  searchParams: Promise<DemoLoginSearchParams>;
}) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const params = await searchParams;
  const initialMode: AuthMode = params.mode === "signup" ? "signup" : "signin";
  const nextPath = normalizeNext(params.next);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <section className="min-w-0">
          <BrandMark subtitle={copy.demo.login.subtitle} />
          <div className="mt-10">
            <Badge tone="in-progress">{copy.demo.login.badge}</Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              {copy.demo.login.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              {copy.demo.login.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/demo" variant="secondary">
                {copy.demo.backToDemo}
              </Button>
              <Button href="/" variant="ghost">
                {copy.demo.productLink}
              </Button>
            </div>
          </div>
        </section>

        <Panel className="mx-auto w-full max-w-md p-6">
          {params.error === "confirmation_failed" ? (
            <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3">
              <p className="text-sm font-medium text-rose-900">
                {copy.login.confirmationFailed}
              </p>
            </div>
          ) : null}

          <AuthForm
            defaultNextPath="/dashboard"
            errorLabels={copy.errors.auth}
            initialMode={initialMode}
            labels={{
              ...copy.login.form,
              accessDashboard: copy.demo.login.accessDashboard,
              providerNote: copy.demo.login.providerNote,
              startWithEmail: copy.demo.login.startWithEmail,
              welcomeBack: copy.demo.login.welcomeBack
            }}
            modePath="/demo/login"
            nextPath={nextPath}
          />
        </Panel>
      </div>
    </main>
  );
}

function normalizeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}
