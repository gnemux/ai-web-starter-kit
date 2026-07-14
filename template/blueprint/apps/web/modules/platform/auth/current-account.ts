import "server-only";
import { cache } from "react";
import { createOptionalServerClient } from "../supabase/server";

export const getCurrentAccount = cache(async () => {
  const client = await createOptionalServerClient();
  if (!client) return { configured: false as const, user: null };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { configured: true as const, user: null, profile: null };
  const { data: profile } = await client.from("user_profiles").select("display_name, avatar_url").eq("id", data.user.id).maybeSingle();
  return { configured: true as const, user: data.user, profile };
});
