"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { AccountMenu } from "@/components/account-menu";
import { BellIcon } from "@/components/app-icons";
import { CatCareBrand } from "@/components/catcare-brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  getWorkspaceNavItems,
  type WorkspaceNavKey
} from "@/components/workspace-nav";
import { trackCatCareEvent } from "@/lib/analytics/client";
import type { Dictionary, Locale } from "@/lib/i18n";

export function CatCareShellClient({
  activeNav,
  avatarUrl,
  billingPlanLabel,
  children,
  copy,
  creditLabel,
  email,
  locale,
  topBar,
  userLabel
}: {
  activeNav?: WorkspaceNavKey;
  avatarUrl?: string | null;
  billingPlanLabel?: string;
  children: ReactNode;
  copy: Dictionary;
  creditLabel?: string;
  email: string;
  locale: Locale;
  topBar?: ReactNode;
  userLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentNav = activeNav ?? getActiveNav(pathname);
  const lastTrackedPathname = useRef<string | null>(null);
  const navItems = getWorkspaceNavItems(copy, currentNav, {
    includeDashboard: false
  });
  const title = navItems.find((item) => item.active)?.label ?? "CatCare";

  useEffect(() => {
    const pageKey = getAnalyticsPageKey(pathname, currentNav);

    if (lastTrackedPathname.current === pathname) {
      return;
    }

    lastTrackedPathname.current = pathname;
    trackCatCareEvent(
      pageKey === "results_detail"
        ? "catcare_results_opened"
        : "catcare_page_viewed",
      {
        is_detail: pageKey.endsWith("_detail"),
        page_key: pageKey,
        status: "viewed",
        surface: "owner"
      }
    );
  }, [currentNav, pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf8f3] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1536px] rounded-none bg-white shadow-sm shadow-slate-900/[0.04] lg:my-2 lg:min-h-[calc(100vh-1rem)] lg:rounded-2xl lg:border lg:border-slate-200">
        <aside className="hidden w-[252px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="px-8 py-8">
            <CatCareBrand href="/catcare" />
          </div>
          <nav aria-label="CatCare" className="grid gap-2 px-6">
            {navItems.map((item) => (
              <Link
                aria-current={item.active ? "page" : undefined}
                className={`relative flex min-h-14 items-center gap-4 rounded-2xl px-4 text-sm font-semibold transition ${
                  item.active
                    ? "bg-[#dff4ee] text-teal-900 shadow-sm shadow-teal-900/[0.06]"
                    : "text-slate-600 hover:bg-[#f2fbf8] hover:text-slate-950"
                }`}
                href={item.href}
                key={item.href}
                onClick={(event) => {
                  trackCatCareEvent("catcare_navigation_clicked", {
                    from_page_key: getAnalyticsPageKey(pathname, currentNav),
                    surface: "owner",
                    target_page_key: getAnalyticsNavKey(item.href)
                  });

                  if (item.href === "/catcare/results") {
                    event.preventDefault();
                    window.location.assign(item.href);
                  }
                }}
                onFocus={() => {
                  if (item.href !== "/catcare/results") {
                    router.prefetch(item.href);
                  }
                }}
                onPointerEnter={() => {
                  if (item.href !== "/catcare/results") {
                    router.prefetch(item.href);
                  }
                }}
                prefetch={item.href === "/catcare/results" ? false : undefined}
              >
                {item.active ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-teal-700"
                  />
                ) : null}
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full [&_img]:h-7 [&_img]:w-7 [&_svg]:h-7 [&_svg]:w-7 ${
                    item.active
                      ? "bg-[#cdeee5] text-teal-900"
                      : "bg-[#e6f7f2] text-teal-700"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-6 pb-6">
            <img
              alt=""
              aria-hidden="true"
              className="h-44 w-full object-contain object-bottom"
              src="/catcare/hero-handoff.webp"
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex min-h-[88px] items-center gap-4 px-4 sm:px-6 lg:px-10">
              <div className="lg:hidden">
                <CatCareBrand href="/catcare" />
              </div>
              {topBar ? (
                <div className="hidden min-w-0 flex-1 lg:block">{topBar}</div>
              ) : (
                <h1 className="hidden min-w-0 flex-1 truncate text-2xl font-semibold tracking-normal text-[#101a32] lg:block">
                  {title}
                </h1>
              )}
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <Link
                  className="hidden h-12 items-center rounded-full bg-slate-100 px-5 text-base font-semibold text-slate-950 transition hover:bg-slate-200 md:inline-flex"
                  href="/account/billing"
                >
                  {billingPlanLabel ?? copy.common.accountMenu.billing}
                </Link>
                <span className="hidden text-base font-semibold text-slate-950 xl:inline-flex">
                  {copy.account.billing.catcareCreditTitle}{" "}
                  {creditLabel ?? copy.catcare.owner.dashboard.creditUnavailable}
                </span>
                <div className="hidden md:block">
                  <LanguageSwitcher labels={copy.common} locale={locale} />
                </div>
                <span className="relative hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 sm:flex">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    3
                  </span>
                </span>
                <AccountMenu
                  avatarUrl={avatarUrl}
                  email={email}
                  labels={copy.common.accountMenu}
                  name={userLabel}
                  showDashboard={false}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3 md:hidden">
              <Link
                className="inline-flex h-10 items-center rounded-full bg-slate-100 px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                href="/account/billing"
              >
                {billingPlanLabel ?? copy.common.accountMenu.billing}
              </Link>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">
                {copy.account.billing.catcareCreditTitle}{" "}
                {creditLabel ?? copy.catcare.owner.dashboard.creditUnavailable}
              </span>
              <LanguageSwitcher labels={copy.common} locale={locale} />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-3 sm:grid-cols-4 lg:hidden">
              {navItems.map((item) => (
                <Link
                  aria-current={item.active ? "page" : undefined}
                  className={`flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
                    item.active
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={(event) => {
                    trackCatCareEvent("catcare_navigation_clicked", {
                      from_page_key: getAnalyticsPageKey(pathname, currentNav),
                      surface: "owner",
                      target_page_key: getAnalyticsNavKey(item.href)
                    });

                    if (item.href === "/catcare/results") {
                      event.preventDefault();
                      window.location.assign(item.href);
                    }
                  }}
                  onFocus={() => {
                    if (item.href !== "/catcare/results") {
                      router.prefetch(item.href);
                    }
                  }}
                  onPointerEnter={() => {
                    if (item.href !== "/catcare/results") {
                      router.prefetch(item.href);
                    }
                  }}
                  prefetch={item.href === "/catcare/results" ? false : undefined}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center [&_img]:h-5 [&_img]:w-5 [&_svg]:h-5 [&_svg]:w-5">
                    {item.icon}
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </header>
          <main className="min-w-0 flex-1 bg-[#fbf8f3] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function getActiveNav(pathname: string): WorkspaceNavKey {
  if (pathname.startsWith("/account/billing")) {
    return "billing";
  }

  if (pathname.startsWith("/account")) {
    return "profile";
  }

  if (pathname.startsWith("/catcare/results") || pathname.endsWith("/results")) {
    return "results";
  }

  if (pathname.startsWith("/catcare/cats")) {
    return "cats";
  }

  if (pathname.startsWith("/catcare/routines")) {
    return "routines";
  }

  if (pathname.startsWith("/catcare/items")) {
    return "items";
  }

  if (pathname.startsWith("/catcare/events")) {
    return "events";
  }

  if (pathname.startsWith("/catcare/plans")) {
    return "plans";
  }

  return "catcare";
}

function getAnalyticsPageKey(
  pathname: string,
  currentNav: WorkspaceNavKey
): string {
  if (pathname.endsWith("/results") && pathname.startsWith("/catcare/plans/")) {
    return "results_detail";
  }

  if (pathname.startsWith("/catcare/plans/") && currentNav === "plans") {
    return "plan_detail";
  }

  if (pathname.startsWith("/catcare/cats/") && currentNav === "cats") {
    return "cat_detail";
  }

  return currentNav;
}

function getAnalyticsNavKey(href: string): string {
  if (href === "/account/billing") {
    return "billing";
  }

  if (href === "/catcare") {
    return "catcare";
  }

  return href.replace("/catcare/", "");
}
