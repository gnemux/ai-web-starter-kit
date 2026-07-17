"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthMode, ServiceErrorCode } from "@xwlc/core";
import { Button } from "@xwlc/ui";

import {
  identifyAuthUser,
  trackEvent
} from "@/lib/analytics/client";

import type { AuthFormMode, AuthFormState } from "./actions";
import { trackOAuthEvent } from "./oauth-analytics";

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
  backToSignIn: string;
  resetDescription: string;
  resetFailed: string;
  resetPassword: string;
  resetRequested: string;
  resetTitle: string;
  sendingReset: string;
};

type OAuthLabels = {
  apple: string;
  callbackFailed: string;
  cancelled: string;
  google: string;
  title: string;
  unavailable: string;
  workingApple: string;
  workingGoogle: string;
};

export type OAuthFailure =
  | "cancelled"
  | "callback_failed"
  | "provider_unavailable";

export type OAuthProvider = "apple" | "google";

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
  oauthFailure,
  oauthLabels,
  oauthProvider
}: {
  defaultNextPath?: string;
  errorLabels: AuthFormErrorLabels;
  initialMode: AuthFormMode;
  labels: AuthFormLabels;
  modePath?: string;
  nextPath: string;
  oauthFailure?: OAuthFailure;
  oauthLabels?: OAuthLabels;
  oauthProvider?: OAuthProvider;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthFormMode>(initialMode);
  const [submittedMode, setSubmittedMode] =
    useState<AuthFormMode>(initialMode);
  const [hasSubmittedCurrentMode, setHasSubmittedCurrentMode] = useState(false);
  const handledStateRef = useRef<AuthFormState>(null);
  const [state, setState] = useState<AuthFormState>(null);
  const [isPending, setIsPending] = useState(false);
  const isSignUp = mode === "signup";
  const isReset = mode === "reset";
  const visibleState =
    hasSubmittedCurrentMode &&
    !isPending &&
    state?.mode === mode &&
    state.mode === submittedMode
      ? state
      : null;

  useEffect(() => {
    if (!state || handledStateRef.current === state) {
      return;
    }

    handledStateRef.current = state;
    if (state.mode === "reset") {
      return;
    }

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
        const submitted = normalizeAuthFormMode(formData.get("mode"));
        setSubmittedMode(submitted);
        setHasSubmittedCurrentMode(true);
        setIsPending(true);
        if (submitted !== "reset") {
          trackEvent(
            submitted === "signup" ? "signup_started" : "login_started",
            {
              auth_provider: "supabase",
              auth_method: "password",
              next_path: nextPath
            }
          );
        }

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

      {!isReset ? <div className="grid min-w-0 grid-cols-2 border-b border-slate-200">
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
      </div> : (
        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
          <h1 className="text-xl font-semibold text-slate-950">
            {labels.resetTitle}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {labels.resetDescription}
          </p>
        </div>
      )}

      {oauthLabels && !isReset ? (
        <OAuthOptions
          initialFailure={oauthFailure}
          initialProvider={oauthProvider}
          labels={oauthLabels}
          nextPath={nextPath}
        />
      ) : null}

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
        {visibleState && !visibleState.result.ok && visibleState.result.error.fields?.email ? (
          <p className="mt-2 text-sm text-rose-700">{errorLabels.email}</p>
        ) : null}
      </div>

      {!isReset ? <div>
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
        {visibleState?.mode !== "reset" &&
        visibleState &&
        !visibleState.result.ok &&
        visibleState.result.error.fields?.password ? (
          <p className="mt-2 text-sm text-rose-700">
            {errorLabels.password}
          </p>
        ) : null}
      </div> : null}

      {visibleState &&
      !visibleState.result.ok &&
      !visibleState.result.error.fields ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-900">
            {isReset
              ? labels.resetFailed
              : getGeneralErrorLabel(
                  visibleState.result.error.code,
                  mode as AuthMode,
                  errorLabels
                )}
          </p>
        </div>
      ) : null}

      {visibleState?.mode !== "reset" &&
      visibleState?.result.ok &&
      visibleState.result.data.status === "confirmation_pending" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-900">
            {labels.confirmationPending}
          </p>
        </div>
      ) : null}

      {visibleState?.mode === "reset" && visibleState.result.ok ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-900">
            {labels.resetRequested}
          </p>
        </div>
      ) : null}

      {!isReset && (labels.rememberMe || labels.forgotPassword) ? (
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
          {labels.forgotPassword && mode === "signin" ? (
            <button
              className="font-medium text-teal-700 hover:text-teal-900"
              onClick={() => switchMode("reset")}
              type="button"
            >
              {labels.forgotPassword}
            </button>
          ) : null}
        </div>
      ) : null}

      <Button
        className="min-h-16 w-full rounded-xl bg-teal-700 text-lg hover:bg-teal-800"
        disabled={isPending}
        type="submit"
      >
        {isPending
          ? isReset
            ? labels.sendingReset
            : labels.working
          : isReset
            ? labels.resetPassword
            : isSignUp
              ? labels.createAccount
              : labels.signIn}
      </Button>

      {isReset ? (
        <button
          className="w-full text-sm font-medium text-teal-700 hover:text-teal-900"
          onClick={() => switchMode("signin")}
          type="button"
        >
          {labels.backToSignIn}
        </button>
      ) : null}

    </form>
  );

  function switchMode(nextMode: AuthFormMode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setSubmittedMode(nextMode);
    setHasSubmittedCurrentMode(false);
    router.replace(buildModeUrl(nextMode, nextPath, modePath, defaultNextPath));
  }
}

