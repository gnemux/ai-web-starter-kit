import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { exchangeAuthConfirmationForSession } from "@/lib/services/auth";
import { normalizeInternalReturnTo } from "@/lib/services/internal-return";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const result = await exchangeAuthConfirmationForSession({
    code,
    tokenHash,
    type,
    nextPath
  });

  if (result.ok) {
    redirect(result.data.redirectTo);
  }

  if (nextPath.startsWith("/account/password")) {
    const passwordUrl = new URL(nextPath, request.nextUrl.origin);
    const returnPath = normalizeInternalReturnTo(
      passwordUrl.searchParams.get("next"),
      "/catcare"
    );
    const resetUrl = new URL("/login", request.nextUrl.origin);
    resetUrl.searchParams.set("mode", "reset");
    resetUrl.searchParams.set("next", returnPath);
    resetUrl.searchParams.set("error", "confirmation_failed");
    redirect(`${resetUrl.pathname}${resetUrl.search}`);
  }

  redirect("/login?error=confirmation_failed");
}
