import { FormField, Input, Notice, PageHeader } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { signIn, signUp } from "@/modules/platform/auth/actions";
import { normalizeInternalReturn } from "@/modules/platform/navigation/internal-return";
import { getCurrentAccount } from "@/modules/platform/auth/current-account";
import { getLocalizedProduct } from "@/modules/platform/i18n/locale";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; message?: string }> }) {
  const params = await searchParams;
  const account = await getCurrentAccount();
  const { messages, copy } = await getLocalizedProduct();
  const next = normalizeInternalReturn(params.next, productConfig.paths.product);
  return <div className="page narrow"><PageHeader title={copy.login.title} description={copy.login.description} />{!account.configured && <Notice variant="warning">{messages.authUnavailable}</Notice>}{params.error && account.configured && <Notice variant="error">{messages.authRejected}</Notice>}{params.message === "check_email" && <Notice variant="success">{messages.checkEmail}</Notice>}<form action={signIn} className="card form" aria-disabled={!account.configured}><input type="hidden" name="next" value={next} /><FormField id="email" label={messages.email}><Input id="email" name="email" type="email" autoComplete="email" required disabled={!account.configured} /></FormField><FormField id="password" label={messages.password} hint={messages.passwordHint}><Input aria-describedby="password-hint" id="password" name="password" type="password" autoComplete="current-password" required minLength={8} disabled={!account.configured} /></FormField><div className="actions"><button className="button" disabled={!account.configured} type="submit">{messages.signIn}</button><button className="button secondary" disabled={!account.configured} formAction={signUp} type="submit">{messages.createAccount}</button></div></form></div>;
}