function OAuthOptions({
  initialFailure,
  initialProvider,
  labels,
  nextPath
}: {
  initialFailure?: OAuthFailure;
  initialProvider?: OAuthProvider;
  labels: OAuthLabels;
  nextPath: string;
}) {
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProvider | null>(null);
  const [runtimeFailure, setRuntimeFailure] =
    useState<OAuthFailure | null>(null);
  const trackedFailureRef = useRef<string | null>(null);
  const visibleFailure = runtimeFailure ?? initialFailure;

  useEffect(() => {
    if (!initialFailure || !initialProvider) {
      return;
    }

    const key = `${initialProvider}:${initialFailure}`;
    if (trackedFailureRef.current === key) {
      return;
    }

    trackedFailureRef.current = key;
    trackOAuthEvent("auth_login_failed", {
      auth_method: "oauth",
      auth_provider: initialProvider,
      error_category: initialFailure,
      result: "failure"
    });
  }, [initialFailure, initialProvider]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {(["google", "apple"] as const).map((provider) => (
          <button
            aria-busy={pendingProvider === provider}
            className="flex min-h-16 min-w-0 items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 disabled:cursor-wait disabled:opacity-60 sm:gap-4"
            disabled={pendingProvider !== null}
            key={provider}
            onClick={() => startOAuth(provider)}
            type="button"
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center"
            >
              {provider === "google" ? <GoogleOAuthIcon /> : (
                <span className="text-2xl leading-none text-black"></span>
              )}
            </span>
            <span className="min-w-0 text-center leading-6">
              {pendingProvider === provider
                ? provider === "google"
                  ? labels.workingGoogle
                  : labels.workingApple
                : labels[provider]}
            </span>
          </button>
        ))}
      </div>
      {visibleFailure ? (
        <div
          className="rounded-md border border-rose-200 bg-rose-50 p-3"
          role="alert"
        >
          <p className="text-sm font-medium text-rose-900">
            {visibleFailure === "cancelled"
              ? labels.cancelled
              : visibleFailure === "callback_failed"
                ? labels.callbackFailed
                : labels.unavailable}
          </p>
        </div>
      ) : null}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm text-slate-400">
        <span className="h-px bg-slate-200" />
        <span>{labels.title}</span>
        <span className="h-px bg-slate-200" />
      </div>
    </div>
  );

  async function startOAuth(provider: OAuthProvider) {
    setPendingProvider(provider);
    setRuntimeFailure(null);
    trackOAuthEvent("login_started", {
      auth_method: "oauth",
      auth_provider: provider
    });

    const formData = new FormData();
    formData.set("next", nextPath);
    formData.set("provider", provider);

    try {
      const response = await fetch("/auth/oauth/start", {
        body: formData,
        method: "POST",
        signal: AbortSignal.timeout(12_000)
      });
      const result = (await response.json()) as {
        ok?: boolean;
        provider?: string;
        url?: string;
      };

      if (
        !response.ok ||
        !result.ok ||
        result.provider !== provider ||
        !isSafeOAuthNavigation(result.url)
      ) {
        throw new Error("oauth_start_failed");
      }

      window.location.assign(result.url);
    } catch {
      setRuntimeFailure("provider_unavailable");
      setPendingProvider(null);
      trackOAuthEvent("auth_login_failed", {
        auth_method: "oauth",
        auth_provider: provider,
        error_category: "provider_unavailable",
        result: "failure"
      });
    }
  }
}

function GoogleOAuthIcon() {
  return (
    <svg aria-hidden="true" height="22" viewBox="0 0 24 24" width="22">
      <path d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.33.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z" fill="#FBBC05" />
      <path d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" fill="#EA4335" />
    </svg>
  );
}

function isSafeOAuthNavigation(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

function buildModeUrl(
  mode: AuthFormMode,
  nextPath: string,
  modePath: string,
  defaultNextPath: string
) {
  const params = new URLSearchParams();

  if (mode !== "signin") {
    params.set("mode", mode);
  }

  if (nextPath !== defaultNextPath) {
    params.set("next", nextPath);
  }

  const query = params.toString();

  return query ? `${modePath}?${query}` : modePath;
}

function normalizeAuthFormMode(value: FormDataEntryValue | null): AuthFormMode {
  const mode = String(value ?? "signin");

  return mode === "signup" || mode === "reset" ? mode : "signin";
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
