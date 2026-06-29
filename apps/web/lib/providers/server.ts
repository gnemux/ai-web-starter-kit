import "server-only";

import { randomUUID } from "node:crypto";

import {
  serviceError,
  serviceOk,
  type AiProvider,
  type AiModelConfig,
  type EmailProvider,
  type PaymentProvider,
  type ProviderCapability,
  type ProviderDescriptor,
  type ServiceResult,
  type SmsProvider,
  type StorageProvider
} from "@xwlc/core";

import { getProviderDescriptor } from "./catalog";

const creemTestCheckoutEndpoint = "https://test-api.creem.io/v1/checkouts";

export function createPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === "creem") {
    return createCreemTestPaymentProvider();
  }

  return createSandboxPaymentProvider();
}

export function createSandboxPaymentProvider(): PaymentProvider {
  const descriptor = requireProviderDescriptor("payment");

  return {
    descriptor,
    async createCheckoutSession(input) {
      const sessionId = `sandbox-checkout-${randomUUID()}`;
      const urlSearchParams = new URLSearchParams({
        cancel_url: input.cancelUrl,
        checkout_session_id: sessionId,
        failure_url: input.failureUrl,
        plan_id: input.planId,
        price_id: input.priceId,
        return_url: input.metadata?.return_url ?? "",
        success_url: input.successUrl
      });

      return serviceOk({
        id: sessionId,
        provider: descriptor.provider,
        mode: descriptor.mode,
        status: "created",
        url: `${input.checkoutUrl}?${urlSearchParams.toString()}`,
        priceId: input.priceId
      });
    }
  };
}

export function createCreemTestPaymentProvider(): PaymentProvider {
  const descriptor: ProviderDescriptor = {
    capability: "payment",
    provider: "creem",
    mode: "real",
    runtime: "server",
    configStatus: process.env.PAYMENT_PROVIDER_SECRET
      ? "configured"
      : "missing_required",
    serverOnly: true,
    publicEnv: [],
    serverEnv: [
      "PAYMENT_PROVIDER",
      "PAYMENT_MODE",
      "PAYMENT_LIVE_ENABLED",
      "PAYMENT_PROVIDER_SECRET",
      "PAYMENT_WEBHOOK_SECRET",
      "CREEM_PLUS_MONTHLY_PRODUCT_ID",
      "CREEM_PRO_MONTHLY_PRODUCT_ID",
      "CREEM_AI_CREDIT_PACK_100K_PRODUCT_ID",
      "CREEM_CHECKOUT_SUCCESS_URL"
    ],
    notes:
      "Creem test-mode checkout adapter only. Live payment remains disabled."
  };

  return {
    descriptor,
    async createCheckoutSession(input) {
      const safetyResult = validateCreemTestModeConfig();

      if (!safetyResult.ok) {
        return safetyResult;
      }

      const productIdResult = resolveCreemProductId(input.priceId);

      if (!productIdResult.ok) {
        return productIdResult;
      }

      const successUrlResult = resolveCreemSuccessUrl(
        input.successUrl,
        input.priceId,
        input.metadata?.return_url
      );

      if (!successUrlResult.ok) {
        return successUrlResult;
      }

      const response = await fetch(creemTestCheckoutEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": safetyResult.data.apiKey
        },
        body: JSON.stringify({
          product_id: productIdResult.data,
          request_id: `payment:${input.userId}:${input.priceId}:${randomUUID()}`,
          metadata: sanitizeProviderMetadata({
            ...input.metadata,
            owner_id: input.userId,
            plan_id: input.planId,
            price_id: input.priceId,
            referenceId: input.userId
          }),
          success_url: successUrlResult.data
        })
      });

      const text = await response.text();
      const payload = parseJsonObject(text);

      if (!response.ok) {
        return serviceError(
          "system_error",
          "Creem test checkout could not be created."
        );
      }

      const checkout = readCheckoutPayload(payload);

      if (!checkout.url) {
        return serviceError(
          "system_error",
          "Creem did not return a checkout URL."
        );
      }

      return serviceOk({
        id: checkout.id ?? `creem-checkout-${randomUUID()}`,
        provider: descriptor.provider,
        mode: descriptor.mode,
        status: "created",
        url: checkout.url,
        priceId: input.priceId
      });
    }
  };
}

