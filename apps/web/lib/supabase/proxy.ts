import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

const protectedPathPrefixes = ["/account", "/dashboard"];

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  let response = NextResponse.next({
    request
  });

  if (!config.ok) {
    return response;
  }

  const supabase = createServerClient<Database>(
    config.data.url,
    config.data.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data, error } = await supabase.auth.getClaims();
  const hasClaims = Boolean(data?.claims?.sub) && !error;

  if (!hasClaims && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}
