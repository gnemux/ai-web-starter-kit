import { redirect } from "next/navigation";
import { StatePanel } from "@xwlc/ui";
import { resolveCapabilityRegistry } from "@xwlc/platform";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
import { ProductWorkspace } from "@/modules/product/product-workspace";
export const dynamic = "force-dynamic";
export default async function ProductPage() {
  const account = await getCurrentAccount();
  if (!account.configured) return <div className="page"><StatePanel kind="disabled" title="Product access is safely disabled" description="Configure Authentication before building the private product experience." /></div>;
  if (!account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.product)}`);
  return <ProductWorkspace capabilities={resolveCapabilityRegistry(productConfig.capabilities, process.env)} />;
}
