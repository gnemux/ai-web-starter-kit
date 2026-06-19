"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@starter/ui";

import { resetAnalytics, trackEvent } from "@/lib/analytics/client";
import { signOutAction, type SignOutState } from "@/app/account/actions";

export function SignOutButton() {
  const router = useRouter();
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
      router.push(state.data.redirectTo);
    }
  }, [router, state]);

  return (
    <form action={formAction}>
      <Button type="submit" variant="secondary">
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
    </form>
  );
}
