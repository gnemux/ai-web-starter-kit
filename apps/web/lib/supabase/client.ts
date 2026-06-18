"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();

  if (!config.ok) {
    throw new Error(config.error.message);
  }

  return createBrowserClient<Database>(
    config.data.url,
    config.data.publishableKey
  );
}
