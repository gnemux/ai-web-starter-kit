"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { CatCareTrashIcon, CatCareXIcon } from "../catcare-action-icons";
import { CatCareButton } from "../owner-flow-components";
import { deleteCatCareLibraryItemAction } from "../actions";

export function DeleteLibraryItemButton({
  action,
  currentCatId,
  itemId,
  itemName,
  onDeleted,
  onError
}: {
  action?: (formData: FormData) => Promise<{
    data?: { id: string };
    error?: { message: string };
    ok: boolean;
  }>;
  currentCatId: string;
  itemId: string;
  itemName: string;
  onDeleted?: (id: string) => void;
  onError?: (message: string) => void;
}) {
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

  return (
    <>
      <button
        aria-label="删除家庭用品"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4f2] text-[#b33a2f] ring-1 ring-[#f0c9c2] transition hover:bg-[#ffe8e3] hover:text-[#982f27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d86255] [&>[data-catcare-action-icon]]:h-4 [&>[data-catcare-action-icon]]:w-4"
        onClick={() => setOpen(true)}
        title="删除家庭用品"
        type="button"
      >
        <CatCareTrashIcon />
      </button>

      {open ? (
        <div
          aria-labelledby="catcare-delete-family-item-title"
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
                  id="catcare-delete-family-item-title"
                >
                  删除家庭用品？
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-[#7f534e]">
                  将删除「{itemName}」，并移除所有猫咪标签。
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
              <form
                action={
                  action
                    ? async (formData) => {
                        const result = await action(formData);

                        if (!result.ok) {
                          onError?.(
                            result.error?.message ?? "删除失败，请稍后再试。"
                          );
                          return;
                        }

                        onDeleted?.(result.data?.id ?? itemId);
                        setOpen(false);
                      }
                    : deleteCatCareLibraryItemAction
                }
              >
                <input name="currentCatId" type="hidden" value={currentCatId} />
                <input name="id" type="hidden" value={itemId} />
                <DeleteSubmitButton />
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#f0c9c2] bg-white px-5 text-base font-semibold leading-none text-[#b33a2f] transition hover:border-[#d86255] hover:bg-[#fff4f2] disabled:cursor-wait disabled:opacity-60 [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5"
      disabled={pending}
      type="submit"
    >
      <CatCareTrashIcon />
      {pending ? "删除中…" : "确认删除"}
    </button>
  );
}
