import { Panel, SectionHeader } from "@xwlc/ui";

import { ProfileForm } from "@/app/account/profile-form";

import {
  DemoAccountAppShell,
  DemoAccountPageHeader,
  getDemoAccountPageContext
} from "./account-shell";

export default async function DemoAccountPage() {
  const context = await getDemoAccountPageContext("/demo/account");
  const { account, copy, displayName } = context;

  return (
    <DemoAccountAppShell activeNav="profile" context={context}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <DemoAccountPageHeader
          description={copy.account.description}
          eyebrow={copy.demo.badge}
          title={copy.account.title}
        />

        <Panel>
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
            labels={copy.account.profile}
          />
        </Panel>
      </div>
    </DemoAccountAppShell>
  );
}
