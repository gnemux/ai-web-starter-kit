import type { ReactNode } from "react";

import { getCatCarePageContext } from "./catcare-shell";
import { CatCareShellClient } from "./catcare-shell-client";

export default async function CatCareLayout({
  children
}: {
  children: ReactNode;
}) {
  const context = await getCatCarePageContext("/catcare");

  return (
    <CatCareShellClient
      avatarUrl={context.account.profile?.avatarUrl}
      billingPlanLabel={context.billingPlanLabel}
      copy={context.copy}
      creditLabel={context.creditLabel}
      email={context.account.user.email}
      locale={context.locale}
      userLabel={context.userLabel}
    >
      {children}
    </CatCareShellClient>
  );
}
