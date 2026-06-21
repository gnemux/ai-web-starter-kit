import "server-only";

import {
  serviceOk,
  type AiProvider,
  type EmailProvider,
  type PaymentProvider,
  type ProviderCapability,
  type ProviderDescriptor,
  type SmsProvider,
  type StorageProvider
} from "@starter/core";

import { getProviderDescriptor } from "./catalog";

export function createSandboxPaymentProvider(): PaymentProvider {
  const descriptor = requireProviderDescriptor("payment");

  return {
    descriptor,
    async createCheckoutSession(input) {
      return serviceOk({
        id: `sandbox-checkout-${input.planId}`,
        provider: descriptor.provider,
        mode: descriptor.mode,
        status: "noop",
        url: null
      });
    }
  };
}

export function createMockAiProvider(): AiProvider {
  const descriptor = requireProviderDescriptor("ai");

  return {
    descriptor,
    async generateText(input) {
      return serviceOk({
        id: `mock-ai-${input.purpose}`,
        provider: descriptor.provider,
        mode: descriptor.mode,
        text:
          "Mock AI response. Replace this adapter in the AI service issue before calling a real model provider.",
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
  capability: ProviderCapability
): ProviderDescriptor {
  const descriptor = getProviderDescriptor(capability);

  if (!descriptor) {
    throw new Error(`Provider descriptor is not registered for ${capability}.`);
  }

  return descriptor;
}
