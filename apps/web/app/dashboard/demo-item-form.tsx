"use client";

import { useActionState } from "react";

import { Button } from "@starter/ui";

import {
  createDemoItemAction,
  type DemoItemActionState
} from "./actions";

const initialState: DemoItemActionState = null;

export function DemoItemForm() {
  const [state, formAction, pending] = useActionState(
    createDemoItemAction,
    initialState
  );
  const fieldErrors = !state?.ok ? state?.error.fields : undefined;

  return (
    <form action={formAction} className="mt-5 grid gap-4 border-t border-slate-200 pt-5">
      <div className="grid gap-4 md:grid-cols-[1fr_12rem]">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">Title</span>
          <input
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            maxLength={120}
            name="title"
            placeholder="Customer onboarding checklist"
            type="text"
          />
          {fieldErrors?.title ? (
            <span className="text-xs font-medium text-rose-600">
              {fieldErrors.title}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">Visibility</span>
          <select
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            defaultValue="private"
            name="visibility"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
          {fieldErrors?.visibility ? (
            <span className="text-xs font-medium text-rose-600">
              {fieldErrors.visibility}
            </span>
          ) : null}
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-slate-500">Notes</span>
        <textarea
          className="min-h-24 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          maxLength={500}
          name="notes"
          placeholder="Optional detail for the service-layer demo item."
        />
        {fieldErrors?.notes ? (
          <span className="text-xs font-medium text-rose-600">
            {fieldErrors.notes}
          </span>
        ) : null}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResultMessage state={state} />
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create demo item"}
        </Button>
      </div>
    </form>
  );
}

function ResultMessage({ state }: { state: DemoItemActionState }) {
  if (!state) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        Submissions route through a server action and demo service.
      </p>
    );
  }

  if (state.ok) {
    return (
      <p className="text-sm font-medium leading-6 text-emerald-700">
        Created demo item through the service layer.
      </p>
    );
  }

  return (
    <p className="text-sm font-medium leading-6 text-rose-700">
      {state.error.message}
    </p>
  );
}
