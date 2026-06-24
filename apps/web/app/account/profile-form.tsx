"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@starter/ui";

import { trackEvent } from "@/lib/analytics/client";

import { updateProfileAction, type ProfileFormState } from "./actions";

export function ProfileForm({
  errorLabels,
  labels,
  initialDisplayName
}: {
  errorLabels: {
    displayName: string;
    general: string;
  };
  initialDisplayName: string;
  labels: {
    displayName: string;
    displayNamePlaceholder: string;
    save: string;
    saving: string;
    updated: string;
  };
}) {
  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfileAction, null);

  useEffect(() => {
    if (state?.ok) {
      trackEvent("user_profile_updated", {
        auth_provider: "supabase",
        result: "success",
        has_display_name: Boolean(state.data.displayName)
      });
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="displayName"
        >
          {labels.displayName}
        </label>
        <input
          className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          defaultValue={initialDisplayName}
          id="displayName"
          maxLength={80}
          name="displayName"
          placeholder={labels.displayNamePlaceholder}
          type="text"
        />
        {!state?.ok && state?.error.fields?.displayName ? (
          <p className="mt-2 text-sm text-rose-700">
            {errorLabels.displayName}
          </p>
        ) : null}
      </div>

      {state && !state.ok && !state.error.fields ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-900">
            {errorLabels.general}
          </p>
        </div>
      ) : null}

      {state?.ok ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-900">
            {labels.updated}
          </p>
        </div>
      ) : null}

      <Button type="submit">{isPending ? labels.saving : labels.save}</Button>
    </form>
  );
}
