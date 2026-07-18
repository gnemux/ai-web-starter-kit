import "server-only";

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { serviceOk, type ServiceResult } from "@xwlc/core";

import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";
import { createSupabaseRouteCookieState } from "./route-cookie-state";
import type { AppSupabaseClient } from "./server";

export type SupabaseRouteClient = {
  applyToResponse(response: NextResponse): NextResponse;
  client: AppSupabaseClient;
};

export function createSupabaseRouteClient(
  request: NextRequest
): ServiceResult<SupabaseRouteClient> {
  const config = getSupabasePublicConfig();

  if (!config.ok) {
    return config;
  }

  const cookieState = createSupabaseRouteCookieState(request.cookies.getAll());
  const client = createServerClient<Database>(
    config.data.url,
    config.data.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieState.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookieState.setAll(cookiesToSet, headers);
        }
      }
    }
  );

  return serviceOk({
    client,
    applyToResponse(response) {
      return cookieState.applyToResponse(response);
    }
  });
}
