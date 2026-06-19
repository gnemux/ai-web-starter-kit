"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthMode, ServiceErrorCode } from "@starter/core";
import { Button } from "@starter/ui";

import {
  identifyAuthUser,
  trackEvent
} from "@/lib/analytics/client";

import { submitAuthAction, type AuthFormState } from "./actions";

export function AuthForm({
  initialMode,
  nextPath
}: {
  initialMode: AuthMode;
  nextPath: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [submittedMode, setSubmittedMode] = useState<AuthMode>(initialMode);
  const [state, formAction, isPending] = useActionState<
    AuthFormState,
    FormData
  >(submitAuthAction, null);
  const isSignUp = mode === "signup";

  useEffect(() => {
    if (!state) {
      return;
    }

    if (!state.ok) {
      if (submittedMode === "signin") {
        trackEvent("auth_login_failed", {
          auth_provider: "supabase",
          auth_method: "password",
          result: "failure",
          error_category: mapErrorCategory(state.error.code),
          next_path: nextPath
        });
      }

      return;
    }

    if (state.data.user) {
      identifyAuthUser(state.data.user);
    }

    if (submittedMode === "signup") {
      trackEvent("auth_signup_succeeded", {
        auth_provider: "supabase",
        auth_method: "password",
        result:
          state.data.status === "confirmation_pending"
            ? "pending_confirmation"
            : "success",
        next_path: nextPath
      });
    } else {
      trackEvent("auth_login_succeeded", {
        auth_provider: "supabase",
        auth_method: "password",
        result: "success",
        next_path: nextPath
      });
    }

    if (state.data.status === "authenticated") {
      router.push(state.data.redirectTo);
    }
  }, [nextPath, router, state, submittedMode]);

  return (
    <form
      action={formAction}
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const submitted = String(formData.get("mode") ?? "signin") as AuthMode;
        setSubmittedMode(submitted);
        trackEvent(
          submitted === "signup"
            ? "auth_signup_submitted"
            : "auth_login_submitted",
          {
            auth_provider: "supabase",
            auth_method: "password",
            next_path: nextPath
          }
        );
      }}
    >
      <input name="mode" type="hidden" value={mode} />
      <input name="next" type="hidden" value={nextPath} />

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          id="email"
          name="email"
          required
          type="email"
        />
        {!state?.ok && state?.error.fields?.email ? (
          <p className="mt-2 text-sm text-rose-700">{state.error.fields.email}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          id="password"
          name="password"
          required
          type="password"
        />
        {!state?.ok && state?.error.fields?.password ? (
          <p className="mt-2 text-sm text-rose-700">
            {state.error.fields.password}
          </p>
        ) : null}
      </div>

      {state && !state.ok && !state.error.fields ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-900">
            {state.error.message}
          </p>
        </div>
      ) : null}

      {state?.ok && state.data.status === "confirmation_pending" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-900">
            {state.data.message}
          </p>
        </div>
      ) : null}

      <Button className="w-full" type="submit">
        {isPending ? "Working..." : isSignUp ? "Create account" : "Sign in"}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <span>{isSignUp ? "Already have an account?" : "New here?"}</span>
        <button
          className="font-medium text-cyan-700 hover:text-cyan-900"
          onClick={() => setMode(isSignUp ? "signin" : "signup")}
          type="button"
        >
          {isSignUp ? "Sign in" : "Create account"}
        </button>
      </div>
    </form>
  );
}

function mapErrorCategory(
  code: ServiceErrorCode
): "validation_error" | "provider_error" | "rate_limited" {
  if (code === "validation_error") {
    return "validation_error";
  }

  if (code === "system_error") {
    return "rate_limited";
  }

  return "provider_error";
}
