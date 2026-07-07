"use client";

import { useState } from "react";

import {
  CatCareBowlActionIcon,
  CatCarePlusCircleIcon
} from "../catcare-action-icons";
import { CatCareItemTypeIcon } from "../catcare-item-type-icon";
import {
  catCareItemTypes,
  getCatCareItemTypeLabel,
  type CatCareItemType
} from "../catcare-item-types";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import { CatCareButton, CatCarePanel } from "../owner-flow-components";
import {
  createCatCareItemLocalAction,
  deleteCatCareLibraryItemLocalAction,
  updateCatCareLibraryItemNotesLocalAction
} from "../actions";
import { DeleteLibraryItemButton } from "./delete-library-item-button";
import { EditLibraryItemNotesButton } from "./edit-library-item-notes-button";
import { ItemCreateForm } from "./item-create-form";
import { ItemUsageTabsClient } from "./item-usage-tabs-client";
import type {
  CatCareCatalogProduct,
  CatCareCatSummary,
  CatCareItemTag,
  CatCareLibraryItem
} from "@/lib/catcare/product-service";

export function ItemsWorkspaceClient({
  catalogProducts,
  cats,
  error,
  initialItemType,
  initialItemTags,
  initialLibraryItems,
  routineOwnerItemKeys,
  routineOwnerItemKeysByCatId,
  saved,
  selectedCat
}: {
  catalogProducts: CatCareCatalogProduct[];
  cats: CatCareCatSummary[];
  error?: string;
  initialItemType: CatCareItemType;
  initialItemTags: CatCareItemTag[];
  initialLibraryItems: CatCareLibraryItem[];
  routineOwnerItemKeys: string[];
  routineOwnerItemKeysByCatId: Record<string, string[]>;
  saved?: string;
  selectedCat: CatCareCatSummary;
}) {
  const [libraryItems, setLibraryItems] = useState(initialLibraryItems);
  const [itemTags, setItemTags] = useState(initialItemTags);
  const [formKey, setFormKey] = useState(0);
  const [activeItemType, setActiveItemType] = useState<CatCareItemType>(initialItemType);
  const toast = useCatCareToast();
  const filteredItems = libraryItems.filter(
    (item) => item.itemType === activeItemType
  );
  const itemCountsByType = libraryItems.reduce((counts, item) => {
    counts[item.itemType] = (counts[item.itemType] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const catsById = new Map(cats.map((cat) => [cat.id, cat.name]));
  const tagsByOwnerItemId = itemTags.reduce((groups, tag) => {
    const tags = groups.get(tag.ownerItemId) ?? [];
    tags.push({
      name: catsById.get(tag.catId) ?? "未知猫咪",
      visibleToSitter: tag.visibleToSitter
    });
    groups.set(tag.ownerItemId, tags);
    return groups;
  }, new Map<string, Array<{ name: string; visibleToSitter: boolean }>>());

  async function createItem(formData: FormData) {
    const result = await createCatCareItemLocalAction(formData);

    if (!result.ok) {
      toast.showError(result.error.message);
      return;
    }

    setLibraryItems((items) => [
      result.data.item,
      ...items.filter((item) => item.id !== result.data.item.id)
    ]);
    toast.showSuccess("已加入家庭用品库。");
    setFormKey((key) => key + 1);
  }

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-6">
      <CatCareToast
        message={
          error === "save_failed"
            ? "用品保存失败，请检查名称后再试。"
            : saved
              ? saved === "routine"
                ? "习惯已保存，用品库已同步。"
                : "用品已保存。"
              : null
        }
        tone={error === "save_failed" ? "error" : "success"}
        toast={toast.toast}
      />

      <div>
        <h1 className="mt-1 text-3xl font-semibold text-[#101a32]">
          食物与用品库
        </h1>
      </div>

      <ItemTypeTabs
        activeItemType={activeItemType}
        counts={itemCountsByType}
        onChange={setActiveItemType}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <CatCarePanel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#101a32]">
                {getCatCareItemTypeLabel(activeItemType)}（{filteredItems.length}）
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                家庭用品是账号资产；猫咪标签只表示谁在用它。
              </p>
            </div>
            <span className="inline-flex min-h-9 items-center rounded-full bg-[#e6f7f2] px-3 text-sm font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
              {getCatCareItemTypeLabel(activeItemType)}
            </span>
          </div>

          <div className="mt-5 hidden grid-cols-[minmax(15rem,1.8fr)_8rem_8rem_8rem_7rem] gap-4 border-b border-[#e2e6ee] px-4 pb-3 text-xs font-semibold text-[#526177] lg:grid">
            <span>用品信息</span>
            <span>类型</span>
            <span>照看者可见</span>
            <span>使用猫咪</span>
            <span className="text-right">操作</span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="divide-y divide-[#e2e6ee]">
              {filteredItems.map((item) => (
                <LibraryItemRow
                  catId={selectedCat.id}
                  item={item}
                  key={item.id}
                  onDeleted={(id) => {
                    setLibraryItems((items) =>
                      items.filter((entry) => entry.id !== id)
                    );
                    setItemTags((tags) =>
                      tags.filter((tag) => tag.ownerItemId !== id)
                    );
                    toast.showSuccess("家庭用品已删除。");
                  }}
                  onError={toast.showError}
                  onNotesSaved={(id, notes) => {
                    setLibraryItems((items) =>
                      items.map((entry) =>
                        entry.id === id ? { ...entry, notes } : entry
                      )
                    );
                    toast.showSuccess("备注已保存。");
                  }}
                  tags={tagsByOwnerItemId.get(item.id) ?? []}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#b8c5d8] bg-[#fbfdfc] p-6">
              <h3 className="text-lg font-semibold text-[#101a32]">
                还没有{getCatCareItemTypeLabel(activeItemType)}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                右侧添加后会进入家庭用品库，并按当前分类显示。
              </p>
            </div>
          )}

          <p className="mt-5 rounded-xl bg-[#fffaf0] px-4 py-3 text-sm font-semibold leading-6 text-[#8a5a00] ring-1 ring-[#f4dfb8]">
            提示：建议记录品牌、规格、用量和保质期，帮助照看者更好地照护猫咪。
          </p>
        </CatCarePanel>

        <CatCarePanel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#101a32]">
                添加用品
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                先把真实会用到的食物、药品、猫砂和器具录入家庭库。
              </p>
            </div>
            <span className="rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
              {getCatCareItemTypeLabel(activeItemType)}
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-[#d9eee7] bg-[#f2fbf8] p-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#07847f] ring-1 ring-[#bfe5d7]">
                <CatCareItemTypeIcon className="h-8 w-8" itemType={activeItemType} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#101a32]">
                  当前录入：{getCatCareItemTypeLabel(activeItemType)}
                </h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
                  填写品牌、规格或备注，照看者只会看到你设置为可见的内容。
                </p>
              </div>
            </div>
          </div>

          <ItemCreateForm
            action={createItem}
            catalogProducts={catalogProducts}
            currentCatId=""
            initialItemType={activeItemType}
            key={`${activeItemType}-${formKey}`}
            libraryItems={libraryItems}
          />
        </CatCarePanel>
      </div>

      <CatCarePanel>
        <ItemUsageTabsClient
          cats={cats}
          initialCatId={selectedCat.id}
          itemTags={itemTags}
          libraryItems={libraryItems}
          onError={toast.showError}
          onUnassigned={(id) => {
            setItemTags((tags) => tags.filter((tag) => tag.id !== id));
            toast.showSuccess("已移除当前猫标签。");
          }}
          routineOwnerItemKeys={routineOwnerItemKeys}
          routineOwnerItemKeysByCatId={routineOwnerItemKeysByCatId}
        />
      </CatCarePanel>

      <div className="grid gap-4 sm:grid-cols-2">
        <CatCareButton
          href={`/catcare/routines?cat_id=${selectedCat.id}`}
          variant="secondary"
        >
          <CatCareBowlActionIcon />
          返回喂养习惯
        </CatCareButton>
        <CatCareButton href={`/catcare/events?cat_id=${selectedCat.id}`}>
          <CatCarePlusCircleIcon />
          继续记录事件
        </CatCareButton>
      </div>
    </div>
  );
}

function ItemTypeTabs({
  activeItemType,
  counts,
  onChange
}: {
  activeItemType: CatCareItemType;
  counts: Record<string, number>;
  onChange: (itemType: CatCareItemType) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e6ee] bg-white px-3 py-3 shadow-sm shadow-slate-900/[0.04]">
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {catCareItemTypes.map(([value, label]) => (
          <button
            className={`inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
              activeItemType === value
                ? "border-[#07847f] bg-[#e6f7f2] text-[#07847f]"
                : "border-transparent bg-white text-[#526177] hover:border-[#d9e0ea]"
            }`}
            key={value}
            onClick={() => onChange(value)}
            type="button"
          >
            <CatCareItemTypeIcon itemType={value} />
            <span className="min-w-0">{label}</span>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-[#75839a]">
              {counts[value] ?? 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LibraryItemRow({
  catId,
  item,
  onDeleted,
  onError,
  onNotesSaved,
  tags
}: {
  catId: string;
  item: CatCareLibraryItem;
  onDeleted: (id: string) => void;
  onError: (message: string) => void;
  onNotesSaved: (id: string, notes: string | null) => void;
  tags: Array<{ name: string; visibleToSitter: boolean }>;
}) {
  const uniqueTags = Array.from(new Set(tags.map((tag) => tag.name)));
  const visibleToSitter = tags.length === 0 || tags.some((tag) => tag.visibleToSitter);

  return (
    <article className="grid gap-4 px-0 py-4 lg:grid-cols-[minmax(15rem,1.8fr)_8rem_8rem_8rem_7rem] lg:items-center lg:px-4">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f2fbf8] text-[#07847f] ring-1 ring-[#d9eee7]">
          <CatCareItemTypeIcon className="h-8 w-8" itemType={item.itemType} />
        </span>
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-[#101a32]">
            {item.name}
          </h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
            {item.brand ? `${item.brand} · ` : ""}
            {item.notes ?? "未填写备注"}
          </p>
        </div>
      </div>
      <span className="w-fit rounded-full bg-[#e6f7f2] px-3 py-1 text-sm font-semibold text-[#07847f]">
        {getCatCareItemTypeLabel(item.itemType)}
      </span>
      <span
        className={`inline-flex w-fit items-center gap-2 text-sm font-semibold ${
          visibleToSitter ? "text-[#07847f]" : "text-[#75839a]"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            visibleToSitter ? "bg-[#07847f]" : "bg-[#98a4b5]"
          }`}
        />
        {visibleToSitter ? "可见" : "隐藏"}
      </span>
      <div className="flex min-h-7 flex-wrap items-center gap-2">
        {uniqueTags.length > 0 ? (
          uniqueTags.map((tag) => (
            <span
              className="inline-flex min-h-6 items-center rounded-full bg-[#07847f] px-2.5 text-xs font-semibold leading-none text-white"
              key={tag}
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="inline-flex min-h-6 items-center rounded-full bg-white px-2.5 text-xs font-semibold leading-none text-[#75839a] ring-1 ring-[#d9e0ea]">
            未分配
          </span>
        )}
      </div>
      <div className="flex items-center justify-start gap-2 lg:justify-end">
        <EditLibraryItemNotesButton
          action={updateCatCareLibraryItemNotesLocalAction}
          currentCatId={catId}
          itemId={item.id}
          itemName={item.name}
          notes={item.notes}
          onError={onError}
          onSaved={onNotesSaved}
        />
        <DeleteLibraryItemButton
          action={deleteCatCareLibraryItemLocalAction}
          currentCatId={catId}
          itemId={item.id}
          itemName={item.name}
          onDeleted={onDeleted}
          onError={onError}
        />
      </div>
    </article>
  );
}
