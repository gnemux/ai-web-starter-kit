"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthMode, ServiceErrorCode } from "@xwlc/core";
import { Button } from "@xwlc/ui";

import {
  identifyAuthUser,
  trackEvent
} from "@/lib/analytics/client";

import type { AuthFormState } from "./actions";

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
  rememberMe?: string;
  forgotPassword?: string;
};

type OAuthLabels = {
  apple: string;
  google: string;
  title: string;
  unavailable: string;
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
  defaultNextPath = "/catcare",
  errorLabels,
  initialMode,
  labels,
  modePath = "/login",
  nextPath,
  oauthLabels
}: {
  defaultNextPath?: string;
  errorLabels: AuthFormErrorLabels;
  initialMode: AuthMode;
  labels: AuthFormLabels;
  modePath?: string;
  nextPath: string;
  oauthLabels?: OAuthLabels;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [submittedMode, setSubmittedMode] = useState<AuthMode>(initialMode);
  const [hasSubmittedCurrentMode, setHasSubmittedCurrentMode] = useState(false);
  const handledStateRef = useRef<AuthFormState>(null);
  const [state, setState] = useState<AuthFormState>(null);
  const [isPending, setIsPending] = useState(false);
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
      className="min-w-0 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const submitted = String(formData.get("mode") ?? "signin") as AuthMode;
        setSubmittedMode(submitted);
        setHasSubmittedCurrentMode(true);
        setIsPending(true);
        trackEvent(
          submitted === "signup" ? "signup_started" : "login_started",
          {
            auth_provider: "supabase",
            auth_method: "password",
            next_path: nextPath
          }
        );

        try {
          const response = await fetch("/login/auth", {
            body: formData,
            method: "POST"
          });
          const nextState = (await response.json()) as AuthFormState;
          setState(nextState);
        } catch {
          setState({
            mode: submitted,
            result: {
              ok: false,
              error: {
                code: "system_error",
                message: "Unable to complete authentication."
              }
            }
          });
        } finally {
          setIsPending(false);
        }
      }}
    >
      <input name="mode" type="hidden" value={mode} />
      <input name="next" type="hidden" value={nextPath} />

      <div className="grid min-w-0 grid-cols-2 border-b border-slate-200">
        <button
          className={`min-w-0 border-b-2 px-2 py-4 text-base font-semibold leading-6 transition sm:text-lg ${
            !isSignUp
              ? "border-teal-700 text-teal-700"
              : "text-slate-500 hover:text-slate-950"
          }`}
          onClick={() => switchMode("signin")}
          type="button"
        >
          {labels.signIn}
        </button>
        <button
          className={`min-w-0 border-b-2 px-2 py-4 text-base font-semibold leading-6 transition sm:text-lg ${
            isSignUp
              ? "border-teal-700 text-teal-700"
              : "text-slate-500 hover:text-slate-950"
          }`}
          onClick={() => switchMode("signup")}
          type="button"
        >
          {labels.createAccount}
        </button>
      </div>

      {oauthLabels ? <OAuthOptions labels={oauthLabels} /> : null}

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          {labels.email}
        </label>
        <input
          autoComplete="email"
          className="mt-2 min-h-16 w-full rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
          className="mt-2 min-h-16 w-full rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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

      {labels.rememberMe || labels.forgotPassword ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          {labels.rememberMe ? (
            <label className="inline-flex items-center gap-2 font-medium text-slate-600">
              <input
                className="h-4 w-4 accent-teal-700"
                defaultChecked
                type="checkbox"
              />
              {labels.rememberMe}
            </label>
          ) : (
            <span />
          )}
          {labels.forgotPassword ? (
            <span className="font-medium text-teal-700">
              {labels.forgotPassword}
            </span>
          ) : null}
        </div>
      ) : null}

      <Button className="min-h-16 w-full rounded-xl bg-teal-700 text-lg hover:bg-teal-800" type="submit">
        {isPending ? labels.working : isSignUp ? labels.createAccount : labels.signIn}
      </Button>

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

function OAuthOptions({ labels }: { labels: OAuthLabels }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {[labels.google, labels.apple].map((label) => (
          <button
            className="flex min-h-16 min-w-0 cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-400 sm:gap-4"
            disabled
            key={label}
            type="button"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500">
              {label.includes("Google") ? "G" : ""}
            </span>
            <span className="min-w-0 text-center leading-6">{label}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm text-slate-400">
        <span className="h-px bg-slate-200" />
        <span>{labels.title}</span>
        <span className="h-px bg-slate-200" />
      </div>
    </div>
  );
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
