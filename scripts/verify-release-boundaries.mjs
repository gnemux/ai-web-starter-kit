import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function section(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    return "";
  }

  return source.slice(startIndex, endIndex);
}

const authService = read("apps/web/lib/services/auth.ts");
const authForm = read("apps/web/app/login/auth-form.tsx");
const billingService = read("apps/web/lib/services/billing.ts");
const paymentService = read("apps/web/lib/services/payment.ts");
const paymentCheckoutPage = read("apps/web/app/account/payment/checkout/page.tsx");
const paymentResultPage = read("apps/web/app/account/payment/result/page.tsx");
const paymentWebhookRoute = read("apps/web/app/api/payment/webhook/route.ts");
const providerServer = read("apps/web/lib/providers/server.ts");
const supabaseServer = read("apps/web/lib/supabase/server.ts");
const supabaseProxy = read("apps/web/lib/supabase/proxy.ts");
const entitlementIdempotencyMigration = read(
  "supabase/migrations/20260624044653_add_billing_entitlement_source_idempotency.sql"
);

const signIn = section(
  authService,
  "export async function signInWithPasswordFromFormData",
  "export async function signUpWithPasswordFromFormData"
);
expect(
  signIn.includes("email_confirmed_at") &&
    signIn.includes("auth.signOut()") &&
    signIn.includes('"forbidden"'),
  "Sign-in must reject and sign out unconfirmed Supabase Auth users."
);

const signUp = section(
  authService,
  "export async function signUpWithPasswordFromFormData",
  "export async function signOutCurrentUser"
);
expect(
  signUp.includes("data.session && data.user.email_confirmed_at") &&
    signUp.includes("auth.signOut()") &&
    signUp.includes('"confirmation_pending"'),
  "Sign-up must not leave an unconfirmed Supabase session authenticated."
);

const getAppUrl = section(authService, "function getAppUrl", "async function");
expect(
  getAppUrl.includes("NEXT_PUBLIC_APP_ENV") &&
    getAppUrl.includes("process.env.VERCEL") &&
    getAppUrl.includes("localhost|127") &&
    getAppUrl.includes("Production Auth confirmation URL is not configured"),
  "Production/preview Auth confirmation URLs must not fall back to localhost."
);

expect(
  authForm.includes("hasSubmittedCurrentMode") &&
    authForm.includes("state?.mode === mode") &&
    authForm.includes("state.mode === submittedMode") &&
    authForm.includes("setHasSubmittedCurrentMode(false)") &&
    authForm.includes("router.replace(buildModeUrl(nextMode, nextPath))"),
  "Auth form state must stay scoped to the submitted login/signup mode."
);

expect(
  supabaseProxy.includes(
    "const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`"
  ) &&
    supabaseProxy.includes('loginUrl.searchParams.set("next", nextPath)'),
  "Protected-route login redirects must preserve the original pathname and query string."
);

expect(
  supabaseServer.startsWith('import "server-only";') &&
    supabaseServer.includes("createSupabaseAdminClient") &&
    supabaseServer.includes("SUPABASE_SECRET_KEY") &&
    supabaseServer.includes("SUPABASE_SERVICE_ROLE_KEY") &&
    !/NEXT_PUBLIC_[A-Z0-9_]*(SERVICE|SECRET)/.test(supabaseServer),
  "Supabase admin helper must remain server-only and must not use NEXT_PUBLIC secrets."
);

const paymentResultState = section(
  paymentService,
  "export async function getPaymentResultState",
  "export async function processSandboxCheckoutResult"
);
expect(
  paymentResultState.includes("orderId?: string") &&
    paymentResultState.includes("getCurrentAccount()") &&
    paymentResultState.includes("getConfirmedPaymentResultOrder") &&
    paymentResultState.includes("returnTo: normalizeReturnTo"),
  "Payment result state must require a current account and trusted order lookup."
);

