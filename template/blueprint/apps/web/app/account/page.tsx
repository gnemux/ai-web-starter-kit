import { redirect } from "next/navigation";
import { PageHeader, StatePanel } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
import { signOut } from "@/modules/platform/auth/actions";
import { getLocalizedProduct } from "@/modules/platform/i18n/locale";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const account = await getCurrentAccount();
  const { messages, copy } = await getLocalizedProduct();
  if (!account.configured) return <div className="page"><PageHeader title={copy.account.title} description={copy.account.description} /><StatePanel kind="disabled" kindLabel={messages.stateDisabled} title={messages.authNotConfigured} description={messages.authNotConfiguredDescription} /></div>;
  if (!account.user) redirect(`${productConfig.paths.login}?next=${encodeURIComponent(productConfig.paths.account)}`);
  return <div className="page narrow"><PageHeader title={copy.account.title} description={copy.account.description} /><section className="card"><p className="eyebrow">{messages.signedIn}</p><h2>{account.user.email ?? copy.account.title}</h2><ProfileForm initialName={account.profile?.display_name ?? ""} labels={{ displayName: messages.displayName, displayNameHint: messages.displayNameHint, save: messages.saveProfile, saving: messages.saving, success: messages.profileSaved, error: messages.profileFailed }} /><form action={signOut} className="form"><button className="button secondary" type="submit">{messages.signOut}</button></form></section></div>;
}