export function createConfiguredAiProvider(
  modelConfig: AiModelConfig
): ServiceResult<AiProvider> {
  if (modelConfig.provider === "mock") {
    return serviceOk(createMockAiProvider(modelConfig));
  }

  if (modelConfig.provider === "noop") {
    return serviceOk(createNoopAiProvider(modelConfig));
  }

  return serviceError(
    "configuration_error",
    "The selected AI provider is not configured."
  );
}

export function createMockAiProvider(modelConfig?: AiModelConfig): AiProvider {
  const descriptor = requireProviderDescriptor("ai", "mock");
  const modelId = modelConfig?.id ?? "mock-text";
  const providerModelId = modelConfig?.providerModelId ?? "mock-text";

  return {
    descriptor,
    async generateText(input) {
      const promptPreview = input.prompt.replace(/\s+/g, " ").trim().slice(0, 72);

      return serviceOk({
        id: `mock-ai-${input.purpose}`,
        provider: descriptor.provider,
        mode: descriptor.mode,
        model: modelId,
        providerModelId,
        text: `示例草稿：围绕“${promptPreview}”生成一段可替换的产品文案。`,
        finishReason: "stop",
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0
        }
      });
    }
  };
}

export function createNoopAiProvider(modelConfig?: AiModelConfig): AiProvider {
  const descriptor = requireProviderDescriptor("ai", "noop");
  const modelId = modelConfig?.id ?? "noop-text";
  const providerModelId = modelConfig?.providerModelId ?? "noop-text";

  return {
    descriptor,
    async generateText(input) {
      return serviceOk({
        id: `noop-ai-${input.purpose}`,
        provider: descriptor.provider,
        mode: descriptor.mode,
        model: modelId,
        providerModelId,
        text:
          "No-op AI response. Configure an AI provider when this workflow is ready for real model output.",
        finishReason: "noop",
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0
        }
      });
    }
  };
}

export function createNoopEmailProvider(): EmailProvider {
  const descriptor = requireProviderDescriptor("email");

  return {
    descriptor,
    async sendEmail() {
      return serviceOk({
        id: "noop-email-delivery",
        provider: descriptor.provider,
        mode: descriptor.mode,
        status: "noop"
      });
    }
  };
}

export function createNoopStorageProvider(): StorageProvider {
  const descriptor = requireProviderDescriptor("storage");

  return {
    descriptor,
    async createUploadTarget(input) {
      return serviceOk({
        key: input.key,
        provider: descriptor.provider,
        mode: descriptor.mode,
        status: "noop",
        method: "noop",
        url: null
      });
    }
  };
}

export function createNoopSmsProvider(): SmsProvider {
  const descriptor = requireProviderDescriptor("sms");

  return {
    descriptor,
    async sendSms() {
      return serviceOk({
        id: "noop-sms-delivery",
        provider: descriptor.provider,
        mode: descriptor.mode,
        status: "noop"
      });
    }
  };
}

function requireProviderDescriptor(
  capability: ProviderCapability,
  provider?: string
): ProviderDescriptor {
  const descriptor = getProviderDescriptor(capability, provider);

  if (!descriptor) {
    throw new Error(
      `Provider descriptor is not registered for ${capability}.`
    );
  }

  return descriptor;
}

function validateCreemTestModeConfig() {
  if (process.env.PAYMENT_MODE !== "test") {
    return serviceError(
      "configuration_error",
      "Creem checkout requires PAYMENT_MODE=test."
    );
  }

  if (process.env.PAYMENT_LIVE_ENABLED !== "false") {
    return serviceError(
      "configuration_error",
      "Creem test checkout requires PAYMENT_LIVE_ENABLED=false."
    );
  }

  const apiKey = process.env.PAYMENT_PROVIDER_SECRET?.trim();

  if (!apiKey) {
    return serviceError(
      "configuration_error",
      "Creem test checkout requires PAYMENT_PROVIDER_SECRET."
    );
  }

  return serviceOk({ apiKey });
}

