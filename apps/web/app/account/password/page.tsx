import { Panel, SectionHeader } from "@xwlc/ui";

import { PasswordForm } from "@/components/password-form";
import { normalizeInternalReturnTo } from "@/lib/services/internal-return";

import {
  AccountAppShell,
  AccountPageHeader,
  getAccountPageContext
} from "../account-shell";
type PasswordPageSearchParams = {
  next?: string;
};

export default async function PasswordPage({
  searchParams
}: {
  searchParams: Promise<PasswordPageSearchParams>;
}) {
  const params = await searchParams;
  const nextPath = normalizeInternalReturnTo(params.next, "/catcare");
  const context = await getAccountPageContext(
    `/account/password?next=${encodeURIComponent(nextPath)}`
  );
  const { copy } = context;

  return (
    <AccountAppShell activeNav="profile" context={context}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <AccountPageHeader
          description={copy.account.password.description}
          eyebrow={copy.account.password.eyebrow}
          title={copy.account.password.title}
        />

        <Panel>
          <SectionHeader
            description={copy.account.password.hint}
            title={copy.account.password.title}
          />
          <PasswordForm labels={copy.account.password} nextPath={nextPath} />
        </Panel>
      </div>
    </AccountAppShell>
  );
}
