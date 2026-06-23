#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const env = {
  ...loadEnvFiles([".env.local", "apps/web/.env.local"]),
  ...process.env
};

const paymentProvider = env.PAYMENT_PROVIDER ?? "sandbox";
const paymentMode = env.PAYMENT_MODE ?? "sandbox";
const liveEnabled = String(env.PAYMENT_LIVE_ENABLED ?? "false").toLowerCase();
const apiKey = env.PAYMENT_PROVIDER_SECRET || env.CREEM_API_KEY;
const requestedPriceId = process.argv.slice(2).find((arg) => arg !== "--");
const priceId = requestedPriceId || env.CREEM_TEST_PRICE_ID || "pro_monthly";
const errors = [];
const productId = resolveProductId(priceId, env);
const successUrl =
  resolveSuccessUrl(
    env.CREEM_CHECKOUT_SUCCESS_URL,
    env.NEXT_PUBLIC_APP_URL,
    priceId
  );

if (paymentProvider !== "creem") {
  errors.push("PAYMENT_PROVIDER must be creem for this spike.");
}

if (paymentMode !== "test") {
  errors.push("PAYMENT_MODE must be test for Creem PAYMENT-08.");
}

if (liveEnabled !== "false") {
  errors.push("PAYMENT_LIVE_ENABLED must stay false.");
}

if (!apiKey) {
  errors.push(
    "Missing server-only Creem test key. Set PAYMENT_PROVIDER_SECRET or CREEM_API_KEY in ignored local env."
  );
}

if (!productId) {
  errors.push(`Missing Creem product id for ${priceId}.`);
}

if (!successUrl) {
  errors.push(
    "Missing CREEM_CHECKOUT_SUCCESS_URL or HTTPS NEXT_PUBLIC_APP_URL for checkout success URL."
  );
}

if (errors.length > 0) {
  console.error("Creem PAYMENT-08 test checkout is not ready:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error("\nNo request was sent. No secret values were printed.");
  process.exit(1);
}

const response = await fetch("https://test-api.creem.io/v1/checkouts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey
  },
  body: JSON.stringify({
    product_id: productId,
    success_url: successUrl,
    metadata: {
      source: "payment_08_creem_test_checkout",
      payment_provider: paymentProvider,
      payment_mode: paymentMode,
      price_id: priceId
    }
  })
});

const rawText = await response.text();
let payload;

try {
  payload = rawText ? JSON.parse(rawText) : {};
} catch {
  payload = { raw: rawText.slice(0, 500) };
}

if (!response.ok) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        status: response.status,
        statusText: response.statusText,
        error: redactPayload(payload)
      },
      null,
      2
    )
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      status: response.status,
      checkout: extractCheckoutSummary(payload)
    },
    null,
    2
  )
);

function loadEnvFiles(files) {
  const values = {};

  for (const file of files) {
    const path = resolve(process.cwd(), file);

    if (!existsSync(path)) {
      continue;
    }

    const text = readFileSync(path, "utf8");

    for (const line of text.split(/\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const index = trimmed.indexOf("=");

      if (index <= 0) {
        continue;
      }

      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      const parsedValue = stripQuotes(value);

      if (parsedValue === "" && values[key]) {
        continue;
      }

      values[key] = parsedValue;
    }
  }

  return values;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function buildDefaultSuccessUrl(appUrl) {
  if (!appUrl || !appUrl.startsWith("https://")) {
    return "";
  }

  return `${appUrl.replace(/\/$/, "")}/account/payment/result?status=success`;
}

function resolveProductId(priceId, values) {
  const envKeyByPriceId = {
    plus_monthly: "CREEM_PLUS_MONTHLY_PRODUCT_ID",
    pro_monthly: "CREEM_PRO_MONTHLY_PRODUCT_ID",
    ai_credit_pack_100k: "CREEM_AI_CREDIT_PACK_100K_PRODUCT_ID"
  };
  const envKey = envKeyByPriceId[priceId];

  if (!envKey) {
    errors.push(
      "Unsupported price id. Use plus_monthly, pro_monthly, or ai_credit_pack_100k."
    );

    return "";
  }

  return values[envKey] ?? "";
}

function resolveSuccessUrl(configuredUrl, appUrl, priceId) {
  const url = configuredUrl || buildDefaultSuccessUrl(appUrl);

  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    parsedUrl.searchParams.set("price_id", priceId);

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function extractCheckoutSummary(payload) {
  const checkout = payload.checkout ?? payload;

  return {
    id: checkout.id ?? null,
    checkoutUrl:
      checkout.checkoutUrl ??
      checkout.checkout_url ??
      checkout.url ??
      payload.checkoutUrl ??
      payload.checkout_url ??
      null,
    productId:
      checkout.productId ??
      checkout.product_id ??
      checkout.product?.id ??
      payload.productId ??
      payload.product_id ??
      null,
    status: checkout.status ?? payload.status ?? null,
    rawKeys: Object.keys(payload).sort()
  };
}

function redactPayload(value) {
  if (Array.isArray(value)) {
    return value.map(redactPayload);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (/secret|key|token|authorization|signature/i.test(key)) {
        return [key, "[redacted]"];
      }

      return [key, redactPayload(entry)];
    })
  );
}
