import type { Dictionary } from "@/lib/i18n";

import {
  AccountIcon,
  BillingIcon,
  DashboardIcon,
  UsageIcon
} from "./app-icons";
import {
  CatCareBillingEntitlementsIcon,
  CatCareCareEventsIcon,
  CatCareCarePlanIcon,
  CatCareDashboardIcon,
  CatCareFeedingRoutineIcon,
  CatCarePetSuppliesIcon,
  CatCareProfileIcon,
  CatCareResultsReviewIcon
} from "./catcare-icons";

export type WorkspaceNavKey =
  | "dashboard"
  | "catcare"
  | "cats"
  | "routines"
  | "items"
  | "events"
  | "plans"
  | "results"
  | "profile"
  | "billing"
  | "usage";

export function getWorkspaceNavItems(
  copy: Dictionary,
  activeItem: WorkspaceNavKey,
  options: { includeDashboard?: boolean; surface?: "catcare" | "demo" } = {}
) {
  if (options.surface === "demo") {
    return [
      {
        href: "/dashboard",
        label: copy.common.nav.dashboard,
        active: activeItem === "dashboard",
        icon: <DashboardIcon />
      },
      {
        href: "/demo/account",
        label: copy.common.nav.profile,
        active: activeItem === "profile",
        icon: <AccountIcon />
      },
      {
        href: "/demo/account/billing",
        label: copy.common.nav.billing,
        active: activeItem === "billing",
        icon: <BillingIcon />
      },
      {
        href: "/demo/account/usage",
        label: copy.common.nav.usage,
        active: activeItem === "usage",
        icon: <UsageIcon />
      }
    ];
  }

  const items = [
    {
      href: "/dashboard",
      label: copy.common.nav.dashboard,
      active: activeItem === "dashboard",
      icon: <DashboardIcon />
    },
    {
      href: "/catcare",
      label: copy.common.nav.dashboard,
      active: activeItem === "catcare",
      icon: <CatCareDashboardIcon />
    },
    {
      href: "/catcare/cats",
      label: copy.common.nav.cats,
      active: activeItem === "cats",
      icon: <CatCareProfileIcon />
    },
    {
      href: "/catcare/routines",
      label: copy.common.nav.routines,
      active: activeItem === "routines",
      icon: <CatCareFeedingRoutineIcon />
    },
    {
      href: "/catcare/items",
      label: copy.common.nav.items,
      active: activeItem === "items",
      icon: <CatCarePetSuppliesIcon />
    },
    {
      href: "/catcare/events",
      label: copy.common.nav.events,
      active: activeItem === "events",
      icon: <CatCareCareEventsIcon />
    },
    {
      href: "/catcare/plans",
      label: copy.common.nav.plans,
      active: activeItem === "plans",
      icon: <CatCareCarePlanIcon />
    },
    {
      href: "/catcare/results",
      label: copy.common.nav.results,
      active: activeItem === "results",
      icon: <CatCareResultsReviewIcon />
    },
    {
      href: "/account/billing",
      label: copy.common.nav.billing,
      active: activeItem === "billing",
      icon: <CatCareBillingEntitlementsIcon />
    }
  ];

  return options.includeDashboard === true
    ? items
    : items.filter((item) => item.href !== "/dashboard");
}