const sandboxCheckoutState = section(
  paymentService,
  "export function getSandboxCheckoutState",
  "export async function getPaymentResultState"
);
const sandboxCheckoutResult = section(
  paymentService,
  "export async function processSandboxCheckoutResult",
  "export async function reviewPaymentQuotaLimit"
);
const sandboxGuard = section(
  paymentService,
  "function assertSandboxPaymentReviewEnabled",
  "function normalizePaymentAnalyticsMode"
);
expect(
  sandboxCheckoutState.includes("assertSandboxPaymentReviewEnabled") &&
    sandboxCheckoutResult.includes("assertSandboxPaymentReviewEnabled") &&
    sandboxGuard.includes("isSandboxPaymentReviewProvider") &&
    sandboxGuard.includes('provider.descriptor.provider === "sandbox"') &&
    sandboxGuard.includes('provider.descriptor.mode === "sandbox"') &&
    sandboxGuard.includes("Sandbox payment review is not enabled"),
  "Sandbox payment review must be disabled outside the sandbox provider."
);

expect(
  paymentService.includes("recordSandboxPendingCheckout") &&
    paymentService.includes("assertSandboxPendingCheckout") &&
    paymentService.includes('eventId: `${input.checkoutSessionId}:pending`') &&
    paymentService.includes('.eq("status", "pending")') &&
    billingService.includes('.neq("status", "pending")'),
  "Sandbox checkout success must require a pending checkout session and hide pending records from account activity."
);

expect(
  entitlementIdempotencyMigration.includes(
    "billing_entitlements_source_feature_unique"
  ) &&
    entitlementIdempotencyMigration.includes(
      "unique (source_type, source_id, feature_key)"
    ) &&
    paymentService.includes('onConflict: "source_type,source_id,feature_key"') &&
    paymentService.includes('source_type: "credit_pack"') &&
    paymentService.includes('source_id: orderResult.data.id'),
  "AI credit pack entitlements must be idempotent by trusted source and feature."
);

const confirmedOrder = section(
  paymentService,
  "async function getConfirmedPaymentResultOrder",
  "export async function processSandboxCheckoutResult"
);
expect(
  confirmedOrder.includes('from("billing_orders")') &&
    confirmedOrder.includes('.eq("owner_id", input.ownerId)') &&
    confirmedOrder.includes('.eq("status", mapResultToOrderStatus(input.status))') &&
    confirmedOrder.includes('query.eq("id", orderId)') &&
    confirmedOrder.includes('query.eq("provider_checkout_session_id"') &&
    confirmedOrder.includes('"not_found"'),
  "Payment success pages must be backed by the current user's billing order."
);

expect(
  paymentResultPage.includes("getParam(params.billing_order_id)") &&
    paymentResultPage.includes("getParam(params.checkout_id)") &&
    paymentResultPage.includes("shouldCleanPaymentResultUrl") &&
    paymentResultPage.includes("redirect(buildCleanPaymentResultUrl") &&
    paymentResultPage.includes("billing_order_id"),
  "Payment result page must accept provider session IDs and clean provider parameters after verification."
);

expect(
  paymentCheckoutPage.includes("mapCheckoutErrorCode") &&
    paymentCheckoutPage.includes('params.set("checkout_error", code)') &&
    !paymentCheckoutPage.includes("result.error.message"),
  "Payment checkout redirects must expose short error codes instead of raw service messages."
);

expect(
  paymentWebhookRoute.includes("mapWebhookErrorResponse") &&
    paymentWebhookRoute.includes("Webhook endpoint is not available.") &&
    paymentWebhookRoute.includes("Webhook signature verification failed.") &&
    paymentWebhookRoute.includes("Invalid webhook payload.") &&
    !paymentWebhookRoute.includes("error: result.error.message"),
  "Payment webhook route must not expose internal service error messages."
);

const creemSuccessUrl = section(
  providerServer,
  "function resolveCreemSuccessUrl",
  "function withPriceId"
);
expect(
  creemSuccessUrl.includes("NEXT_PUBLIC_APP_ENV") &&
    creemSuccessUrl.includes("PAYMENT_MODE") &&
    creemSuccessUrl.includes("PAYMENT_LIVE_ENABLED") &&
    creemSuccessUrl.includes("allowLocalhost") &&
    creemSuccessUrl.includes("CREEM_CHECKOUT_SUCCESS_URL"),
  "Creem test checkout return URL handling must keep local-test and configured hosted URLs explicit."
);

if (failures.length > 0) {
  console.error("Release boundary verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Release boundary verification passed.");
