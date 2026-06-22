import { serviceError, serviceOk, type ServiceResult } from "./api";
import {
  assertBillingEntitlement,
  type BillingEntitlementSnapshot,
  type BillingPlanId
} from "./billing";
import type { AiProviderUsage, ProviderMode } from "./providers";

export const aiCapabilities = [
  "generate_text",
  "chat",
  "completion",
  "embedding",
  "moderation"
] as const;

export type AiCapability = (typeof aiCapabilities)[number];

export const aiServiceReasons = [
  "allowed",
  "unauthenticated",
  "entitlement_missing",
  "quota_exhausted",
  "model_unavailable",
  "provider_unconfigured",
  "budget_limited",
  "provider_failed",
  "timeout",
  "duplicate",
  "validation_failed",
  "usage_record_deferred",
  "usage_recorded",
  "usage_record_failed"
] as const;

export type AiServiceReason = (typeof aiServiceReasons)[number];

export type AiServiceStatus = "succeeded" | "blocked" | "failed";

export type AiGenerateTextInput = {
  prompt: string;
  purpose: string;
  model?: string;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
};

export type AiServiceGate = {
  allowed: boolean;
  featureKey: "ai_tokens";
  reason: AiServiceReason;
  remainingCredits: number | null;
  requestedCredits: number;
};

export type AiUsageRecordStatus =
  | "not_recorded"
  | "record_deferred"
  | "recorded";

export type AiCreditOutcome = {
  consumedCredits: number;
  featureKey: "ai_tokens";
  reason: AiServiceReason;
  requestedCredits: number;
  status: "not_recorded" | "blocked" | "failed" | "committed";
};

export type AiGenerateTextResponse = {
  capability: "generate_text";
  credit: AiCreditOutcome;
  gate: AiServiceGate;
  idempotencyKey: string;
  model: string;
  mode: ProviderMode;
  provider: string;
  providerModelId: string;
  reason: AiServiceReason;
  requestId: string;
  result: {
    text: string;
  } | null;
  status: AiServiceStatus;
  usage: AiProviderUsage & {
    recordStatus: AiUsageRecordStatus;
  };
};

export type AiAnalyticsEvent =
  | "ai_request_started"
  | "ai_request_completed"
  | "ai_request_failed"
  | "quota_limit_reached";

export type AiAnalyticsProperties = {
  capability: AiCapability;
  consumed_credits?: number;
  mode: ProviderMode;
  model: string;
  provider: string;
  provider_model_id: string;
  reason: AiServiceReason;
  remaining_credits?: number;
  requested_credits: number;
  result: AiServiceStatus | "duplicate" | "started";
  source: string;
  usage_record_status?: AiUsageRecordStatus;
};

