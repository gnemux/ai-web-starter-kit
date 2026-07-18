import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

const protectedPathPrefixes = ["/account", "/catcare", "/dashboard", "/demo/account"];

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  const isProtected = isProtectedPath(request.nextUrl.pathname);
  const pendingCookies: Array<{
    name: string;
    options: CookieOptions;
    value: string;
  }> = [];
  const pendingHeaders = new Map<string, string>();
  let response = NextResponse.next({ request });

  if (!isProtected) {
    return response;
  }

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
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          pendingCookies.push(...cookiesToSet);
          Object.entries(headers).forEach(([name, value]) => {
            pendingHeaders.set(name, value);
          });
        }
      }
    }
  );

  const { data, error } = await supabase.auth.getClaims();
  const hasClaims = Boolean(data?.claims?.sub) && !error;

  if (!hasClaims) {
    const loginUrl = request.nextUrl.clone();
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    loginUrl.pathname = isDemoPath(request.nextUrl.pathname)
      ? "/demo/login"
      : "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", nextPath);

    response = NextResponse.redirect(loginUrl);
  }

  return applyAuthResponseState(response, pendingCookies, pendingHeaders);
}

function applyAuthResponseState(
  response: NextResponse,
  cookies: Array<{ name: string; options: CookieOptions; value: string }>,
  headers: Map<string, string>
) {
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  headers.forEach((value, name) => {
    response.headers.set(name, value);
  });

  return response;
}

function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isDemoPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/demo/account");
}
