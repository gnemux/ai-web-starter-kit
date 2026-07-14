import { redirect } from "next/navigation";
import { PageHeader, StatePanel } from "@xwlc/ui";
import { resolveCapabilityRegistry } from "@xwlc/platform";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
import { createMockAiDraft } from "@/modules/platform/ai/mock";
export const dynamic = "force-dynamic";
export default async function UsagePage() {
  const account = await getCurrentAccount();
  if (account.configured && !account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.usage)}`);
  const capability = resolveCapabilityRegistry(productConfig.capabilities, process.env).find((entry) => entry.id === "ai")!;
  const mock = capability.mode === "mock" && capability.state === "enabled" ? createMockAiDraft("product_onboarding") : null;
  const content = capability.state === "disabled"
    ? { kind: "disabled" as const, title: "AI disabled", description: "Enable mock for safe workflow testing or configure a reviewed external provider." }
    : capability.state === "not_configured"
      ? { kind: "error" as const, title: "AI configuration incomplete", description: `External mode requires: ${capability.requiredEnvironment.join(", ")}.` }
      : capability.state === "not_implemented"
        ? { kind: "disabled" as const, title: "External AI adapter not implemented", description: "Select a reviewed provider and implement its bounded server adapter before enabling external AI." }
        : { kind: "empty" as const, title: "AI mock ready", description: `${mock?.text} Billable: ${String(mock?.billable)}. Product prompts, budgets and usage writes remain server-owned.` };
  return <div className="page"><PageHeader title="Usage" description="Usage and credit state belongs to the authenticated owner and server ledger." /><StatePanel {...content} /></div>;
}
