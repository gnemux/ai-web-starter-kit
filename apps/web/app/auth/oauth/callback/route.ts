import { NextResponse, type NextRequest } from "next/server";

import { trackServerEvent } from "@/lib/analytics/server";
import {
  ensureAuthenticatedUserProfile
} from "@/lib/services/auth";
import {
  completeSocialOAuthWithAuth,
  normalizeSocialOAuthProvider,
  type SocialOAuthAuthClient,
  type SocialOAuthProvider
} from "@/lib/services/oauth";
import { normalizeInternalReturnTo } from "@/lib/services/internal-return";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OAuthFailure =
  | "cancelled"
  | "callback_failed"
  | "provider_unavailable";

export async function GET(request: NextRequest) {
  const nextPath = normalizeInternalReturnTo(
    request.nextUrl.searchParams.get("next"),
    "/catcare"
  );
  const providerResult = normalizeSocialOAuthProvider(
    request.nextUrl.searchParams.get("provider")
  );

  if (!providerResult.ok) {
    return redirectToLoginFailure(
      request,
      "callback_failed",
      null,
      nextPath
    );
  }

  const provider = providerResult.data;
  const callbackError = request.nextUrl.searchParams.get("error");
  if (callbackError) {
    return redirectToLoginFailure(
      request,
      callbackError === "access_denied" ? "cancelled" : "callback_failed",
      provider,
      nextPath
    );
  }

  const clientResult = await createSupabaseServerClient();
  if (!clientResult.ok) {
    return redirectToLoginFailure(
      request,
      "provider_unavailable",
      provider,
      nextPath
    );
  }

  const completionResult = await completeSocialOAuthWithAuth(
    clientResult.data.auth as unknown as SocialOAuthAuthClient,
    {
      code: request.nextUrl.searchParams.get("code") ?? "",
      provider
    }
  );

  if (!completionResult.ok) {
    return redirectToLoginFailure(
      request,
      "callback_failed",
      provider,
      nextPath
    );
  }

  const profileResult = await ensureAuthenticatedUserProfile(
    clientResult.data,
    completionResult.data.userId,
    completionResult.data.displayNameCandidate
  );

  if (!profileResult.ok) {
    return redirectToLoginFailure(
      request,
      "provider_unavailable",
      provider,
      nextPath
    );
  }

  await trackServerEvent({
    distinctId: completionResult.data.userId,
    event: "user_logged_in",
    module: "auth",
    properties: {
      auth_method: "oauth",
      auth_provider: provider,
      result: "success"
    }
  });

  if (!profileResult.data.displayName) {
    const completionUrl = new URL("/account", request.nextUrl.origin);
    completionUrl.searchParams.set("complete_profile", "1");
    completionUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(completionUrl, 303);
  }

  return NextResponse.redirect(new URL(nextPath, request.nextUrl.origin), 303);
}

function redirectToLoginFailure(
  request: NextRequest,
  failure: OAuthFailure,
  provider: SocialOAuthProvider | null,
  nextPath: string
) {
  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("oauth_error", failure);
  if (provider) {
    loginUrl.searchParams.set("oauth_provider", provider);
  }
  if (nextPath !== "/catcare") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl, 303);
}
