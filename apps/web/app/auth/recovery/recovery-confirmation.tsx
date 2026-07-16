"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@xwlc/ui";

import {
  continuePasswordRecoveryAction,
  type RecoveryContinuationState
} from "./actions";

type RecoveryLabels = {
  continue: string;
  invalid: string;
  ready: string;
  requestNew: string;
  verifying: string;
};

type RecoveryLinkState = "loading" | "ready" | "invalid";

export function RecoveryConfirmation({
  labels,
  nextPath
}: {
  labels: RecoveryLabels;
  nextPath: string;
}) {
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [linkState, setLinkState] = useState<RecoveryLinkState>("loading");
  const [state, formAction, isPending] = useActionState<
    RecoveryContinuationState,
    FormData
  >(continuePasswordRecoveryAction, null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`
    );

    if (
      type !== "recovery" ||
      !tokenHash ||
      tokenHash.length < 32 ||
      tokenHash.length > 512 ||
      !/^[A-Za-z0-9._~-]+$/.test(tokenHash)
    ) {
      setLinkState("invalid");
      return;
    }

    setTokenHash(tokenHash);
    setLinkState("ready");
  }, []);

  useEffect(() => {
    if (state && !state.ok) {
      setTokenHash(null);
    }
  }, [state]);

  const failed = linkState === "invalid" || Boolean(state && !state.ok);
  const requestUrl = `/login?mode=reset&next=${encodeURIComponent(nextPath)}`;

  if (linkState === "loading") {
    return (
      <p aria-live="polite" className="text-sm leading-6 text-slate-600">
        {labels.verifying}
      </p>
    );
  }

  if (failed) {
    return (
      <div className="space-y-4">
        <div
          aria-live="assertive"
          className="rounded-md border border-rose-200 bg-rose-50 p-3"
          role="alert"
        >
          <p className="text-sm font-medium text-rose-900">{labels.invalid}</p>
        </div>
        <Button href={requestUrl}>{labels.requestNew}</Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input name="next" type="hidden" value={nextPath} />
      <input name="tokenHash" type="hidden" value={tokenHash ?? ""} />
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-sm leading-6 text-emerald-950">{labels.ready}</p>
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? labels.verifying : labels.continue}
      </Button>
    </form>
  );
}
