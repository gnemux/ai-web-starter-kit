import type { ServiceResult } from "./api";

export type ProviderCapability =
  | "auth"
  | "database"
  | "analytics"
  | "payment"
  | "ai"
  | "email"
  | "storage"
  | "sms"
  | "deploy-cdn";

export type ProviderMode = "real" | "sandbox" | "mock" | "noop" | "reserved";

export type ProviderRuntime = "client" | "server" | "operator";

export type ProviderConfigStatus =
  | "configured"
  | "missing_optional"
  | "missing_required"
  | "disabled"
  | "reserved";

export type ProviderDescriptor = {
  capability: ProviderCapability;
  provider: string;
  mode: ProviderMode;
  runtime: ProviderRuntime;
  configStatus: ProviderConfigStatus;
  serverOnly: boolean;
  publicEnv: readonly string[];
  serverEnv: readonly string[];
  notes?: string;
};

export type ProviderHealth = {
  capability: ProviderCapability;
  provider: string;
  mode: ProviderMode;
  runtime: ProviderRuntime;
  status: ProviderConfigStatus;
  message: string;
};

export type ProviderMetadata = Record<string, string>;

export type AnalyticsProvider<
  EventName extends string = string,
  Properties extends Record<string, unknown> = Record<string, unknown>
> = {
  descriptor: ProviderDescriptor;
  track(event: EventName, properties?: Properties): void;
  identify?(userId: string, properties?: Properties): void;
  reset?(): void;
};

export type PaymentCheckoutRequest = {
  userId: string;
  planId: string;
  priceId: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  metadata?: ProviderMetadata;
};

export type PaymentCheckoutSession = {
  id: string;
  provider: string;
  mode: ProviderMode;
  status: "created" | "noop";
  url: string | null;
  priceId: string;
};

export type PaymentProvider = {
  descriptor: ProviderDescriptor;
  createCheckoutSession(
    input: PaymentCheckoutRequest
  ): Promise<ServiceResult<PaymentCheckoutSession>>;
};

export type AiProviderUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AiProviderFinishReason =
  | "stop"
  | "length"
  | "content_filter"
  | "tool_call"
  | "noop"
  | "error";

export type AiTextRequest = {
  userId: string;
  purpose: string;
  prompt: string;
  model?: string;
  metadata?: ProviderMetadata;
};

export type AiTextResponse = {
  id: string;
  provider: string;
  mode: ProviderMode;
  model: string;
  providerModelId: string;
  text: string;
  finishReason: AiProviderFinishReason;
  usage?: AiProviderUsage;
};

export type AiChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

export type AiChatRequest = {
  userId: string;
  purpose: string;
  messages: AiChatMessage[];
  model?: string;
  metadata?: ProviderMetadata;
};

export type AiChatResponse = {
  id: string;
  provider: string;
  mode: ProviderMode;
  model: string;
  providerModelId: string;
  message: AiChatMessage;
  finishReason: AiProviderFinishReason;
  usage?: AiProviderUsage;
};

export type AiEmbeddingRequest = {
  userId: string;
  purpose: string;
  input: string;
  model?: string;
  metadata?: ProviderMetadata;
};

export type AiEmbeddingResponse = {
  id: string;
  provider: string;
  mode: ProviderMode;
  model: string;
  providerModelId: string;
  dimensions: number;
  usage?: AiProviderUsage;
};

export type AiModerationRequest = {
  userId: string;
  purpose: string;
  input: string;
  model?: string;
  metadata?: ProviderMetadata;
};

export type AiModerationResponse = {
  id: string;
  provider: string;
  mode: ProviderMode;
  model: string;
  providerModelId: string;
  flagged: boolean;
  categories: Record<string, boolean>;
  usage?: AiProviderUsage;
};

export type AiProviderErrorCode =
  | "provider_unconfigured"
  | "model_unavailable"
  | "provider_failed"
  | "timeout"
  | "rate_limited"
  | "content_filter";

export type AiProviderError = {
  code: AiProviderErrorCode;
  message: string;
  retryable: boolean;
};

export type AiProvider = {
  descriptor: ProviderDescriptor;
  generateText(input: AiTextRequest): Promise<ServiceResult<AiTextResponse>>;
  chat?(input: AiChatRequest): Promise<ServiceResult<AiChatResponse>>;
  createEmbedding?(
    input: AiEmbeddingRequest
  ): Promise<ServiceResult<AiEmbeddingResponse>>;
  moderate?(
    input: AiModerationRequest
  ): Promise<ServiceResult<AiModerationResponse>>;
  mapError?(error: unknown): AiProviderError;
};

export type EmailMessage = {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  metadata?: ProviderMetadata;
};

export type EmailDelivery = {
  id: string;
  provider: string;
  mode: ProviderMode;
  status: "queued" | "sent" | "noop";
};

export type EmailProvider = {
  descriptor: ProviderDescriptor;
  sendEmail(input: EmailMessage): Promise<ServiceResult<EmailDelivery>>;
};

export type StorageUploadRequest = {
  key: string;
  contentType: string;
  sizeBytes?: number;
  metadata?: ProviderMetadata;
};

export type StorageUploadTarget = {
  key: string;
  provider: string;
  mode: ProviderMode;
  status: "created" | "noop";
  method: "POST" | "PUT" | "noop";
  url: string | null;
  headers?: Record<string, string>;
  expiresAt?: string;
};

export type StorageProvider = {
  descriptor: ProviderDescriptor;
  createUploadTarget(
    input: StorageUploadRequest
  ): Promise<ServiceResult<StorageUploadTarget>>;
};

export type SmsMessage = {
  to: string;
  body: string;
  metadata?: ProviderMetadata;
};

export type SmsDelivery = {
  id: string;
  provider: string;
  mode: ProviderMode;
  status: "queued" | "sent" | "noop";
};

export type SmsProvider = {
  descriptor: ProviderDescriptor;
  sendSms(input: SmsMessage): Promise<ServiceResult<SmsDelivery>>;
};
