import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { exchangeAuthCodeForSession } from "@/lib/services/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const result = await exchangeAuthCodeForSession(code, nextPath);

  if (result.ok) {
    redirect(result.data.redirectTo);
  }

  redirect("/login?error=confirmation_failed");
}
