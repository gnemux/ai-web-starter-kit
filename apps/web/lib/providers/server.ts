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
} from "@starter/core";

import { getProviderDescriptor } from "./catalog";

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
