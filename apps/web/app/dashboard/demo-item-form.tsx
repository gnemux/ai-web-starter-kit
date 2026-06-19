"use client";

import { useActionState } from "react";

import { Button } from "@starter/ui";

import {
  createDemoItemAction,
  type DemoItemActionState
} from "./actions";

const initialState: DemoItemActionState = null;

type DemoItemFormLabels = {
  createHint: string;
  created: string;
  titleLabel: string;
  titlePlaceholder: string;
  visibilityLabel: string;
  private: string;
  public: string;
  notesLabel: string;
  notesPlaceholder: string;
  submit: string;
  submitting: string;
};

type DemoItemErrorLabels = {
  general: string;
  title: string;
  notes: string;
  visibility: string;
};

export function DemoItemForm({
  errorLabels,
  labels
}: {
  errorLabels: DemoItemErrorLabels;
  labels: DemoItemFormLabels;
}) {
  const [state, formAction, pending] = useActionState(
    createDemoItemAction,
    initialState
  );
  const fieldErrors = !state?.ok ? state?.error.fields : undefined;

  return (
    <form action={formAction} className="mt-5 grid gap-4 border-t border-slate-200 pt-5">
      <div className="grid gap-4 md:grid-cols-[1fr_12rem]">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.titleLabel}
          </span>
          <input
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            maxLength={120}
            name="title"
            placeholder={labels.titlePlaceholder}
            type="text"
          />
          {fieldErrors?.title ? (
            <span className="text-xs font-medium text-rose-600">
              {errorLabels.title}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.visibilityLabel}
          </span>
          <select
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            defaultValue="private"
            name="visibility"
          >
            <option value="private">{labels.private}</option>
            <option value="public">{labels.public}</option>
          </select>
          {fieldErrors?.visibility ? (
            <span className="text-xs font-medium text-rose-600">
              {errorLabels.visibility}
            </span>
          ) : null}
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-slate-500">
          {labels.notesLabel}
        </span>
        <textarea
          className="min-h-24 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          maxLength={500}
          name="notes"
          placeholder={labels.notesPlaceholder}
        />
        {fieldErrors?.notes ? (
          <span className="text-xs font-medium text-rose-600">
            {errorLabels.notes}
          </span>
        ) : null}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResultMessage errorLabels={errorLabels} labels={labels} state={state} />
        <Button type="submit" disabled={pending}>
          {pending ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  );
}

function ResultMessage({
  errorLabels,
  labels,
  state
}: {
  errorLabels?: DemoItemErrorLabels;
  labels: DemoItemFormLabels;
  state: DemoItemActionState;
}) {
  if (!state) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        {labels.createHint}
      </p>
    );
  }

  if (state.ok) {
    return (
      <p className="text-sm font-medium leading-6 text-emerald-700">
        {labels.created}
      </p>
    );
  }

  return (
    <p className="text-sm font-medium leading-6 text-rose-700">
      {errorLabels?.general ?? state.error.message}
    </p>
  );
}
