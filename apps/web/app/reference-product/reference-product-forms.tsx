"use client";

import { useActionState } from "react";

import { Button } from "@xwlc/ui";

import type { ReferenceCat } from "@/lib/reference-product/product-service";

import {
  createReferenceCatAction,
  createReferencePlanAction,
  type ReferenceCatActionState,
  type ReferencePlanActionState
} from "./actions";

const initialCatState: ReferenceCatActionState = null;
const initialPlanState: ReferencePlanActionState = null;

type ReferenceProductLabels = {
  catForm: {
    title: string;
    description: string;
    name: string;
    namePlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    hint: string;
  };
  planForm: {
    title: string;
    description: string;
    cat: string;
    titleLabel: string;
    titlePlaceholder: string;
    startOn: string;
    endOn: string;
    handoffNotes: string;
    handoffPlaceholder: string;
    taskTitle: string;
    taskTitlePlaceholder: string;
    taskInstructions: string;
    taskInstructionsPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    hint: string;
    noCats: string;
  };
  errors: {
    general: string;
    name: string;
    notes: string;
    catId: string;
    title: string;
    endOn: string;
    handoffNotes: string;
    taskTitle: string;
    taskInstructions: string;
  };
};

export function ReferenceCatForm({
  labels
}: {
  labels: ReferenceProductLabels;
}) {
  const [state, formAction, pending] = useActionState(
    createReferenceCatAction,
    initialCatState
  );
  const fieldErrors = !state?.ok ? state?.error.fields : undefined;

  return (
    <form action={formAction} className="grid gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          {labels.catForm.title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {labels.catForm.description}
        </p>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-slate-500">
          {labels.catForm.name}
        </span>
        <input
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          maxLength={80}
          name="name"
          placeholder={labels.catForm.namePlaceholder}
          type="text"
        />
        {fieldErrors?.name ? (
          <span className="text-xs font-medium text-rose-600">
            {labels.errors.name}
          </span>
        ) : null}
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-slate-500">
          {labels.catForm.notes}
        </span>
        <textarea
          className="min-h-24 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          maxLength={2000}
          name="notes"
          placeholder={labels.catForm.notesPlaceholder}
        />
        {fieldErrors?.notes ? (
          <span className="text-xs font-medium text-rose-600">
            {labels.errors.notes}
          </span>
        ) : null}
      </label>

      <FormFooter
        generalError={labels.errors.general}
        hint={labels.catForm.hint}
        pending={pending}
        state={state}
        submit={labels.catForm.submit}
        submitting={labels.catForm.submitting}
        success={labels.catForm.success}
      />
    </form>
  );
}

export function ReferencePlanForm({
  cats,
  labels
}: {
  cats: ReferenceCat[];
  labels: ReferenceProductLabels;
}) {
  const [state, formAction, pending] = useActionState(
    createReferencePlanAction,
    initialPlanState
  );
  const fieldErrors = !state?.ok ? state?.error.fields : undefined;
  const hasCats = cats.length > 0;

  return (
    <form action={formAction} className="grid gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          {labels.planForm.title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {labels.planForm.description}
        </p>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-slate-500">
          {labels.planForm.cat}
        </span>
        <select
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50 disabled:text-slate-400"
          disabled={!hasCats}
          name="catId"
        >
          {hasCats ? (
            cats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          ) : (
            <option value="">{labels.planForm.noCats}</option>
          )}
        </select>
        {fieldErrors?.catId ? (
          <span className="text-xs font-medium text-rose-600">
            {labels.errors.catId}
          </span>
        ) : null}
      </label>

      <div className="grid gap-4 md:grid-cols-[1fr_10rem_10rem]">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.planForm.titleLabel}
          </span>
          <input
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            maxLength={120}
            name="title"
            placeholder={labels.planForm.titlePlaceholder}
            type="text"
          />
          {fieldErrors?.title ? (
            <span className="text-xs font-medium text-rose-600">
              {labels.errors.title}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.planForm.startOn}
          </span>
          <input
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            name="startOn"
            type="date"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.planForm.endOn}
          </span>
          <input
            className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            name="endOn"
            type="date"
          />
          {fieldErrors?.endOn ? (
            <span className="text-xs font-medium text-rose-600">
              {labels.errors.endOn}
            </span>
          ) : null}
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-slate-500">
          {labels.planForm.taskTitle}
        </span>
        <input
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          maxLength={120}
          name="taskTitle"
          placeholder={labels.planForm.taskTitlePlaceholder}
          type="text"
        />
        {fieldErrors?.taskTitle ? (
          <span className="text-xs font-medium text-rose-600">
            {labels.errors.taskTitle}
          </span>
        ) : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.planForm.taskInstructions}
          </span>
          <textarea
            className="min-h-24 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            maxLength={2000}
            name="taskInstructions"
            placeholder={labels.planForm.taskInstructionsPlaceholder}
          />
          {fieldErrors?.taskInstructions ? (
            <span className="text-xs font-medium text-rose-600">
              {labels.errors.taskInstructions}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.planForm.handoffNotes}
          </span>
          <textarea
            className="min-h-24 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            maxLength={2000}
            name="handoffNotes"
            placeholder={labels.planForm.handoffPlaceholder}
          />
          {fieldErrors?.handoffNotes ? (
            <span className="text-xs font-medium text-rose-600">
              {labels.errors.handoffNotes}
            </span>
          ) : null}
        </label>
      </div>

      <FormFooter
        disabled={!hasCats}
        generalError={labels.errors.general}
        hint={hasCats ? labels.planForm.hint : labels.planForm.noCats}
        pending={pending}
        state={state}
        submit={labels.planForm.submit}
        submitting={labels.planForm.submitting}
        success={labels.planForm.success}
      />
    </form>
  );
}

function FormFooter({
  disabled,
  generalError,
  hint,
  pending,
  state,
  submit,
  submitting,
  success
}: {
  disabled?: boolean;
  generalError: string;
  hint: string;
  pending: boolean;
  state: ReferenceCatActionState | ReferencePlanActionState;
  submit: string;
  submitting: string;
  success: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p
        className={
          state?.ok
            ? "text-sm font-medium leading-6 text-emerald-700"
            : state
              ? "text-sm font-medium leading-6 text-rose-700"
              : "text-sm leading-6 text-slate-500"
        }
      >
        {state?.ok ? success : state ? generalError : hint}
      </p>
      <Button disabled={pending || disabled} type="submit">
        {pending ? submitting : submit}
      </Button>
    </div>
  );
}
