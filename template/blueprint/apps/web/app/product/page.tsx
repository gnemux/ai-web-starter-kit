import { redirect } from "next/navigation";
import { PageHeader, StatePanel } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
export const dynamic = "force-dynamic";
export default async function ProductPage() { const account = await getCurrentAccount(); if (!account.configured) return <div className="page"><StatePanel kind="disabled" title="Product access is safely disabled" description="Configure Authentication before building the private product experience." /></div>; if (!account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.product)}`); return <div className="page"><PageHeader eyebrow="Product-owned module" title="Replace this boundary with your product" description="Keep product routes and domain logic here. Consume platform facades and public package roots without modifying the foundation for product copy or DTOs." /><StatePanel kind="empty" title="Ready for a real workflow" description="Add the smallest complete customer journey for this product." /></div>; }
