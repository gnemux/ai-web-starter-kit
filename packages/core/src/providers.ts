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
  successUrl: string;
  cancelUrl: string;
  metadata?: ProviderMetadata;
};

export type PaymentCheckoutSession = {
  id: string;
  provider: string;
  mode: ProviderMode;
  status: "created" | "noop";
  url: string | null;
};

export type PaymentProvider = {
  descriptor: ProviderDescriptor;
  createCheckoutSession(
    input: PaymentCheckoutRequest
  ): Promise<ServiceResult<PaymentCheckoutSession>>;
};

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
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export type AiProvider = {
  descriptor: ProviderDescriptor;
  generateText(input: AiTextRequest): Promise<ServiceResult<AiTextResponse>>;
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
