import { Badge, BrandMark, Button, Panel } from "@xwlc/ui";

import { AccountMenu } from "@/components/account-menu";
import { ArrowRightIcon } from "@/components/app-icons";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccountForPublicShell } from "@/lib/services/auth";

export default async function DemoHomePage() {
  const [locale, currentAccount] = await Promise.all([
    getRequestLocale(),
    getCurrentAccountForPublicShell()
  ]);
  const copy = getDictionary(locale);
  const accountLabel =
    currentAccount?.profile?.displayName ||
    currentAccount?.user.email ||
    copy.common.accountMenu.signedIn;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark subtitle={copy.demo.subtitle} />
          <div className="flex items-center justify-end gap-3">
            <a
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline"
              href="/"
            >
              {copy.demo.productLink}
            </a>
            {currentAccount ? (
              <AccountMenu
                avatarUrl={currentAccount.profile?.avatarUrl}
                email={currentAccount.user.email}
                labels={copy.common.accountMenu}
                name={accountLabel}
                surface="demo"
              />
            ) : (
              <Button href="/demo/login?next=/dashboard" variant="secondary">
                {copy.common.login}
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="min-w-0">
          <Badge tone="ready">{copy.demo.badge}</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-normal text-slate-950 sm:text-5xl">
            {copy.demo.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.demo.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              href={currentAccount ? "/dashboard" : "/demo/login?next=/dashboard"}
              icon={<ArrowRightIcon />}
            >
              {currentAccount ? copy.demo.openDashboard : copy.demo.signIn}
            </Button>
            <Button href="/" variant="secondary">
              {copy.demo.productLink}
            </Button>
          </div>
        </div>

        <Panel className="p-6">
          <div className="grid gap-4">
            {copy.demo.cards.map((card) => (
              <div
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={card.title}
              >
                <p className="text-sm font-semibold text-slate-950">
                  {card.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}
