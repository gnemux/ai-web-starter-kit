"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthMode, ServiceErrorCode } from "@starter/core";
import { Button } from "@starter/ui";

import {
  identifyAuthUser,
  trackEvent
} from "@/lib/analytics/client";

import { submitAuthAction, type AuthFormState } from "./actions";

type AuthFormLabels = {
  accessDashboard: string;
  email: string;
  password: string;
  createAccount: string;
  signIn: string;
  working: string;
  alreadyHaveAccount: string;
  newHere: string;
  switchToSignIn: string;
  switchToSignUp: string;
  confirmationPending: string;
  providerNote: string;
  startWithEmail: string;
  welcomeBack: string;
};

type AuthFormErrorLabels = {
  accountExists: string;
  configuration: string;
  confirmationRequired: string;
  email: string;
  password: string;
  general: string;
  signUpGeneral: string;
};

export function AuthForm({
  errorLabels,
  initialMode,
  labels,
  nextPath
}: {
  errorLabels: AuthFormErrorLabels;
  initialMode: AuthMode;
  labels: AuthFormLabels;
  nextPath: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [submittedMode, setSubmittedMode] = useState<AuthMode>(initialMode);
  const [hasSubmittedCurrentMode, setHasSubmittedCurrentMode] = useState(false);
  const handledStateRef = useRef<AuthFormState>(null);
  const [state, formAction, isPending] = useActionState<
    AuthFormState,
    FormData
  >(submitAuthAction, null);
  const isSignUp = mode === "signup";
  const visibleState =
    hasSubmittedCurrentMode &&
    !isPending &&
    state?.mode === mode &&
    state.mode === submittedMode
      ? state.result
      : null;

  useEffect(() => {
    if (!state || handledStateRef.current === state) {
      return;
    }

    handledStateRef.current = state;
    const result = state.result;

    if (!result.ok) {
      if (state.mode === "signin") {
        trackEvent("auth_login_failed", {
          auth_provider: "supabase",
          auth_method: "password",
          result: "failure",
          error_category: mapErrorCategory(result.error.code),
          next_path: nextPath
        });
      }

      return;
    }

    if (result.data.user) {
      identifyAuthUser(result.data.user);
    }

    if (state.mode === "signup") {
      trackEvent("user_signed_up", {
        auth_provider: "supabase",
        auth_method: "password",
        result:
          result.data.status === "confirmation_pending"
            ? "pending_confirmation"
            : "success",
        next_path: nextPath
      });
    } else {
      trackEvent("user_logged_in", {
        auth_provider: "supabase",
        auth_method: "password",
        result: "success",
        next_path: nextPath
      });
    }

    if (result.data.status === "authenticated") {
      router.push(result.data.redirectTo);
    }
  }, [nextPath, router, state]);

  return (
    <form
      action={formAction}
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const submitted = String(formData.get("mode") ?? "signin") as AuthMode;
        setSubmittedMode(submitted);
        setHasSubmittedCurrentMode(true);
        trackEvent(
          submitted === "signup" ? "signup_started" : "login_started",
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
        <p className="text-sm font-semibold text-cyan-700">
          {isSignUp ? labels.createAccount : labels.welcomeBack}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
          {isSignUp ? labels.startWithEmail : labels.accessDashboard}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {labels.providerNote}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          {labels.email}
        </label>
        <input
          autoComplete="email"
          className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          id="email"
          name="email"
          required
          type="email"
        />
        {!visibleState?.ok && visibleState?.error.fields?.email ? (
          <p className="mt-2 text-sm text-rose-700">{errorLabels.email}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          {labels.password}
        </label>
        <input
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          id="password"
          name="password"
          required
          type="password"
        />
        {!visibleState?.ok && visibleState?.error.fields?.password ? (
          <p className="mt-2 text-sm text-rose-700">
            {errorLabels.password}
          </p>
        ) : null}
      </div>

      {visibleState && !visibleState.ok && !visibleState.error.fields ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-900">
            {getGeneralErrorLabel(
              visibleState.error.code,
              mode,
              errorLabels
            )}
          </p>
        </div>
      ) : null}

      {visibleState?.ok && visibleState.data.status === "confirmation_pending" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-900">
            {labels.confirmationPending}
          </p>
        </div>
      ) : null}

      <Button className="w-full" type="submit">
        {isPending ? labels.working : isSignUp ? labels.createAccount : labels.signIn}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <span>{isSignUp ? labels.alreadyHaveAccount : labels.newHere}</span>
        <button
          className="font-medium text-cyan-700 hover:text-cyan-900"
          onClick={() => {
            const nextMode = isSignUp ? "signin" : "signup";

            setMode(nextMode);
            setSubmittedMode(nextMode);
            setHasSubmittedCurrentMode(false);
            router.replace(buildModeUrl(nextMode, nextPath));
          }}
          type="button"
        >
          {isSignUp ? labels.switchToSignIn : labels.switchToSignUp}
        </button>
      </div>
    </form>
  );
}

function buildModeUrl(mode: AuthMode, nextPath: string) {
  const params = new URLSearchParams();

  if (mode === "signup") {
    params.set("mode", "signup");
  }

  if (nextPath !== "/dashboard") {
    params.set("next", nextPath);
  }

  const query = params.toString();

  return query ? `/login?${query}` : "/login";
}

function getGeneralErrorLabel(
  code: ServiceErrorCode,
  mode: AuthMode,
  labels: AuthFormErrorLabels
) {
  if (code === "conflict") {
    return labels.accountExists;
  }

  if (code === "configuration_error") {
    return labels.configuration;
  }

  if (code === "forbidden") {
    return labels.confirmationRequired;
  }

  if (mode === "signup") {
    return labels.signUpGeneral;
  }

  return labels.general;
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
