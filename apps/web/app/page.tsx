import { Button } from "@xwlc/ui";

import { AccountMenu } from "@/components/account-menu";
import { ArrowRightIcon } from "@/components/app-icons";
import { CatCareBrand } from "@/components/catcare-brand";
import {
  CatCareFlowStrip,
  CatCareHeroImage,
  CatCarePricingCard,
  CatCareProductFrame
} from "@/components/catcare-ui";
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
    ? "/catcare"
    : "/login?mode=signup&next=/catcare";
  const primaryLabel = currentAccount
    ? copy.home.primaryActionSignedIn
    : copy.home.primaryAction;
  const secondaryHref = "#product-flow";
  const secondaryLabel = copy.home.secondaryAction;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf8f3] px-3 py-3 text-slate-950 sm:px-5 sm:py-5">
      <CatCareProductFrame className="min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)]">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
            <CatCareBrand size="lg" />
            <nav
              aria-label="CatCare"
              className="hidden items-center gap-10 text-base font-semibold text-slate-700 md:flex"
            >
              <a className="hover:text-slate-950" href="#product-flow">
                {copy.home.nav.flow}
              </a>
              <a className="hover:text-slate-950" href="#product-flow">
                {copy.home.nav.features}
              </a>
              <a className="hover:text-slate-950" href="#pricing">
                {copy.home.nav.pricing}
              </a>
              <a className="hover:text-slate-950" href="#pricing">
                {copy.home.nav.aiCredit}
              </a>
            </nav>
            <div className="flex items-center justify-end gap-3">
              {currentAccount ? (
                <AccountMenu
                  avatarUrl={currentAccount.profile?.avatarUrl}
                  email={currentAccount.user.email}
                  labels={copy.common.accountMenu}
                  name={currentAccountLabel}
                  showDashboard={false}
                />
              ) : (
                <>
                  <Button
                    className="min-h-12 rounded-xl px-6 text-base"
                    href="/login?next=/catcare"
                    variant="secondary"
                  >
                    {copy.common.login}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="grid items-stretch gap-0 border-b border-slate-200 lg:grid-cols-[minmax(0,1.02fr)_minmax(28rem,0.98fr)]">
          <div className="min-w-0 px-6 py-8 sm:px-10 lg:px-14 lg:py-9">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.07] tracking-normal text-slate-950 sm:text-5xl lg:text-[3.25rem]">
              {copy.home.title}
              <span className="block">{copy.home.titleAccent}</span>
            </h1>
            {copy.home.description ? (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {copy.home.description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="min-h-14 rounded-xl bg-teal-700 px-7 text-base hover:bg-teal-800"
                href={primaryHref}
                icon={<ArrowRightIcon />}
              >
                {primaryLabel}
              </Button>
              <Button
                className="min-h-14 rounded-xl border-teal-700 px-7 text-base text-teal-800"
                href={secondaryHref}
                variant="secondary"
              >
                {secondaryLabel}
              </Button>
            </div>
            <p className="mt-6 text-sm font-medium text-teal-800">
              {copy.home.trustLine}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {copy.home.metaLine}
            </p>
          </div>

          <div className="grid min-h-[21rem] content-stretch bg-[#fff8f0] lg:min-h-[24rem]">
            <CatCareHeroImage />
          </div>
        </section>

        <section className="bg-white px-5 py-3 sm:px-8 lg:px-12" id="product-flow">
          <CatCareFlowStrip steps={copy.home.callouts} />
        </section>

        <section className="border-t border-slate-200 bg-white" id="pricing">
          <div className="px-5 pb-4 pt-0 sm:px-8 lg:px-12">
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              <CatCarePricingCard
                description={copy.home.pricing.freeDescription}
                image="free"
                price={copy.home.pricing.freePrice}
                title={copy.home.pricing.freeTitle}
              />
              <CatCarePricingCard
                description={copy.home.pricing.proDescription}
                featured
                image="pro"
                price={copy.home.pricing.proPrice}
                title={copy.home.pricing.proTitle}
              />
              <CatCarePricingCard
                description={copy.home.pricing.creditDescription}
                image="credit"
                price={copy.home.pricing.creditPrice}
                title={copy.home.pricing.creditTitle}
              />
            </div>
          </div>
        </section>
      </CatCareProductFrame>
    </main>
  );
}
