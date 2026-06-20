"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@starter/ui";

import { resetAnalytics, trackEvent } from "@/lib/analytics/client";
import { signOutAction, type SignOutState } from "@/app/account/actions";

export function SignOutButton({
  labels
}: {
  labels: {
    signOut: string;
    working: string;
  };
}) {
  const [state, formAction, isPending] = useActionState<SignOutState, FormData>(
    signOutAction,
    null
  );

  useEffect(() => {
    if (state?.ok) {
      trackEvent("auth_logout_succeeded", {
        auth_provider: "supabase",
        result: "success"
      });
      resetAnalytics();
      window.location.assign(state.data.redirectTo);
    }
  }, [state]);

  function handleSignOutSubmit() {
    resetAnalytics();
  }

  return (
    <form action={formAction} onSubmit={handleSignOutSubmit}>
      <Button type="submit" variant="secondary">
        {isPending ? labels.working : labels.signOut}
      </Button>
    </form>
  );
}
