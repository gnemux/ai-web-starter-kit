import "server-only";

import { createServerClient } from "@supabase/ssr";
import {
  createClient as createSupabaseClient,
  type SupabaseClient
} from "@supabase/supabase-js";
import { cookies } from "next/headers";

import {
  serviceError,
  serviceOk,
  type ServiceResult
} from "@xwlc/core";

import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

export type AppSupabaseClient = SupabaseClient<Database>;

export async function createSupabaseServerClient(): Promise<
  ServiceResult<AppSupabaseClient>
> {
  const config = getSupabasePublicConfig();

  if (!config.ok) {
    return config;
  }

  const cookieStore = await cookies();

  return serviceOk(
    createServerClient<Database>(config.data.url, config.data.publishableKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies; Proxy/Auth will own refresh in M4.
          }
        }
      }
    })
  );
}

export function createSupabaseAdminClient(): ServiceResult<AppSupabaseClient> {
  const config = getSupabasePublicConfig();
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!config.ok) {
    return config;
  }

  if (!secretKey) {
    return serviceError(
      "configuration_error",
      "Supabase server-only secret key is not configured."
    );
  }

  return serviceOk(
    createSupabaseClient<Database>(config.data.url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  );
}
