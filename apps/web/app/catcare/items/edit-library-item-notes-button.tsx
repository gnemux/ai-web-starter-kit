"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  CatCareEditIcon,
  CatCareSaveIcon,
  CatCareXIcon
} from "../catcare-action-icons";
import { CatCareButton } from "../owner-flow-components";
import { updateCatCareLibraryItemAction } from "../actions";
import type { CatCareLibraryItem } from "@/lib/catcare/product-service";

export function EditLibraryItemNotesButton({
  action,
  brand,
  currentCatId,
  itemId,
  itemName,
  notes,
  onError,
  onSaved
}: {
  action?: (formData: FormData) => Promise<{
    data?: { currentCatId: string | null; item: CatCareLibraryItem };
    error?: { message: string };
    ok: boolean;
  }>;
  brand: string | null;
  currentCatId: string;
  itemId: string;
  itemName: string;
  notes: string | null;
  onError?: (message: string) => void;
  onSaved?: (item: CatCareLibraryItem) => void;
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
        aria-label={`修改用品：${itemName}`}
        className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#f2fbf8] px-3 text-sm font-semibold text-[#07847f] ring-1 ring-[#bfe5d7] transition hover:bg-[#e6f7f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#07847f] [&>[data-catcare-action-icon]]:h-4 [&>[data-catcare-action-icon]]:w-4"
        onClick={() => setOpen(true)}
        title="修改用品"
        type="button"
      >
        <CatCareEditIcon />
        修改
      </button>

      {open ? (
        <div
          aria-labelledby="catcare-edit-family-item-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#101a32]/40 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#bfe5d7] bg-white p-6 shadow-2xl shadow-slate-900/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6f7f2] text-[#07847f]">
                <CatCareEditIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2
                  className="text-xl font-semibold leading-tight text-[#101a32]"
                  id="catcare-edit-family-item-title"
                >
                  修改用品
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-[#526177]">
                  可以修改名称、品牌和备注；分类保持不变，避免影响已有照护习惯引用。
                </p>
              </div>
            </div>
            <form
              action={
                action
                  ? async (formData) => {
                      const result = await action(formData);

                      if (!result.ok) {
                        onError?.(
                          result.error?.message ?? "保存失败，请稍后再试。"
                        );
                        return;
                      }

                      if (result.data?.item) {
                        onSaved?.(result.data.item);
                      }
                      setOpen(false);
                    }
                  : updateCatCareLibraryItemAction
              }
              className="mt-6"
            >
              <input name="currentCatId" type="hidden" value={currentCatId} />
              <input name="id" type="hidden" value={itemId} />
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#526177]">名称</span>
                <input
                  className="h-12 w-full rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#16233b] outline-none transition placeholder:text-[#98a4b5] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
                  defaultValue={itemName}
                  maxLength={120}
                  name="name"
                  placeholder="例如：皇家 室内成猫粮"
                  required
                />
              </label>
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-semibold text-[#526177]">品牌</span>
                <input
                  className="h-12 w-full rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#16233b] outline-none transition placeholder:text-[#98a4b5] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
                  defaultValue={brand ?? ""}
                  maxLength={80}
                  name="brand"
                  placeholder="可选"
                />
              </label>
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-semibold text-[#526177]">备注</span>
              <textarea
                className="min-h-32 w-full rounded-xl border border-[#d9e0ea] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#16233b] outline-none transition placeholder:text-[#98a4b5] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
                defaultValue={notes ?? ""}
                maxLength={2000}
                name="notes"
                placeholder="例如：放在玄关柜第二层；开封后冷藏；照看者需要先摇匀。"
              />
              </label>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <CatCareButton
                  fullWidth
                  onClick={() => setOpen(false)}
                  type="button"
                  variant="ghost"
                >
                  <CatCareXIcon />
                  取消
                </CatCareButton>
                <SaveNotesButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SaveNotesButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#07847f] bg-[#07847f] px-5 text-base font-semibold leading-none text-white shadow-sm shadow-teal-900/20 transition hover:bg-[#06706c] disabled:cursor-wait disabled:opacity-60 [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5"
      disabled={pending}
      type="submit"
    >
      <CatCareSaveIcon />
      {pending ? "保存中…" : "保存修改"}
    </button>
  );
}
