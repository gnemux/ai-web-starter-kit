import "server-only";

import { randomUUID } from "crypto";

import {
  assertAiBudgetLimit,
  assertAiModelAccess,
  createAiServiceIdempotencyKey,
  getAiModelPreflightCredits,
  normalizeAiBudgetLimitCredits,
  normalizeAiGenerateTextInput,
  serviceOk,
  type AiGenerateTextInput,
  type AiGenerateTextResponse,
  type AiAnalyticsEvent,
  type AiAnalyticsProperties,
  type AiUsageRecordStatus,
  type AiServiceReason,
  type ServiceResult
} from "@starter/core";

import { trackServerEvent } from "@/lib/analytics/server";
import {
  listAiTextModelOptions,
  resolveAiTextModelConfig,
  type AiTextModelOption
} from "@/lib/providers/ai-models";
import { createConfiguredAiProvider } from "@/lib/providers/server";

import { getCurrentAccount } from "./auth";
import {
  commitAiCreditUsage,
  findCommittedAiCreditUsage,
  getCurrentBillingEntitlements
} from "./billing";

const aiCreditFeatureKey = "ai_tokens" as const;

export type AiTextReviewState = {
  creditFeatureKey: typeof aiCreditFeatureKey;
  ledgerStatus: "deferred";
  mode: AiGenerateTextResponse["mode"];
  model: string;
  modelLabel: string;
  modelOptions: AiTextModelOption[];
  provider: string;
  providerModelId: string;
  requestedCredits: number;
};

export function getAiTextReviewState(): ServiceResult<AiTextReviewState> {
  const modelResult = resolveAiTextModelConfig();

  if (!modelResult.ok) {
    return modelResult;
  }

  const modelConfig = modelResult.data;

  return serviceOk({
    creditFeatureKey: aiCreditFeatureKey,
    ledgerStatus: "deferred",
    mode: modelConfig.mode,
    model: modelConfig.id,
    modelLabel: modelConfig.label,
    modelOptions: listAiTextModelOptions(),
    provider: modelConfig.provider,
    providerModelId: modelConfig.providerModelId,
    requestedCredits: getAiModelPreflightCredits(modelConfig)
  });
}

export async function generateAiTextFromFormData(
  formData: FormData
): Promise<ServiceResult<AiGenerateTextResponse>> {
  return generateAiTextFromJson({
    prompt: formData.get("prompt"),
    purpose: formData.get("purpose"),
    model: formData.get("model")
  });
}

export async function generateAiTextFromJson(
  input: Record<string, unknown>
): Promise<ServiceResult<AiGenerateTextResponse>> {
  const inputResult = normalizeAiGenerateTextInput(input);

  if (!inputResult.ok) {
    return inputResult;
  }

  return generateAiText(inputResult.data);
}

