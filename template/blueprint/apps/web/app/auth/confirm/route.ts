import { NextResponse } from "next/server";
import { productConfig } from "@/config/product.config";
import { normalizeInternalReturn } from "@/modules/platform/navigation/internal-return";
import { createOptionalServerClient } from "@/modules/platform/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = normalizeInternalReturn(url.searchParams.get("next"), productConfig.paths.product);
  const client = await createOptionalServerClient();
  if (code && client) { const { error } = await client.auth.exchangeCodeForSession(code); if (!error) return NextResponse.redirect(new URL(next, url.origin)); }
  return NextResponse.redirect(new URL(`${productConfig.paths.login}?error=confirmation_failed`, url.origin));
}
