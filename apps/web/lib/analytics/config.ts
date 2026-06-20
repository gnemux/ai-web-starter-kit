import type { AnalyticsBaseProperties } from "@starter/core";

const DEFAULT_APP_NAME = "ai-web-starter-kit";
const DEFAULT_MVP_STAGE = "mvp1";
const DEFAULT_MARKET = "overseas";
const DEFAULT_VERSION = "v0.1";

export function getAnalyticsBaseProperties(): AnalyticsBaseProperties {
  return {
    app: readOptionalPublicEnv(process.env.NEXT_PUBLIC_APP_NAME) ?? DEFAULT_APP_NAME,
    mvp_stage:
      readOptionalPublicEnv(process.env.NEXT_PUBLIC_MVP_STAGE) ?? DEFAULT_MVP_STAGE,
    market: normalizeMarket(readOptionalPublicEnv(process.env.NEXT_PUBLIC_APP_MARKET)),
    env: normalizeEnv(readOptionalPublicEnv(process.env.NEXT_PUBLIC_APP_ENV)),
    version:
      readOptionalPublicEnv(process.env.NEXT_PUBLIC_APP_VERSION) ?? DEFAULT_VERSION,
    module: "auth"
  };
}

export function readOptionalPublicEnv(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizeMarket(value: string | undefined): AnalyticsBaseProperties["market"] {
  if (value === "china") {
    return "china";
  }

  return DEFAULT_MARKET;
}

function normalizeEnv(value: string | undefined): AnalyticsBaseProperties["env"] {
  if (value === "preview" || value === "production") {
    return value;
  }

  return "local";
}