export function normalizeAiGenerateTextInput(
  input: Record<string, unknown>
): ServiceResult<AiGenerateTextInput> {
  const prompt = normalizeString(input.prompt);
  const purpose = normalizeString(input.purpose) ?? "workspace_ai_sample";
  const model = normalizeString(input.model);
  const idempotencyKey = normalizeString(input.idempotencyKey);
  const metadataResult = normalizeAiMetadata(input.metadata);
  const fields: Record<string, string> = {};

  if (!prompt || prompt.length < 3) {
    fields.prompt = "Prompt must be at least 3 characters.";
  }

  if (prompt && prompt.length > 4000) {
    fields.prompt = "Prompt must be 4000 characters or fewer.";
  }

  if (purpose.length > 80) {
    fields.purpose = "Purpose must be 80 characters or fewer.";
  }

  if (model && model.length > 80) {
    fields.model = "Model must be 80 characters or fewer.";
  }

  if (idempotencyKey && idempotencyKey.length > 160) {
    fields.idempotencyKey =
      "Idempotency key must be 160 characters or fewer.";
  }

  if (!metadataResult.ok) {
    return metadataResult;
  }

  if (Object.keys(fields).length > 0 || !prompt) {
    return serviceError(
      "validation_error",
      "Review the AI request fields.",
      fields
    );
  }

  return serviceOk({
    prompt,
    purpose,
    ...(model ? { model } : {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
    ...(metadataResult.data ? { metadata: metadataResult.data } : {})
  });
}

export function createAiServiceIdempotencyKey(input: {
  capability: AiCapability;
  ownerId: string;
  purpose: string;
  requestId: string;
}): string {
  return [
    "ai",
    sanitizeKeyPart(input.capability),
    sanitizeKeyPart(input.ownerId),
    sanitizeKeyPart(input.purpose),
    sanitizeKeyPart(input.requestId)
  ].join(":");
}

export function isAiCapability(value: string): value is AiCapability {
  return aiCapabilities.includes(value as AiCapability);
}

export type AiModelCostProfile = {
  unit: "credit";
  requestCredits: number;
  minimumCredits: number;
  inputTokenCreditsPer1K: number;
  outputTokenCreditsPer1K: number;
};

export type AiModelAccessPolicy = {
  featureKey: "ai_tokens";
  minimumPlan?: BillingPlanId;
};

export type AiModelConfig = {
  id: string;
  label: string;
  provider: string;
  providerModelId: string;
  mode: ProviderMode;
  capabilities: readonly AiCapability[];
  defaultFor: readonly AiCapability[];
  fallbackFor: readonly AiCapability[];
  access: AiModelAccessPolicy;
  costProfile: AiModelCostProfile;
  contextWindowTokens?: number;
  enabled: boolean;
};

export function resolveAiModelConfig(input: {
  capability: AiCapability;
  defaultModelId?: string | null;
  fallbackModelId?: string | null;
  models: readonly AiModelConfig[];
  requestedModel?: string | null;
}): ServiceResult<AiModelConfig> {
  const requestedModel = normalizeString(input.requestedModel);

  if (requestedModel) {
    const requested = findAiModelById(input.models, requestedModel);

    if (requested && isAiModelUsableForCapability(requested, input.capability)) {
      return serviceOk(requested);
    }

    return serviceError(
      "configuration_error",
      "The requested AI model is not available for this capability.",
      { model: "Unavailable model." }
    );
  }

  const defaultModel = normalizeString(input.defaultModelId);
  const defaultCandidate = defaultModel
    ? findAiModelById(input.models, defaultModel)
    : input.models.find(
        (model) =>
          model.defaultFor.includes(input.capability) &&
          isAiModelUsableForCapability(model, input.capability)
      );

  if (
    defaultCandidate &&
    isAiModelUsableForCapability(defaultCandidate, input.capability)
  ) {
    return serviceOk(defaultCandidate);
  }

  const fallbackModel = normalizeString(input.fallbackModelId);
  const fallbackCandidate = fallbackModel
    ? findAiModelById(input.models, fallbackModel)
    : input.models.find(
        (model) =>
          model.fallbackFor.includes(input.capability) &&
          isAiModelUsableForCapability(model, input.capability)
      );

  if (
    fallbackCandidate &&
    isAiModelUsableForCapability(fallbackCandidate, input.capability)
  ) {
    return serviceOk(fallbackCandidate);
  }

  return serviceError(
    "configuration_error",
    "No AI model is configured for this capability.",
    { capability: "No configured model." }
  );
}

export function getAiModelPreflightCredits(model: AiModelConfig): number {
  return Math.max(
    0,
    Math.ceil(
      Math.max(
        model.costProfile.requestCredits,
        model.costProfile.minimumCredits
      )
    )
  );
}

export function normalizeAiBudgetLimitCredits(value: unknown): number | null {
  const normalized = normalizeString(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
}

export function assertAiBudgetLimit(input: {
  budgetLimitCredits: number | null;
  requestedCredits: number;
}): AiServiceGate | null {
  if (input.budgetLimitCredits === null) {
    return null;
  }

  if (input.requestedCredits <= input.budgetLimitCredits) {
    return null;
  }

  return {
    allowed: false,
    featureKey: "ai_tokens",
    reason: "budget_limited",
    remainingCredits: null,
    requestedCredits: input.requestedCredits
  };
}

export function assertAiModelAccess(input: {
  model: AiModelConfig;
  requiredCredits: number;
  snapshot: BillingEntitlementSnapshot;
}): AiServiceGate {
  if (!isPlanAtLeast(input.snapshot.planId, input.model.access.minimumPlan)) {
    return {
      allowed: false,
      featureKey: input.model.access.featureKey,
      reason: "entitlement_missing",
      remainingCredits: null,
      requestedCredits: input.requiredCredits
    };
  }

  const decision = assertBillingEntitlement(
    input.snapshot,
    input.model.access.featureKey,
    input.requiredCredits
  );

  return {
    allowed: decision.allowed,
    featureKey: input.model.access.featureKey,
    reason: mapBillingDecisionToAiReason(decision.reason),
    remainingCredits: decision.remaining ?? null,
    requestedCredits: input.requiredCredits
  };
}

function findAiModelById(
  models: readonly AiModelConfig[],
  modelId: string
): AiModelConfig | undefined {
  return models.find((model) => model.id === modelId);
}

function isAiModelUsableForCapability(
  model: AiModelConfig,
  capability: AiCapability
): boolean {
  return model.enabled && model.capabilities.includes(capability);
}

function isPlanAtLeast(
  currentPlan: BillingPlanId,
  minimumPlan: BillingPlanId | undefined
): boolean {
  if (!minimumPlan) {
    return true;
  }

  const ranks: Record<BillingPlanId, number> = {
    free: 0,
    plus: 1,
    pro: 2
  };

  return ranks[currentPlan] >= ranks[minimumPlan];
}

function mapBillingDecisionToAiReason(
  reason: ReturnType<typeof assertBillingEntitlement>["reason"]
): AiServiceReason {
  if (reason === "allowed") {
    return "allowed";
  }

  if (reason === "quota_exceeded") {
    return "quota_exhausted";
  }

  return "entitlement_missing";
}

function normalizeAiMetadata(
  value: unknown
): ServiceResult<Record<string, string> | undefined> {
  if (value === null || value === undefined) {
    return serviceOk(undefined);
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return serviceError(
      "validation_error",
      "AI metadata must be an object with string keys and values."
    );
  }

  const metadata: Record<string, string> = {};

  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = normalizeString(key);
    const normalizedValue = normalizeString(item);

    if (!normalizedKey || !normalizedValue) {
      continue;
    }

    if (normalizedKey.length > 64 || normalizedValue.length > 240) {
      return serviceError(
        "validation_error",
        "AI metadata keys and values are too long."
      );
    }

    metadata[normalizedKey] = normalizedValue;
  }

  return serviceOk(
    Object.keys(metadata).length > 0 ? metadata : undefined
  );
}

function normalizeString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length > 0 ? normalized : null;
}

function sanitizeKeyPart(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}
