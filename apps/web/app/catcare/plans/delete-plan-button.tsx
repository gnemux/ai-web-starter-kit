"use client";

import { useEffect, useState } from "react";

import { deleteCatCarePlanLocalAction } from "../actions";
import { CatCareTrashIcon, CatCareXIcon } from "../catcare-action-icons";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import { CatCareButton } from "../owner-flow-components";

export function DeletePlanButton({
  onDeleted,
  planId,
  planTitle
}: {
  onDeleted?: (planId: string) => void;
  planId: string;
  planTitle: string;
}) {
  const toast = useCatCareToast();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  async function deletePlan() {
    setDeleting(true);

    try {
      const formData = new FormData();
      formData.set("planId", planId);

      const result = await deleteCatCarePlanLocalAction(formData);

      if (!result.ok) {
        toast.showError(result.error.message);
        return;
      }

      setOpen(false);
      if (onDeleted) {
        onDeleted(planId);
      } else {
        toast.showDanger("计划已删除。");
        window.setTimeout(() => {
          // ponytail: static server card; remove locally after the local toast is visible.
          document
            .querySelector(`[data-catcare-plan-card="${planId}"]`)
            ?.remove();
        }, 3300);
      }
    } catch (error) {
      toast.showError(error instanceof Error ? error.message : "删除失败，请稍后再试。");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {onDeleted ? null : <CatCareToast message={null} toast={toast.toast} />}
      <CatCareButton
        onClick={() => setOpen(true)}
        type="button"
        variant="danger"
      >
        <CatCareTrashIcon />
        删除计划
      </CatCareButton>

      {open ? (
        <div
          aria-labelledby="catcare-delete-plan-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#101a32]/40 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#f0c9c2] bg-white p-6 shadow-2xl shadow-slate-900/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff4f2] text-[#b33a2f]">
                <CatCareTrashIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2
                  className="text-xl font-semibold leading-tight text-[#101a32]"
                  id="catcare-delete-plan-title"
                >
                  删除照护计划？
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-[#7f534e]">
                  将删除「{planTitle}」和它的清单任务。已有提交记录的计划不会被允许删除。
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CatCareButton
                fullWidth
                onClick={() => setOpen(false)}
                type="button"
                variant="ghost"
              >
                <CatCareXIcon />
                取消
              </CatCareButton>
              <DeleteSubmitButton onClick={deletePlan} pending={deleting} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DeleteSubmitButton({
  onClick,
  pending
}: {
  onClick: () => void;
  pending: boolean;
}) {
  return (
    <button
      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#f0c9c2] bg-white px-5 text-base font-semibold leading-none text-[#b33a2f] transition hover:border-[#d86255] hover:bg-[#fff4f2] disabled:cursor-wait disabled:opacity-60 [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5"
      disabled={pending}
      onClick={onClick}
      type="button"
    >
      <CatCareTrashIcon />
      {pending ? "删除中..." : "确认删除"}
    </button>
  );
}
