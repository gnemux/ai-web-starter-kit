import type { Dictionary } from "@/lib/i18n";

import {
  AccountIcon,
  BillingIcon,
  DashboardIcon,
  UsageIcon
} from "./app-icons";

export type WorkspaceNavKey = "dashboard" | "profile" | "billing" | "usage";

export function getWorkspaceNavItems(
  copy: Dictionary,
  activeItem: WorkspaceNavKey
) {
  return [
    {
      href: "/dashboard",
      label: copy.common.nav.dashboard,
      active: activeItem === "dashboard",
      icon: <DashboardIcon />
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
}
