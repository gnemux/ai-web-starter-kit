import { type DemoItem } from "@starter/core";
import {
  AppShell,
  BrandMark,
  EmptyState,
  ErrorState,
  Panel,
  SectionHeader,
  StatusBadge
} from "@starter/ui";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentAccount } from "@/lib/services/auth";
import { listDemoItems } from "@/lib/services/demo-items";

import { AccountIcon, DashboardIcon } from "../../components/app-icons";
import { DemoItemForm } from "./demo-item-form";

export default async function DashboardPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    redirect("/login?next=/dashboard");
  }

  const demoItemsResult = await listDemoItems();
  const displayName = accountResult.data.profile?.displayName;
  const userLabel =
    displayName || accountResult.data.user.email || copy.dashboard.eyebrow;
  const navItems = [
    {
      href: "/dashboard",
      label: copy.common.nav.dashboard,
      active: true,
      icon: <DashboardIcon />
    },
    {
      href: "/account",
      label: copy.common.nav.account,
      icon: <AccountIcon />
    }
  ];

  return (
    <AppShell
      action={
        <AccountMenu
          avatarUrl={accountResult.data.profile?.avatarUrl}
          email={accountResult.data.user.email}
          labels={copy.common.accountMenu}
          name={userLabel}
        />
      }
      brand={<BrandMark subtitle={copy.dashboard.shellSubtitle} />}
      navItems={navItems}
      user={{
        name: userLabel,
        role: accountResult.data.user.email
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-700">
              {copy.dashboard.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              {copy.dashboard.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {copy.dashboard.description}
            </p>
          </div>
        </section>

        <Panel id="demo-data">
          <SectionHeader
            action={
              <StatusBadge
                label={
                  demoItemsResult.ok
                    ? copy.dashboard.demo.statusReady
                    : copy.dashboard.demo.statusError
                }
                status={demoItemsResult.ok ? "ready" : "risk"}
              />
            }
            description={copy.dashboard.demo.description}
            title={copy.dashboard.demo.title}
          />

          {demoItemsResult.ok ? (
            <DemoItemsList
              items={demoItemsResult.data.items}
              labels={copy.dashboard.demo}
            />
          ) : (
            <ErrorState
              badgeLabel={copy.common.status.risk}
              description={`${demoItemsResult.error.code}: ${demoItemsResult.error.message}`}
              title={copy.dashboard.demo.serviceErrorTitle}
            />
          )}

          <DemoItemForm
            errorLabels={copy.errors.demo}
            labels={copy.dashboard.demo}
          />
        </Panel>
      </div>
    </AppShell>
  );
}

type DemoItemLabels = {
  emptyTitle: string;
  emptyDescription: string;
  itemVisibility: {
    private: string;
    public: string;
  };
  itemStatus: {
    active: string;
    archived: string;
  };
};

function DemoItemsList({
  items,
  labels
}: {
  items: DemoItem[];
  labels: DemoItemLabels;
}) {
  if (items.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState
          description={labels.emptyDescription}
          title={labels.emptyTitle}
        />
      </div>
    );
  }

  return (
    <div className="mt-5 divide-y divide-slate-200">
      {items.map((item) => (
        <div className="py-4 first:pt-0 last:pb-0" key={item.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-950">
                  {item.title}
                </h3>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500">
                  {labels.itemVisibility[item.visibility]}
                </span>
              </div>
              {item.notes ? (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.notes}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 text-xs font-medium text-slate-400">
              {labels.itemStatus[item.status]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
