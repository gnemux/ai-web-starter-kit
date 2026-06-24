import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { exchangeAuthConfirmationForSession } from "@/lib/services/auth";

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

  redirect("/login?error=confirmation_failed");
}
