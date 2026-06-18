import { serviceError, serviceOk, type ServiceResult } from "@starter/core";

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabasePublicConfig(): ServiceResult<SupabasePublicConfig> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    return serviceError(
      "configuration_error",
      "Supabase public environment variables are not configured."
    );
  }

  return serviceOk({
    url,
    publishableKey
  });
}
