import Link from "next/link";
import { Badge, Card, PageHeader } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const account = await getCurrentAccount();
  const primaryHref = account.user ? productConfig.home.primaryHref : productConfig.paths.login;
  const primaryLabel = account.user ? productConfig.home.primaryAction : "Sign in";
  return <div className="page hero"><div><Badge>{productConfig.home.eyebrow}</Badge><PageHeader title={productConfig.home.title} description={productConfig.home.description} /><div className="actions"><Link className="button" href={primaryHref}>{primaryLabel}</Link><Link className="button secondary" href={productConfig.home.secondaryHref}>{productConfig.home.secondaryAction}</Link></div></div><Card><p className="eyebrow">Foundation state</p><h2>{account.configured ? "Authentication ready" : "Safe local mode"}</h2><p>{account.configured ? "The home call to action follows the current authenticated account." : "Provider credentials are optional. Configure them only when this product is ready to validate that capability."}</p></Card></div>;
}
