import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";

export function ProductShell({ children }: { children: ReactNode }) {
  return <div className="shell"><header className="site-header"><Link href={productConfig.paths.home} aria-label={`${productConfig.identity.name} home`}><BrandMark mark={productConfig.identity.mark} name={productConfig.identity.name} /></Link><nav aria-label="Primary">{productConfig.navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></header><main>{children}</main><footer><p>{productConfig.identity.tagline}</p><nav aria-label="Footer">{productConfig.footerLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></footer></div>;
}
