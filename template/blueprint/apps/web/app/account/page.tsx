import { redirect } from "next/navigation";
import { FormField, Input, Notice, PageHeader, StatePanel } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
import { signOut, updateProfile } from "@/modules/platform/auth/actions";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const account = await getCurrentAccount();
  if (!account.configured) return <div className="page"><PageHeader title={productConfig.account.title} description={productConfig.account.description} /><StatePanel kind="disabled" title="Authentication not configured" description="Add this product's public Supabase values to enable account sessions." /></div>;
  if (!account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.account)}`);
  return <div className="page narrow"><PageHeader title={productConfig.account.title} description={productConfig.account.description} />{params.error && <Notice>The profile could not be saved. Review the value and try again.</Notice>}{params.message === "profile_saved" && <Notice>Profile saved.</Notice>}<section className="card"><p className="eyebrow">Signed in</p><h2>{account.user.email ?? "Account"}</h2><form action={updateProfile} className="form"><FormField label="Display name" hint="Optional, up to 120 characters."><Input name="displayName" defaultValue={account.profile?.display_name ?? ""} maxLength={120} autoComplete="name" /></FormField><button className="button" type="submit">Save profile</button></form><form action={signOut} className="form"><button className="button secondary" type="submit">Sign out</button></form></section></div>;
}
