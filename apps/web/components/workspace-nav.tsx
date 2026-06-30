import type { Dictionary } from "@/lib/i18n";

import {
  AccountIcon,
  BillingIcon,
  DashboardIcon,
  OverviewIcon,
  UsageIcon
} from "./app-icons";

export type WorkspaceNavKey =
  | "dashboard"
  | "referenceProduct"
  | "profile"
  | "billing"
  | "usage";

export function getWorkspaceNavItems(
  copy: Dictionary,
  activeItem: WorkspaceNavKey,
  options: { includeDashboard?: boolean } = {}
) {
  const items = [
    {
      href: "/dashboard",
      label: copy.common.nav.dashboard,
      active: activeItem === "dashboard",
      icon: <DashboardIcon />
    },
    {
      href: "/reference-product",
      label: copy.common.nav.referenceProduct,
      active: activeItem === "referenceProduct",
      icon: <OverviewIcon />
    },
    {
      href: "/account",
      label: copy.common.nav.profile,
      active: activeItem === "profile",
      icon: <AccountIcon />
    },
    {
      href: "/account/billing",
      label: copy.common.nav.billing,
      active: activeItem === "billing",
      icon: <BillingIcon />
    },
    {
      href: "/account/usage",
      label: copy.common.nav.usage,
      active: activeItem === "usage",
      icon: <UsageIcon />
    }
  ];

  return options.includeDashboard === false
    ? items.filter((item) => item.href !== "/dashboard")
    : items;
}
