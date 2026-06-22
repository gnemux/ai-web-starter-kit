"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { Badge, Button } from "@starter/ui";

import { UsageIcon } from "@/components/app-icons";

import {
  runWorkspaceAiAction,
  type WorkspaceAiActionState
} from "./actions";

const initialState: WorkspaceAiActionState = null;

type AiWorkflowResultState =
  NonNullable<WorkspaceAiActionState>["result"] | null;

type AiWorkflowLabels = {
  blocked: string;
  creditOutcome: string;
  creditRequested: string;
  creditUnit: string;
  failure: string;
  gateAllowed: string;
  gateBlocked: string;
  model: string;
  modelSelectLabel: string;
  selectedModelCredit: string;
  noResult: string;
  promptLabel: string;
  promptPlaceholder: string;
  providerMode: string;
  reasons: Record<string, string>;
  result: string;
  run: string;
  running: string;
  success: string;
  usageRecord: string;
  usageRecordDeferred: string;
  usageRecordPending: string;
  usageRecordRecorded: string;
};

type AiWorkflowModelOption = {
  id: string;
  label: string;
  requestedCredits: number;
};

type AiErrorLabels = {
  general: string;
  prompt: string;
};

export function AiWorkflowForm({
  errorLabels,
  labels,
  model,
  modelOptions
}: {
  errorLabels: AiErrorLabels;
  labels: AiWorkflowLabels;
  model: string;
  modelOptions: AiWorkflowModelOption[];
}) {
  const [state, formAction, pending] = useActionState(
    runWorkspaceAiAction,
    initialState
  );
  const [selectedModelId, setSelectedModelId] = useState(
    state?.result.ok ? state.result.data.model : state?.values.model || model
  );
  const [prompt, setPrompt] = useState(state?.values.prompt ?? "");
  const selectedModel = useMemo(
    () =>
      modelOptions.find((option) => option.id === selectedModelId) ??
      modelOptions[0],
    [modelOptions, selectedModelId]
  );
  const resultState = state?.result ?? null;
  const fieldErrors =
    resultState && !resultState.ok ? resultState.error.fields : undefined;
  const promptHasBeenCorrected =
    Boolean(fieldErrors?.prompt) && prompt.trim().length >= 3;
  const visibleState = promptHasBeenCorrected ? null : resultState;

  useEffect(() => {
    if (state?.result.ok) {
      setSelectedModelId(state.result.data.model);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-5 grid gap-4 border-t border-slate-200 pt-5">
      <input name="purpose" type="hidden" value="workspace_ai_sample" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.promptLabel}
          </span>
          <textarea
            className="min-h-28 resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            maxLength={4000}
            name="prompt"
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={labels.promptPlaceholder}
            value={prompt}
          />
          {fieldErrors?.prompt && !promptHasBeenCorrected ? (
            <span className="text-xs font-medium text-rose-600">
              {errorLabels.prompt}
            </span>
          ) : null}
        </label>

        <label className="grid content-start gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {labels.modelSelectLabel}
          </span>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            name="model"
            onChange={(event) => setSelectedModelId(event.target.value)}
            value={selectedModelId}
          >
            {modelOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} · {option.requestedCredits.toLocaleString()}{" "}
                {labels.creditUnit}
              </option>
            ))}
          </select>
          {selectedModel ? (
            <p className="text-xs leading-5 text-slate-500">
              {labels.selectedModelCredit}:{" "}
              <span className="font-semibold text-slate-700">
                {selectedModel.requestedCredits.toLocaleString()}{" "}
                {labels.creditUnit}
              </span>
            </p>
          ) : null}
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResultMessage
          errorLabels={errorLabels}
          labels={labels}
          state={visibleState}
        />
        <Button
          disabled={pending}
          icon={<UsageIcon className="h-4 w-4" />}
          type="submit"
        >
          {pending ? labels.running : labels.run}
        </Button>
      </div>

      <AiResult
        labels={labels}
        modelOptions={modelOptions}
        state={visibleState}
      />
    </form>
  );
}

function ResultMessage({
  errorLabels,
  labels,
  state
}: {
  errorLabels: AiErrorLabels;
  labels: AiWorkflowLabels;
  state: AiWorkflowResultState;
}) {
  if (!state) {
    return (
      <p className="text-sm leading-6 text-slate-500">{labels.noResult}</p>
    );
  }

  if (!state.ok) {
    return (
      <p className="text-sm font-medium leading-6 text-rose-700">
        {errorLabels.general}
      </p>
    );
  }

  if (state.data.status === "blocked") {
    return (
      <p className="text-sm font-medium leading-6 text-amber-700">
        {labels.blocked}
      </p>
    );
  }

  if (state.data.status === "failed") {
    return (
      <p className="text-sm font-medium leading-6 text-rose-700">
        {labels.failure}
      </p>
    );
  }

  return (
    <p className="text-sm font-medium leading-6 text-emerald-700">
      {labels.success}
    </p>
  );
}

function AiResult({
  labels,
  modelOptions,
  state
}: {
  labels: AiWorkflowLabels;
  modelOptions: AiWorkflowModelOption[];
  state: AiWorkflowResultState;
}) {
  if (!state?.ok) {
    return null;
  }

  const result = state.data;
  const selectedModelLabel =
    modelOptions.find((option) => option.id === result.model)?.label ??
    result.model;
  const gateTone = result.gate.allowed ? "ready" : "risk";
  const statusTone =
    result.status === "succeeded"
      ? "ready"
      : result.status === "blocked"
        ? "planned"
        : "risk";

  return (
    <div className="grid gap-4 border-t border-slate-200 pt-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone}>
            {result.status === "succeeded"
              ? labels.success
              : result.status === "blocked"
                ? labels.blocked
                : labels.failure}
          </Badge>
          <Badge tone={gateTone}>
            {result.gate.allowed ? labels.gateAllowed : labels.gateBlocked}
          </Badge>
        </div>
        <p className="mt-4 text-xs font-medium uppercase text-slate-400">
          {labels.result}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
          {result.result?.text ?? labels.reasons[result.reason] ?? result.reason}
        </p>
      </div>

      <dl className="grid content-start gap-3 text-sm">
        <ResultFact label={labels.providerMode} value={result.mode} />
        <ResultFact label={labels.model} value={selectedModelLabel} />
        <ResultFact
          label={labels.creditRequested}
          value={`${result.credit.requestedCredits.toLocaleString()} ${labels.creditUnit}`}
        />
        <ResultFact
          label={labels.creditOutcome}
          value={`${result.credit.consumedCredits.toLocaleString()} ${labels.creditUnit}`}
        />
        <ResultFact
          label={labels.usageRecord}
          value={
            result.usage.recordStatus === "recorded"
              ? labels.usageRecordRecorded
              : result.usage.recordStatus === "record_deferred"
                ? labels.usageRecordDeferred
                : result.usage.recordStatus
          }
        />
      </dl>
    </div>
  );
}

function ResultFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="min-w-0 text-sm font-semibold text-slate-950 [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}
