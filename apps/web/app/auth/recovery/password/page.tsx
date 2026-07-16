import { redirect } from "next/navigation";

import { Badge, Button, Panel, SectionHeader } from "@xwlc/ui";

import { CatCareBrand } from "@/components/catcare-brand";
import { CatCareProductFrame } from "@/components/catcare-ui";
import { PasswordForm } from "@/components/password-form";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getCurrentUserClaims } from "@/lib/services/auth";
import { normalizeInternalReturnTo } from "@/lib/services/internal-return";

type RecoveryPasswordSearchParams = {
  next?: string;
};

export default async function RecoveryPasswordPage({
  searchParams
}: {
  searchParams: Promise<RecoveryPasswordSearchParams>;
}) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const params = await searchParams;
  const nextPath = normalizeInternalReturnTo(params.next, "/catcare");
  const userResult = await getCurrentUserClaims();

  if (!userResult.ok) {
    redirect(`/login?mode=reset&next=${encodeURIComponent(nextPath)}`);
  }

  const labels = copy.login.recovery;

  return (
    <main className="min-h-screen bg-[#fbf8f3] px-3 py-3 text-slate-950 sm:px-5 sm:py-5">
      <CatCareProductFrame className="min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)]">
        <section className="mx-auto flex w-full max-w-3xl flex-col px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between gap-4">
            <CatCareBrand />
            <Button href="/login" variant="secondary">
              {copy.login.backToSignIn}
            </Button>
          </div>

          <Panel className="mt-10">
            <Badge>{labels.passwordBadge}</Badge>
            <div className="mt-4">
              <SectionHeader
                description={labels.passwordDescription}
                title={labels.passwordTitle}
              />
            </div>
            <PasswordForm labels={copy.account.password} nextPath={nextPath} />
          </Panel>
        </section>
      </CatCareProductFrame>
    </main>
  );
}