function resolveCreemProductId(priceId: string) {
  const envKeyByPriceId: Record<string, string> = {
    plus_monthly: "CREEM_PLUS_MONTHLY_PRODUCT_ID",
    pro_monthly: "CREEM_PRO_MONTHLY_PRODUCT_ID",
    ai_credit_pack_100k: "CREEM_AI_CREDIT_PACK_100K_PRODUCT_ID"
  };
  const envKey = envKeyByPriceId[priceId];

  if (!envKey) {
    return serviceError(
      "configuration_error",
      "Creem test checkout is only configured for plus_monthly, pro_monthly, and ai_credit_pack_100k."
    );
  }

  const productId = process.env[envKey]?.trim();

  if (!productId) {
    return serviceError(
      "configuration_error",
      `Creem test checkout requires ${envKey}.`
    );
  }

  return serviceOk(productId);
}

function resolveCreemSuccessUrl(
  fallbackPath: string,
  priceId: string,
  returnTo: string | undefined
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const isLocalTestMode =
    process.env.NEXT_PUBLIC_APP_ENV === "local" &&
    process.env.PAYMENT_MODE === "test" &&
    process.env.PAYMENT_LIVE_ENABLED === "false";
  const allowLocalhost =
    isLocalTestMode && Boolean(appUrl && isLocalhostUrl(appUrl));

  if (allowLocalhost && appUrl) {
    return validateCreemCheckoutUrl(`${appUrl}${fallbackPath}`, {
      allowLocalhost
    });
  }

  const configuredUrl = process.env.CREEM_CHECKOUT_SUCCESS_URL?.trim();

  if (configuredUrl) {
    return validateCreemCheckoutUrl(
      withPriceId(configuredUrl, priceId, returnTo),
      { allowLocalhost }
    );
  }

  if (!appUrl) {
    return serviceError(
      "configuration_error",
      "Creem test checkout requires CREEM_CHECKOUT_SUCCESS_URL or NEXT_PUBLIC_APP_URL."
    );
  }

  return validateCreemCheckoutUrl(`${appUrl}${fallbackPath}`, {
    allowLocalhost
  });
}

function withPriceId(url: string, priceId: string, returnTo: string | undefined) {
  try {
    const parsedUrl = new URL(url);

    parsedUrl.searchParams.set("price_id", priceId);
    if (returnTo) {
      parsedUrl.searchParams.set("return_to", returnTo);
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function validateCreemCheckoutUrl(
  url: string,
  options: { allowLocalhost: boolean }
) {
  if (
    url.startsWith("https://") ||
    (options.allowLocalhost && isLocalhostUrl(url))
  ) {
    return serviceOk(url);
  }

  return serviceError(
    "configuration_error",
    "Creem checkout URLs must be HTTPS outside local test mode."
  );
}

function isLocalhostUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname)
    );
  } catch {
    return false;
  }
}

function parseJsonObject(text: string): Record<string, unknown> {
  try {
    const value = JSON.parse(text) as unknown;

    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function readCheckoutPayload(payload: Record<string, unknown>) {
  const checkout =
    payload.checkout && typeof payload.checkout === "object"
      ? (payload.checkout as Record<string, unknown>)
      : payload;

  return {
    id: readString(checkout.id) ?? readString(payload.id),
    url:
      readString(checkout.checkoutUrl) ??
      readString(checkout.checkout_url) ??
      readString(checkout.url) ??
      readString(payload.checkoutUrl) ??
      readString(payload.checkout_url)
  };
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sanitizeProviderMetadata(
  metadata: Record<string, string | undefined>
) {
  return Object.fromEntries(
    Object.entries(metadata).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].trim().length > 0
    )
  );
}
