import type {
  ProviderCapability,
  ProviderDescriptor
} from "@xwlc/core";

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
    serverEnv: [
      "AUTH_PROVIDER",
      "SUPABASE_PROJECT_REF",
      "SUPABASE_SECRET_KEY",
      "SUPABASE_SERVICE_ROLE_KEY"
    ],
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
    serverEnv: [
      "DATABASE_PROVIDER",
      "SUPABASE_PROJECT_REF",
      "SUPABASE_SECRET_KEY",
      "SUPABASE_SERVICE_ROLE_KEY"
    ],
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
      "NEXT_PUBLIC_PRODUCT_ID",
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_APP_ENV",
      "NEXT_PUBLIC_APP_MARKET",
      "NEXT_PUBLIC_APP_VERSION",
      "NEXT_PUBLIC_MVP_STAGE",
      "NEXT_PUBLIC_ANALYTICS_PROVIDER",
      "NEXT_PUBLIC_POSTHOG_KEY",
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN",
      "NEXT_PUBLIC_POSTHOG_HOST",
      "NEXT_PUBLIC_JIGUANG_APP_KEY"
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
    serverEnv: [
      "PAYMENT_PROVIDER",
      "PAYMENT_MODE",
      "PAYMENT_LIVE_ENABLED",
      "PAYMENT_SECRET_KEY",
      "PAYMENT_PROVIDER_SECRET",
      "PAYMENT_WEBHOOK_SECRET",
      "CREEM_PLUS_MONTHLY_PRODUCT_ID",
      "CREEM_PRO_MONTHLY_PRODUCT_ID",
      "CREEM_AI_CREDIT_PACK_100K_PRODUCT_ID",
      "CREEM_CHECKOUT_SUCCESS_URL"
    ],
    notes:
      "Sandbox checkout contract by default; Creem may be used only as a test-mode adapter while live payment remains disabled."
  },
  {
    capability: "ai",
    provider: "mock",
    mode: "mock",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [
      "AI_PROVIDER",
      "AI_MODEL",
      "AI_PROVIDER_API_KEY",
      "AI_BUDGET_LIMIT"
    ],
    notes:
      "Mock text generation contract only; real model SDKs and keys remain out of scope, and AI_BUDGET_LIMIT can cap high-cost requests before provider creation."
  },
  {
    capability: "ai",
    provider: "noop",
    mode: "noop",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [
      "AI_PROVIDER",
      "AI_MODEL",
      "AI_PROVIDER_API_KEY",
      "AI_BUDGET_LIMIT"
    ],
    notes:
      "No-op AI contract for environments where AI workflows should render without provider behavior."
  },
  {
    capability: "email",
    provider: "noop",
    mode: "noop",
    runtime: "server",
    configStatus: "configured",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [
      "EMAIL_PROVIDER",
      "EMAIL_PROVIDER_API_KEY",
      "EMAIL_FROM_ADDRESS"
    ],
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
    serverEnv: [
      "STORAGE_PROVIDER",
      "STORAGE_ENDPOINT",
      "STORAGE_BUCKET",
      "STORAGE_ACCESS_KEY_ID",
      "STORAGE_SECRET_ACCESS_KEY"
    ],
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
    serverEnv: [
      "SMS_PROVIDER",
      "SMS_PROVIDER_API_KEY",
      "SMS_PROVIDER_SECRET",
      "SMS_SENDER_ID"
    ],
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
      "NEXT_PUBLIC_APP_NAME",
      "NEXT_PUBLIC_PRODUCT_ID",
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_APP_ENV",
      "NEXT_PUBLIC_APP_MARKET",
      "NEXT_PUBLIC_APP_VERSION",
      "NEXT_PUBLIC_MVP_STAGE"
    ],
    serverEnv: [],
    notes:
      "Deployment tokens and Vercel automation credentials are operator-only and not app runtime env."
  }
] as const satisfies readonly ProviderDescriptor[];

export function getProviderDescriptor(
  capability: ProviderCapability,
  provider?: string
): ProviderDescriptor | undefined {
  return providerCatalog.find(
    (descriptor) =>
      descriptor.capability === capability &&
      (!provider || descriptor.provider === provider)
  );
}
