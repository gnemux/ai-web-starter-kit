"use client";

import { useActionState, useState } from "react";

import { Button } from "@xwlc/ui";

import {
  updatePasswordAction,
  type PasswordUpdateState
} from "@/lib/actions/password";

export type PasswordFormLabels = {
  confirmPassword: string;
  failed: string;
  hint: string;
  invalid: string;
  mismatch: string;
  password: string;
  returnToProduct: string;
  sameAsCurrent: string;
  save: string;
  saving: string;
  updated: string;
};

export function PasswordForm({
  labels,
  nextPath
}: {
  labels: PasswordFormLabels;
  nextPath: string;
}) {
  const [state, formAction, isPending] = useActionState<
    PasswordUpdateState,
    FormData
  >(updatePasswordAction, null);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmationValue, setConfirmationValue] = useState("");
  const [submittedPassword, setSubmittedPassword] = useState("");
  const passwordFieldError =
    state && !state.ok ? state.error.fields?.password : undefined;
  const passwordError = Boolean(
    passwordFieldError === "too_short"
      ? passwordValue.length < 8
      : passwordFieldError === "same_as_current" &&
          passwordValue === submittedPassword
  );
  const confirmationError = Boolean(
    state &&
      !state.ok &&
      state.error.fields?.confirmPassword &&
      confirmationValue !== passwordValue
  );

  return (
    <form
      action={formAction}
      className="mt-5 space-y-4"
      onSubmit={() => setSubmittedPassword(passwordValue)}
    >
      <input name="next" type="hidden" value={nextPath} />

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="newPassword">
          {labels.password}
        </label>
        <input
          aria-describedby={
            passwordError
              ? "new-password-hint new-password-error"
              : "new-password-hint"
          }
          aria-invalid={passwordError}
          autoComplete="new-password"
          className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          id="newPassword"
          minLength={8}
          name="password"
          onChange={(event) => setPasswordValue(event.currentTarget.value)}
          required
          type="password"
        />
        <p className="mt-2 text-sm text-slate-500" id="new-password-hint">
          {labels.hint}
        </p>
        {passwordError ? (
          <p className="mt-2 text-sm text-rose-700" id="new-password-error">
            {passwordFieldError === "same_as_current"
              ? labels.sameAsCurrent
              : labels.invalid}
          </p>
        ) : null}
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="confirmNewPassword"
        >
          {labels.confirmPassword}
        </label>
        <input
          aria-describedby={
            confirmationError ? "confirm-new-password-error" : undefined
          }
          aria-invalid={confirmationError}
          autoComplete="new-password"
          className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          id="confirmNewPassword"
          minLength={8}
          name="confirmPassword"
          onChange={(event) =>
            setConfirmationValue(event.currentTarget.value)
          }
          required
          type="password"
        />
        {confirmationError ? (
          <p
            className="mt-2 text-sm text-rose-700"
            id="confirm-new-password-error"
          >
            {labels.mismatch}
          </p>
        ) : null}
      </div>

      {state && !state.ok && !state.error.fields ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-900">
            {state.error.code === "validation_error"
              ? labels.invalid
              : labels.failed}
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isPending || Boolean(state?.ok)} type="submit">
          {isPending ? labels.saving : labels.save}
        </Button>
        {state?.ok ? (
          <Button href={state.data.nextPath} variant="secondary">
            {labels.returnToProduct}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