export async function generateAiText(
  input: AiGenerateTextInput
): Promise<ServiceResult<AiGenerateTextResponse>> {
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const ownerId = accountResult.data.user.id;
  const requestId = randomUUID();
  const idempotencyKey = createAiServiceIdempotencyKey({
    capability: "generate_text",
    ownerId,
    purpose: input.purpose,
    requestId: input.idempotencyKey ?? requestId
  });
  const modelResult = resolveAiTextModelConfig(input.model);

  if (!modelResult.ok) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event: "ai_request_failed",
      mode: "mock",
      model: input.model ?? "unavailable",
      provider: "mock",
      providerModelId: input.model ?? "unavailable",
      reason: "model_unavailable",
      requestedCredits: 0,
      result: "blocked",
      source: input.purpose
    });

    return serviceOk(
      buildAiResponse({
        idempotencyKey,
        model: input.model ?? "unavailable",
        provider: "mock",
        providerModelId: input.model ?? "unavailable",
        mode: "mock",
        reason: "model_unavailable",
        remainingCredits: null,
        requestId,
        requestedCredits: 0,
        status: "blocked"
      })
    );
  }

  const modelConfig = modelResult.data;
  const requestedCredits = getAiModelPreflightCredits(modelConfig);
  await trackAiEvent({
    distinctId: ownerId,
    event: "ai_request_started",
    mode: modelConfig.mode,
    model: modelConfig.id,
    provider: modelConfig.provider,
    providerModelId: modelConfig.providerModelId,
    reason: "allowed",
    requestedCredits,
    result: "started",
    source: input.purpose
  });

  const existingUsageResult = await findCommittedAiCreditUsage({
    idempotencyKey,
    ownerId
  });

  if (!existingUsageResult.ok) {
    return existingUsageResult;
  }

  if (existingUsageResult.data) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event: "ai_request_failed",
      mode: modelConfig.mode,
      model: modelConfig.id,
      provider: modelConfig.provider,
      providerModelId: modelConfig.providerModelId,
      reason: "duplicate",
      requestedCredits,
      result: "duplicate",
      source: input.purpose,
      usageRecordStatus: "recorded"
    });

    return serviceOk(
      buildAiResponse({
        consumedCredits: 0,
        creditStatus: "blocked",
        idempotencyKey,
        model: modelConfig.id,
        provider: modelConfig.provider,
        providerModelId: modelConfig.providerModelId,
        mode: modelConfig.mode,
        reason: "duplicate",
        remainingCredits: null,
        requestId,
        requestedCredits,
        status: "blocked",
        usageRecordStatus: "recorded"
      })
    );
  }

  const budgetGate = assertAiBudgetLimit({
    budgetLimitCredits: normalizeAiBudgetLimitCredits(
      process.env.AI_BUDGET_LIMIT
    ),
    requestedCredits
  });

  if (budgetGate) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event: "ai_request_failed",
      mode: modelConfig.mode,
      model: modelConfig.id,
      provider: modelConfig.provider,
      providerModelId: modelConfig.providerModelId,
      reason: budgetGate.reason,
      remainingCredits: budgetGate.remainingCredits,
      requestedCredits,
      result: "blocked",
      source: input.purpose
    });

    return serviceOk(
      buildAiResponse({
        idempotencyKey,
        model: modelConfig.id,
        provider: modelConfig.provider,
        providerModelId: modelConfig.providerModelId,
        mode: modelConfig.mode,
        reason: budgetGate.reason,
        remainingCredits: budgetGate.remainingCredits,
        requestId,
        requestedCredits,
        status: "blocked"
      })
    );
  }

  const billingResult = await getCurrentBillingEntitlements();

  if (!billingResult.ok) {
    return billingResult;
  }

  const modelAccess = assertAiModelAccess({
    model: modelConfig,
    requiredCredits: requestedCredits,
    snapshot: billingResult.data
  });

  if (!modelAccess.allowed) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event:
        modelAccess.reason === "quota_exhausted"
          ? "quota_limit_reached"
          : "ai_request_failed",
      mode: modelConfig.mode,
      model: modelConfig.id,
      provider: modelConfig.provider,
      providerModelId: modelConfig.providerModelId,
      reason: modelAccess.reason,
      remainingCredits: modelAccess.remainingCredits,
      requestedCredits,
      result: "blocked",
      source: input.purpose
    });

    return serviceOk(
      buildAiResponse({
        idempotencyKey,
        model: modelConfig.id,
        provider: modelConfig.provider,
        providerModelId: modelConfig.providerModelId,
        mode: modelConfig.mode,
        reason: modelAccess.reason,
        remainingCredits: modelAccess.remainingCredits,
        requestId,
        requestedCredits,
        status: "blocked"
      })
    );
  }

  const providerFactoryResult = createConfiguredAiProvider(modelConfig);

  if (!providerFactoryResult.ok) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event: "ai_request_failed",
      mode: modelConfig.mode,
      model: modelConfig.id,
      provider: modelConfig.provider,
      providerModelId: modelConfig.providerModelId,
      reason: "provider_unconfigured",
      remainingCredits: modelAccess.remainingCredits,
      requestedCredits,
      result: "blocked",
      source: input.purpose
    });

    return serviceOk(
      buildAiResponse({
        idempotencyKey,
        model: modelConfig.id,
        provider: modelConfig.provider,
        providerModelId: modelConfig.providerModelId,
        mode: modelConfig.mode,
        reason: "provider_unconfigured",
        remainingCredits: modelAccess.remainingCredits,
        requestId,
        requestedCredits,
        status: "blocked"
      })
    );
  }

  const provider = providerFactoryResult.data;

  const textResult = await provider.generateText({
    userId: ownerId,
    purpose: input.purpose,
    prompt: input.prompt,
    model: modelConfig.providerModelId,
    metadata: {
      ...(input.metadata ?? {}),
      idempotency_key: idempotencyKey
    }
  });

  if (!textResult.ok) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event: "ai_request_failed",
      mode: provider.descriptor.mode,
      model: modelConfig.id,
      provider: provider.descriptor.provider,
      providerModelId: modelConfig.providerModelId,
      reason: "provider_failed",
      remainingCredits: modelAccess.remainingCredits,
      requestedCredits,
      result: "failed",
      source: input.purpose
    });

    return serviceOk(
      buildAiResponse({
        idempotencyKey,
        model: modelConfig.id,
        provider: provider.descriptor.provider,
        providerModelId: modelConfig.providerModelId,
        mode: provider.descriptor.mode,
        reason: "provider_failed",
        remainingCredits: modelAccess.remainingCredits,
        requestId,
        requestedCredits,
        status: "failed"
      })
    );
  }

  const usageMetadata = {
    capability: "generate_text",
    finish_reason: textResult.data.finishReason,
    input_tokens: textResult.data.usage?.inputTokens ?? 0,
    model: textResult.data.model,
    output_tokens: textResult.data.usage?.outputTokens ?? 0,
    provider: textResult.data.provider,
    provider_mode: textResult.data.mode,
    provider_model_id: textResult.data.providerModelId,
    provider_request_id: textResult.data.id,
    purpose: input.purpose,
    requested_credits: requestedCredits,
    request_id: requestId,
    total_tokens: textResult.data.usage?.totalTokens ?? 0
  };
  const usageCommitResult =
    requestedCredits > 0
      ? await commitAiCreditUsage({
          credits: requestedCredits,
          featureKey: aiCreditFeatureKey,
          idempotencyKey,
          metadata: usageMetadata,
          ownerId,
          reason: "Workspace AI text generation.",
          sourceId: requestId
        })
      : null;

  if (usageCommitResult && !usageCommitResult.ok) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event: "ai_request_failed",
      mode: textResult.data.mode,
      model: textResult.data.model,
      provider: textResult.data.provider,
      providerModelId: textResult.data.providerModelId,
      reason: "usage_record_failed",
      remainingCredits: modelAccess.remainingCredits,
      requestedCredits,
      result: "failed",
      source: input.purpose,
      usageRecordStatus: "not_recorded"
    });

    return serviceOk(
      buildAiResponse({
        idempotencyKey,
        model: textResult.data.model,
        provider: textResult.data.provider,
        providerModelId: textResult.data.providerModelId,
        mode: textResult.data.mode,
        reason: "usage_record_failed",
        remainingCredits: modelAccess.remainingCredits,
        requestId,
        requestedCredits,
        status: "failed",
        usage: textResult.data.usage
      })
    );
  }

  if (usageCommitResult?.data.deduplicated) {
    await trackAiEvent({
      consumedCredits: 0,
      distinctId: ownerId,
      event: "ai_request_failed",
      mode: textResult.data.mode,
      model: textResult.data.model,
      provider: textResult.data.provider,
      providerModelId: textResult.data.providerModelId,
      reason: "duplicate",
      remainingCredits: modelAccess.remainingCredits,
      requestedCredits,
      result: "duplicate",
      source: input.purpose,
      usageRecordStatus: "recorded"
    });

    return serviceOk(
      buildAiResponse({
        consumedCredits: 0,
        creditStatus: "blocked",
        idempotencyKey,
        model: textResult.data.model,
        provider: textResult.data.provider,
        providerModelId: textResult.data.providerModelId,
        mode: textResult.data.mode,
        reason: "duplicate",
        remainingCredits: modelAccess.remainingCredits,
        requestId,
        requestedCredits,
        status: "blocked",
        usage: textResult.data.usage,
        usageRecordStatus: "recorded"
      })
    );
  }

  await trackAiEvent({
    consumedCredits: usageCommitResult?.data.consumedCredits ?? 0,
    distinctId: ownerId,
    event: "ai_request_completed",
    mode: textResult.data.mode,
    model: textResult.data.model,
    provider: textResult.data.provider,
    providerModelId: textResult.data.providerModelId,
    reason: usageCommitResult ? "usage_recorded" : "allowed",
    remainingCredits:
      modelAccess.remainingCredits === null
        ? null
        : Math.max(
            modelAccess.remainingCredits -
              (usageCommitResult?.data.consumedCredits ?? 0),
            0
          ),
    requestedCredits,
    result: "succeeded",
    source: input.purpose,
    usageRecordStatus: usageCommitResult ? "recorded" : "not_recorded"
  });

  return serviceOk(
    buildAiResponse({
      consumedCredits: usageCommitResult?.data.consumedCredits ?? 0,
      creditStatus: usageCommitResult ? "committed" : "not_recorded",
      idempotencyKey,
      model: textResult.data.model,
      provider: textResult.data.provider,
      providerModelId: textResult.data.providerModelId,
      mode: textResult.data.mode,
      reason: usageCommitResult ? "usage_recorded" : "allowed",
      remainingCredits:
        modelAccess.remainingCredits === null
          ? null
          : Math.max(
              modelAccess.remainingCredits -
                (usageCommitResult?.data.consumedCredits ?? 0),
              0
            ),
      requestId,
      requestedCredits,
      status: "succeeded",
      text: textResult.data.text,
      usageRecordStatus: usageCommitResult ? "recorded" : "not_recorded",
      usage: textResult.data.usage
    })
  );
}

