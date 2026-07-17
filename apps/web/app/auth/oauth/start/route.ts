import { NextResponse, type NextRequest } from "next/server";

import {
  buildSocialOAuthCallbackUrl,
  normalizeSocialOAuthStartInput,
  startSocialOAuthWithAuth,
  type SocialOAuthAuthClient
} from "@/lib/services/oauth";
import { getAuthAppUrl } from "@/lib/services/auth";
import { getSocialOAuthProviderAvailability } from "@/lib/services/oauth-provider-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const inputResult = normalizeSocialOAuthStartInput(
    formData.get("provider"),
    formData.get("next")
  );

  if (!inputResult.ok) {
    return NextResponse.json(
      { error: "invalid_request", ok: false },
      { status: 400 }
    );
  }

  const availabilityResult = await getSocialOAuthProviderAvailability(
    inputResult.data.provider
  );
  if (!availabilityResult.ok || !availabilityResult.data) {
    return NextResponse.json(
      { error: "provider_unavailable", ok: false },
      { status: 503 }
    );
  }

  const appUrlResult = getAuthAppUrl();
  if (!appUrlResult.ok) {
    return NextResponse.json(
      { error: "provider_unavailable", ok: false },
      { status: 503 }
    );
  }

  const callbackResult = buildSocialOAuthCallbackUrl(
    appUrlResult.data,
    inputResult.data.provider,
    inputResult.data.nextPath
  );
  if (!callbackResult.ok) {
    return NextResponse.json(
      { error: "provider_unavailable", ok: false },
      { status: 503 }
    );
  }

  const clientResult = await createSupabaseServerClient();
  if (!clientResult.ok) {
    return NextResponse.json(
      { error: "provider_unavailable", ok: false },
      { status: 503 }
    );
  }

  const startResult = await startSocialOAuthWithAuth(
    clientResult.data.auth as unknown as SocialOAuthAuthClient,
    {
      provider: inputResult.data.provider,
      redirectTo: callbackResult.data
    }
  );

  if (!startResult.ok) {
    return NextResponse.json(
      { error: "provider_unavailable", ok: false },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    provider: startResult.data.provider,
    url: startResult.data.url
  });
}
