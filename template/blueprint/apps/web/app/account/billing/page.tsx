import { redirect } from "next/navigation";
import { PageHeader, StatePanel } from "@xwlc/ui";
import { resolveCapabilityRegistry } from "@xwlc/platform";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
export const dynamic = "force-dynamic";
export default async function BillingPage() {
  const account = await getCurrentAccount();
  if (account.configured && !account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.billing)}`);
  const capability = resolveCapabilityRegistry(productConfig.capabilities, process.env).find((entry) => entry.id === "payment")!;
  const content = capability.state === "disabled"
    ? { kind: "disabled" as const, title: "Payment disabled", description: "Enable sandbox for safe product testing or configure a reviewed external provider." }
    : capability.state === "not_configured"
      ? { kind: "error" as const, title: "Payment configuration incomplete", description: `External mode requires: ${capability.requiredEnvironment.join(", ")}.` }
      : { kind: "empty" as const, title: capability.mode === "sandbox" ? "Payment sandbox ready" : "External payment configured", description: "The capability registry is ready; product pricing and trusted server facts remain product-owned." };
  return <div className="page"><PageHeader title="Billing" description="A product-configured surface over trusted server-side billing facts." /><StatePanel {...content} /></div>;
}