function buildAiResponse(input: {
  consumedCredits?: number;
  creditStatus?: AiGenerateTextResponse["credit"]["status"];
  idempotencyKey: string;
  model: string;
  mode: AiGenerateTextResponse["mode"];
  provider: string;
  providerModelId: string;
  reason: AiServiceReason;
  remainingCredits: number | null;
  requestId: string;
  requestedCredits: number;
  status: AiGenerateTextResponse["status"];
  text?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  usageRecordStatus?: AiUsageRecordStatus;
}): AiGenerateTextResponse {
  const blocked = input.status === "blocked";
  const failed = input.status === "failed";
  const defaultCreditStatus = blocked
    ? "blocked"
    : failed
      ? "failed"
      : "not_recorded";

  return {
    capability: "generate_text",
    credit: {
      consumedCredits: input.consumedCredits ?? 0,
      featureKey: aiCreditFeatureKey,
      reason: input.reason,
      requestedCredits: input.requestedCredits,
      status: input.creditStatus ?? defaultCreditStatus
    },
    gate: {
      allowed: !blocked,
      featureKey: aiCreditFeatureKey,
      reason: blocked ? input.reason : "allowed",
      remainingCredits: input.remainingCredits,
      requestedCredits: input.requestedCredits
    },
    idempotencyKey: input.idempotencyKey,
    model: input.model,
    mode: input.mode,
    provider: input.provider,
    providerModelId: input.providerModelId,
    reason: input.reason,
    requestId: input.requestId,
    result: input.text ? { text: input.text } : null,
    status: input.status,
    usage: {
      inputTokens: input.usage?.inputTokens,
      outputTokens: input.usage?.outputTokens,
      totalTokens: input.usage?.totalTokens,
      recordStatus:
        input.usageRecordStatus ??
        (input.status === "succeeded" ? "record_deferred" : "not_recorded")
    }
  };
}

async function trackAiEvent(input: {
  consumedCredits?: number;
  distinctId: string;
  event: AiAnalyticsEvent;
  mode: AiGenerateTextResponse["mode"];
  model: string;
  provider: string;
  providerModelId: string;
  reason: AiServiceReason;
  remainingCredits?: number | null;
  requestedCredits: number;
  result: AiAnalyticsProperties["result"];
  source: string;
  usageRecordStatus?: AiUsageRecordStatus;
}) {
  await trackServerEvent({
    distinctId: input.distinctId,
    event: input.event,
    module: "ai",
    properties: {
      capability: "generate_text",
      ...(typeof input.consumedCredits === "number"
        ? { consumed_credits: input.consumedCredits }
        : {}),
      mode: input.mode,
      model: input.model,
      provider: input.provider,
      provider_model_id: input.providerModelId,
      reason: input.reason,
      ...(typeof input.remainingCredits === "number"
        ? { remaining_credits: input.remainingCredits }
        : {}),
      requested_credits: input.requestedCredits,
      result: input.result,
      source: input.source,
      ...(input.usageRecordStatus
        ? { usage_record_status: input.usageRecordStatus }
        : {})
    }
  });
}
