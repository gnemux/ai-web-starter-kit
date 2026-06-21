import type {
  ProviderCapability,
  ProviderDescriptor
} from "@starter/core";

export const providerCatalog = [
  {
    capability: "auth",
    provider: "supabase",
    mode: "real",
    runtime: "server",
    configStatus: "configured",
    serverOnly: false,
    publicEnv: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ],
    serverEnv: ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    notes:
      "Existing Auth calls stay behind apps/web/lib/services/auth.ts and apps/web/lib/supabase/*."
  },
  {
    capability: "database",
    provider: "supabase",
    mode: "real",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ],
    serverEnv: ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    notes:
      "Database access stays in server services and Supabase helpers; RLS remains the security boundary."
  },
  {
    capability: "analytics",
    provider: "posthog",
    mode: "real",
    runtime: "client",
    configStatus: "missing_optional",
    serverOnly: false,
    publicEnv: [
      "NEXT_PUBLIC_APP_NAME",
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_APP_ENV",
      "NEXT_PUBLIC_APP_MARKET",
      "NEXT_PUBLIC_APP_VERSION",
      "NEXT_PUBLIC_MVP_STAGE",
      "NEXT_PUBLIC_POSTHOG_KEY",
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN",
      "NEXT_PUBLIC_POSTHOG_HOST"
    ],
    serverEnv: [],
    notes:
      "PostHog keeps its existing no-op behavior when public analytics env is absent."
  },
  {
    capability: "payment",
    provider: "sandbox",
    mode: "sandbox",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [],
    notes:
      "Sandbox checkout contract only; real provider SDKs and webhook secrets are outside GNE-181."
  },
  {
    capability: "ai",
    provider: "mock",
    mode: "mock",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [],
    notes:
      "Mock text generation contract only; real model SDKs and keys are outside GNE-181."
  },
  {
    capability: "email",
    provider: "noop",
    mode: "noop",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [],
    notes:
      "No-op transactional email contract for future product workflows."
  },
  {
    capability: "storage",
    provider: "noop",
    mode: "noop",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [],
    notes:
      "No-op upload target contract until a product feature needs file storage."
  },
  {
    capability: "sms",
    provider: "noop",
    mode: "noop",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [],
    notes:
      "No-op SMS contract until a product workflow explicitly requires SMS."
  },
  {
    capability: "deploy-cdn",
    provider: "vercel",
    mode: "real",
    runtime: "operator",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_APP_ENV",
      "NEXT_PUBLIC_APP_MARKET",
      "NEXT_PUBLIC_APP_VERSION"
    ],
    serverEnv: [],
    notes:
      "Deployment tokens and Vercel automation credentials are operator-only and not app runtime env."
  }
] as const satisfies readonly ProviderDescriptor[];

export function getProviderDescriptor(
  capability: ProviderCapability
): ProviderDescriptor | undefined {
  return providerCatalog.find(
    (descriptor) => descriptor.capability === capability
  );
}
