import { FormField, Input, Notice, PageHeader } from "@xwlc/ui";
import { productConfig } from "@/config/product.config";
import { signIn, signUp } from "@/modules/platform/auth/actions";
import { normalizeInternalReturn } from "@/modules/platform/navigation/internal-return";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; message?: string }> }) {
  const params = await searchParams;
  const next = normalizeInternalReturn(params.next, productConfig.paths.product);
  return <div className="page narrow"><PageHeader title={productConfig.login.title} description={productConfig.login.description} />{params.error && <Notice>Authentication is unavailable or the submitted credentials were not accepted.</Notice>}{params.message === "check_email" && <Notice>Check your email to confirm the new account, then return to sign in.</Notice>}<form action={signIn} className="card form"><input type="hidden" name="next" value={next} /><FormField label="Email"><Input name="email" type="email" autoComplete="email" required /></FormField><FormField label="Password" hint="Use at least 8 characters."><Input name="password" type="password" autoComplete="current-password" required minLength={8} /></FormField><div className="actions"><button className="button" type="submit">Sign in</button><button className="button secondary" formAction={signUp} type="submit">Create account</button></div></form></div>;
}
