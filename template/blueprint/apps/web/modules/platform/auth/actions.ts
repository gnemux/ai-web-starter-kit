"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { productConfig } from "@/config/product.config";
import { normalizeInternalReturn } from "../navigation/internal-return";
import { createOptionalServerClient } from "../supabase/server";
import { invalidateOwnerFact } from "../performance/cache";
import { buildEmailConfirmationUrl } from "./confirmation-url";

export async function signIn(formData: FormData) {
  const client = await createOptionalServerClient();
  if (!client) redirect(`${productConfig.paths.login}?error=not_configured`);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = normalizeInternalReturn(String(formData.get("next") ?? ""), productConfig.paths.product);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect(`${productConfig.paths.login}?error=invalid_credentials`);
  revalidatePath(productConfig.paths.home);
  revalidatePath(productConfig.paths.account);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const client = await createOptionalServerClient();
  if (!client) redirect(`${productConfig.paths.login}?error=not_configured`);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = normalizeInternalReturn(String(formData.get("next") ?? ""), productConfig.paths.product);
  if (!email || password.length < 8) redirect(`${productConfig.paths.login}?error=invalid_signup`);
  let emailRedirectTo: string;
  try { emailRedirectTo = buildEmailConfirmationUrl(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", next); }
  catch { redirect(`${productConfig.paths.login}?error=invalid_app_url`); }
  const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo } });
  if (error) redirect(`${productConfig.paths.login}?error=signup_failed`);
  if (!data.session) redirect(`${productConfig.paths.login}?message=check_email`);
  revalidatePath(productConfig.paths.home);
  redirect(next);
}

export type ProfileActionState = { status: "idle" | "success" | "error"; message: string };

export async function updateProfile(_previous: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const client = await createOptionalServerClient();
  if (!client) return { status: "error", message: "not_configured" };
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { status: "error", message: "not_authenticated" };
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (displayName.length > 120) return { status: "error", message: "invalid_profile" };
  const { error: profileError } = await client.from("user_profiles").upsert({ id: data.user.id, display_name: displayName || null }, { onConflict: "id" });
  if (profileError) return { status: "error", message: "profile_update_failed" };
  invalidateOwnerFact("account_profile", data.user.id);
  revalidatePath(productConfig.paths.account);
  return { status: "success", message: "profile_saved" };
}

export async function signOut() {
  const client = await createOptionalServerClient();
  if (client) await client.auth.signOut();
  revalidatePath(productConfig.paths.home);
  redirect(productConfig.paths.home);
}
