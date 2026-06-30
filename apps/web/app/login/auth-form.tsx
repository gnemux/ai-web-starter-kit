"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthMode, ServiceErrorCode } from "@xwlc/core";
import { Button } from "@xwlc/ui";

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
  defaultNextPath = "/reference-product",
  errorLabels,
  initialMode,
  labels,
  modePath = "/login",
  nextPath
}: {
  defaultNextPath?: string;
  errorLabels: AuthFormErrorLabels;
  initialMode: AuthMode;
  labels: AuthFormLabels;
  modePath?: string;
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
      className="space-y-5"
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

      <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
        <button
          className={`min-h-10 rounded-md text-sm font-semibold transition ${
            !isSignUp
              ? "bg-white text-teal-700 shadow-sm"
              : "text-slate-500 hover:text-slate-950"
          }`}
          onClick={() => switchMode("signin")}
          type="button"
        >
          {labels.signIn}
        </button>
        <button
          className={`min-h-10 rounded-md text-sm font-semibold transition ${
            isSignUp
              ? "bg-white text-teal-700 shadow-sm"
              : "text-slate-500 hover:text-slate-950"
          }`}
          onClick={() => switchMode("signup")}
          type="button"
        >
          {labels.createAccount}
        </button>
      </div>

      <div className="rounded-lg border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-sm font-semibold text-teal-800">
          {isSignUp ? labels.startWithEmail : labels.welcomeBack}
        </p>
        <p className="mt-1 text-sm leading-6 text-teal-900/70">
          {isSignUp ? labels.newHere : labels.accessDashboard}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          {labels.email}
        </label>
        <input
          autoComplete="email"
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          id="email"
          name="email"
          placeholder="name@example.com"
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
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          id="password"
          name="password"
          placeholder="••••••••"
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

      <Button className="min-h-12 w-full bg-teal-700 hover:bg-teal-800" type="submit">
        {isPending ? labels.working : isSignUp ? labels.createAccount : labels.signIn}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <span>{isSignUp ? labels.alreadyHaveAccount : labels.newHere}</span>
        <button
          className="font-medium text-teal-700 hover:text-teal-900"
          onClick={() => switchMode(isSignUp ? "signin" : "signup")}
          type="button"
        >
          {isSignUp ? labels.switchToSignIn : labels.switchToSignUp}
        </button>
      </div>
    </form>
  );

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setSubmittedMode(nextMode);
    setHasSubmittedCurrentMode(false);
    router.replace(buildModeUrl(nextMode, nextPath, modePath, defaultNextPath));
  }
}

function buildModeUrl(
  mode: AuthMode,
  nextPath: string,
  modePath: string,
  defaultNextPath: string
) {
  const params = new URLSearchParams();

  if (mode === "signup") {
    params.set("mode", "signup");
  }

  if (nextPath !== defaultNextPath) {
    params.set("next", nextPath);
  }

  const query = params.toString();

  return query ? `${modePath}?${query}` : modePath;
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
