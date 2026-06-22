import "server-only";

import {
  getAiModelPreflightCredits,
  resolveAiModelConfig,
  type AiModelConfig,
  type ServiceResult
} from "@starter/core";

export const aiModelCatalog = [
  {
    id: "mock-text",
    label: "标准草稿模型",
    provider: "mock",
    providerModelId: "mock-text",
    mode: "mock",
    capabilities: ["generate_text", "chat", "completion"],
    defaultFor: ["generate_text", "chat", "completion"],
    fallbackFor: ["generate_text", "chat", "completion"],
    access: {
      featureKey: "ai_tokens"
    },
    costProfile: {
      unit: "credit",
      requestCredits: 1000,
      minimumCredits: 1000,
      inputTokenCreditsPer1K: 0,
      outputTokenCreditsPer1K: 0
    },
    contextWindowTokens: 4096,
    enabled: true
  },
  {
    id: "premium-mock-text",
    label: "高级草稿模型",
    provider: "mock",
    providerModelId: "premium-mock-text",
    mode: "mock",
    capabilities: ["generate_text", "chat", "completion"],
    defaultFor: [],
    fallbackFor: [],
    access: {
      featureKey: "ai_tokens",
      minimumPlan: "pro"
    },
    costProfile: {
      unit: "credit",
      requestCredits: 10000,
      minimumCredits: 10000,
      inputTokenCreditsPer1K: 0,
      outputTokenCreditsPer1K: 0
    },
    contextWindowTokens: 8192,
    enabled: true
  },
  {
    id: "reserved-text",
    label: "待接入模型",
    provider: "reserved",
    providerModelId: "reserved-text",
    mode: "reserved",
    capabilities: ["generate_text"],
    defaultFor: [],
    fallbackFor: [],
    access: {
      featureKey: "ai_tokens"
    },
    costProfile: {
      unit: "credit",
      requestCredits: 1000,
      minimumCredits: 1000,
      inputTokenCreditsPer1K: 0,
      outputTokenCreditsPer1K: 0
    },
    contextWindowTokens: 0,
    enabled: true
  },
  {
    id: "noop-text",
    label: "空响应模型",
    provider: "noop",
    providerModelId: "noop-text",
    mode: "noop",
    capabilities: ["generate_text", "chat", "completion"],
    defaultFor: [],
    fallbackFor: [],
    access: {
      featureKey: "ai_tokens"
    },
    costProfile: {
      unit: "credit",
      requestCredits: 0,
      minimumCredits: 0,
      inputTokenCreditsPer1K: 0,
      outputTokenCreditsPer1K: 0
    },
    contextWindowTokens: 0,
    enabled: true
  },
  {
    id: "mock-embedding",
    label: "Mock Embedding",
    provider: "mock",
    providerModelId: "mock-embedding",
    mode: "mock",
    capabilities: ["embedding"],
    defaultFor: ["embedding"],
    fallbackFor: ["embedding"],
    access: {
      featureKey: "ai_tokens"
    },
    costProfile: {
      unit: "credit",
      requestCredits: 500,
      minimumCredits: 500,
      inputTokenCreditsPer1K: 0,
      outputTokenCreditsPer1K: 0
    },
    contextWindowTokens: 2048,
    enabled: true
  }
] as const satisfies readonly AiModelConfig[];

export function listAiModelConfigs(): readonly AiModelConfig[] {
  return aiModelCatalog;
}

export function resolveAiTextModelConfig(
  requestedModel?: string
): ServiceResult<AiModelConfig> {
  return resolveAiModelConfig({
    capability: "generate_text",
    defaultModelId: readDefaultAiModelId(),
    fallbackModelId: "mock-text",
    models: aiModelCatalog,
    requestedModel
  });
}

export type AiTextModelOption = {
  id: string;
  label: string;
  requestedCredits: number;
};

export function listAiTextModelOptions(): AiTextModelOption[] {
  return aiModelCatalog
    .filter(
      (model) =>
        model.enabled &&
        (model.capabilities as readonly string[]).includes("generate_text")
    )
    .map((model) => ({
      id: model.id,
      label: model.label,
      requestedCredits: getAiModelPreflightCredits(model)
    }));
}

function readDefaultAiModelId(): string {
  const model = process.env.AI_MODEL?.trim();

  if (model) {
    return model;
  }

  const provider = process.env.AI_PROVIDER?.trim();

  if (provider === "noop") {
    return "noop-text";
  }

  return "mock-text";
}
