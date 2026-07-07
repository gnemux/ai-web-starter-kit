import type { AuthMode } from "@xwlc/core";
import { Button } from "@xwlc/ui";

import { CatCareBrand } from "@/components/catcare-brand";
import {
  CatCareAiChecklistIcon,
  CatCareFeedingRoutineIcon,
  CatCareProfileIcon,
} from "@/components/catcare-icons";
import {
  CatCareIconFrame,
  CatCareHeroImage,
  CatCareProductFrame
} from "@/components/catcare-ui";
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
  const productPointIcons = [
    <CatCareProfileIcon className="h-6 w-6" key="cat-profile" />,
    <CatCareFeedingRoutineIcon className="h-6 w-6" key="routine" />,
    <CatCareAiChecklistIcon className="h-6 w-6" key="checklist" />
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf8f3] px-3 py-3 text-slate-950 sm:px-5 sm:py-5">
      <CatCareProductFrame className="grid min-w-0 min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[minmax(24rem,0.94fr)_minmax(0,1.06fr)]">
        <section className="min-w-0 flex flex-col bg-white px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
            <CatCareBrand />
            <Button href="/" variant="secondary">
              {copy.common.backHome}
            </Button>
          </div>

          <div className="mx-auto mt-8 w-full max-w-md lg:mt-10">
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
                welcomeBack: copy.login.welcomeBack,
                rememberMe: copy.login.rememberMe,
                forgotPassword: copy.login.forgotPassword
              }}
              nextPath={nextPath}
              oauthLabels={copy.login.oauth}
            />
          </div>
        </section>

        <aside className="hidden overflow-hidden border-l border-slate-200 bg-[#fff8f0] lg:grid lg:grid-rows-[minmax(15rem,0.62fr)_minmax(0,1fr)]">
          <CatCareHeroImage className="min-h-0" />
          <div className="mx-auto w-full max-w-2xl px-12 py-7 xl:py-9">
            <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 xl:text-[3.2rem]">
              {copy.login.sideTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              {copy.login.sideDescription}
            </p>

            <div className="mt-7 grid gap-4">
              {copy.login.productPoints.map((point, index) => (
                <div
                  className="grid grid-cols-[2.4rem_3.5rem_minmax(0,1fr)] items-start gap-4"
                  key={point.title}
                >
                  <span className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-base font-semibold text-white">
                    {index + 1}
                  </span>
                  <CatCareIconFrame className="!ring-[#fff8f0]" size="md">
                    {productPointIcons[index]}
                  </CatCareIconFrame>
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {point.title}
                    </p>
                    <p className="mt-1 text-base leading-6 text-slate-600">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </CatCareProductFrame>
    </main>
  );
}

function normalizeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/catcare";
  }

  return value;
}
