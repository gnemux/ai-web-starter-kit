import type { AuthMode } from "@starter/core";
import { Badge, BrandMark, Button, Panel } from "@starter/ui";

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
  const params = await searchParams;
  const initialMode: AuthMode = params.mode === "signup" ? "signup" : "signin";
  const nextPath = normalizeNext(params.next);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <section className="min-w-0">
          <BrandMark subtitle="Supabase Auth template" />
          <div className="mt-10">
            <Badge tone="in-progress">GNE-5 · M4 Auth</Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Sign in to the product workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              Supabase owns identity and sessions. The app keeps account logic
              behind services and records only safe Auth funnel events.
            </p>
            <div className="mt-8">
              <Button href="/" variant="secondary">
                Back to overview
              </Button>
            </div>
          </div>
        </section>

        <Panel className="mx-auto w-full max-w-md p-6">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              {initialMode === "signup" ? "Create account" : "Welcome back"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              {initialMode === "signup" ? "Start with email" : "Access dashboard"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use the staging Supabase project configured in your local or
              deployment environment.
            </p>
          </div>

          {params.error === "confirmation_failed" ? (
            <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3">
              <p className="text-sm font-medium text-rose-900">
                The confirmation link could not be verified.
              </p>
            </div>
          ) : null}

          <AuthForm initialMode={initialMode} nextPath={nextPath} />
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
