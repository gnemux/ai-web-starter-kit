import { redirect } from "next/navigation";
import { PageHeader, StatePanel } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
export const dynamic = "force-dynamic";
export default async function BillingPage() { const account = await getCurrentAccount(); if (account.configured && !account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.billing)}`); return <div className="page"><PageHeader title="Billing" description="A product-configured surface over trusted server-side billing facts." /><StatePanel kind="disabled" title="Payment disabled" description="Add a reviewed product-owned adapter and catalog before enabling payment." /></div>; }
