"use client";

import { useEffect, useState } from "react";

import {
  CatCareArrowLeftIcon,
  CatCareBowlActionIcon,
  CatCareEditIcon,
  CatCareTrashIcon,
  CatCareXIcon
} from "../../catcare-action-icons";
import { CatCareActionButton, CatCareButton } from "../../owner-flow-components";

export function CatDetailActionsClient({
  catId,
  locale
}: {
  catId: string;
  locale: "zh" | "en";
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const copy = {
    back: locale === "en" ? "Back to profiles" : "返回多猫档案",
    cancel: locale === "en" ? "Cancel" : "取消",
    confirmDelete: locale === "en" ? "Confirm delete" : "确认删除",
    deleteDescription:
      locale === "en"
        ? "This will permanently remove this cat profile and its related CatCare records."
        : "这会永久删除这只猫咪档案，并同步删除它关联的 CatCare 照护数据。",
    deleteProfile: locale === "en" ? "Delete profile" : "删除档案",
    deleteTitle: locale === "en" ? "Delete this profile?" : "删除这只猫咪档案？",
    edit: locale === "en" ? "Edit profile" : "编辑档案",
    routine: locale === "en" ? "Set routine" : "设置喂养习惯"
  };

  useEffect(() => {
    if (!deleteOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDeleteOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [deleteOpen]);

  return (
    <>
      <div className="mt-6 grid gap-3">
        <CatCareActionButton
          href="/catcare/cats"
          icon={<CatCareArrowLeftIcon />}
          variant="ghost"
        >
          {copy.back}
        </CatCareActionButton>
        <CatCareActionButton
          href={`/catcare/cats/${catId}/edit`}
          icon={<CatCareEditIcon />}
          variant="secondary"
        >
          {copy.edit}
        </CatCareActionButton>
        <CatCareActionButton
          href={`/catcare/routines?cat_id=${catId}`}
          icon={<CatCareBowlActionIcon />}
        >
          {copy.routine}
        </CatCareActionButton>
        <CatCareActionButton
          icon={<CatCareTrashIcon />}
          onClick={() => setDeleteOpen(true)}
          variant="danger"
        >
          {copy.deleteProfile}
        </CatCareActionButton>
      </div>

      {deleteOpen ? (
        <div
          aria-labelledby="catcare-delete-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#101a32]/40 p-4"
          onClick={() => setDeleteOpen(false)}
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
                  id="catcare-delete-title"
                >
                  {copy.deleteTitle}
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-[#7f534e]">
                  {copy.deleteDescription}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CatCareButton
                fullWidth
                onClick={() => setDeleteOpen(false)}
                type="button"
                variant="ghost"
              >
                <CatCareXIcon />
                {copy.cancel}
              </CatCareButton>
              <form action={`/catcare/cats/${catId}/delete`} method="post">
                <CatCareButton fullWidth type="submit" variant="danger">
                  <CatCareTrashIcon />
                  {copy.confirmDelete}
                </CatCareButton>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
