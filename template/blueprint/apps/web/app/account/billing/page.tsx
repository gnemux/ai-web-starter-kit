import { redirect } from "next/navigation";
import { PageHeader, StatePanel } from "@xwlc/ui";
import { resolveCapabilityRegistry } from "@xwlc/platform";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
import { createSandboxCheckoutIntent } from "@/modules/platform/payment/sandbox";
export const dynamic = "force-dynamic";
export default async function BillingPage() {
  const account = await getCurrentAccount();
  if (account.configured && !account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.billing)}`);
  const capability = resolveCapabilityRegistry(productConfig.capabilities, process.env).find((entry) => entry.id === "payment")!;
  const sandbox = capability.mode === "sandbox" && capability.state === "enabled" ? createSandboxCheckoutIntent({ idempotencyKey: "preview:checkout", currency: "usd", amountCents: 0 }) : null;
  const content = capability.state === "disabled"
    ? { kind: "disabled" as const, title: "Payment disabled", description: "Enable sandbox for safe product testing or configure a reviewed external provider." }
    : capability.state === "not_configured"
      ? { kind: "error" as const, title: "Payment configuration incomplete", description: `External mode requires: ${capability.requiredEnvironment.join(", ")}.` }
      : capability.state === "not_implemented"
        ? { kind: "disabled" as const, title: "External payment adapter not implemented", description: "Select a reviewed provider and implement its server adapter before enabling external payment." }
        : { kind: "empty" as const, title: "Payment sandbox ready", description: `${sandbox?.status}; external side effects: ${String(sandbox?.externalSideEffect)}. Product pricing and trusted server facts remain product-owned.` };
  return <div className="page"><PageHeader title="Billing" description="A product-configured surface over trusted server-side billing facts." /><StatePanel {...content} /></div>;
}
