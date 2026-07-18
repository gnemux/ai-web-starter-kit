import {
  Panel,
  SectionHeader
} from "@xwlc/ui";

import { normalizeInternalReturnTo } from "@/lib/services/internal-return";

import {
  AccountAppShell,
  AccountPageHeader,
  getAccountPageContext
} from "./account-shell";
import { ProfileForm } from "./profile-form";

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{
    complete_profile?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;
  const isProfileCompletion = params.complete_profile === "1";
  const nextPath = normalizeInternalReturnTo(params.next, "/catcare");
  const currentPath = isProfileCompletion
    ? `/account?complete_profile=1&next=${encodeURIComponent(nextPath)}`
    : "/account";
  const context = await getAccountPageContext(currentPath);
  const { account, copy, displayName } = context;

  return (
    <AccountAppShell activeNav="profile" context={context}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AccountPageHeader
          description={copy.account.description}
          eyebrow={copy.account.eyebrow}
          title={copy.account.title}
        />

        <Panel>
          {isProfileCompletion ? (
            <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50 p-4">
              <p className="font-semibold text-teal-950">
                {copy.account.profile.completionTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-teal-900">
                {copy.account.profile.completionDescription}
              </p>
            </div>
          ) : null}
          <SectionHeader
            description={copy.account.profile.description}
            title={copy.account.profile.title}
          />
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">
              {copy.account.emailLabel}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {account.user.email}
            </p>
          </div>
          <ProfileForm
            errorLabels={copy.errors.profile}
            initialDisplayName={displayName}
            isProfileCompletion={isProfileCompletion}
            labels={copy.account.profile}
            nextPath={nextPath}
          />
        </Panel>
      </div>
    </AccountAppShell>
  );
}
