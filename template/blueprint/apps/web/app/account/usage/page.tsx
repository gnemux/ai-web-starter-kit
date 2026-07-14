import { redirect } from "next/navigation";
import { PageHeader, StatePanel } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
export const dynamic = "force-dynamic";
export default async function UsagePage() { const account = await getCurrentAccount(); if (account.configured && !account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.usage)}`); return <div className="page"><PageHeader title="Usage" description="Usage and credit state belongs to the authenticated owner and server ledger." /><StatePanel kind="disabled" title="AI disabled" description="Add a reviewed product-owned adapter and feature budget before enabling AI usage." /></div>; }
