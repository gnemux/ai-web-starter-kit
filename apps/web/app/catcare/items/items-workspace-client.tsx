"use client";

import { useState } from "react";

import {
  CatCareBowlActionIcon,
  CatCarePlusCircleIcon
} from "../catcare-action-icons";
import {
  CatCareItemTypeIcon
} from "../catcare-item-type-icon";
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
  updateCatCareLibraryItemLocalAction
} from "../actions";
import { DeleteLibraryItemButton } from "./delete-library-item-button";
import { EditLibraryItemNotesButton } from "./edit-library-item-notes-button";
import { ItemCreateForm } from "./item-create-form";
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
    toast.showSuccess("已加入家庭用品库");
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
                ? "习惯已保存，用品库已同步"
                : "用品已保存"
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
                家庭用品是账号资产；使用猫咪来自日常习惯，不在这里强制绑定。
              </p>
            </div>
          </div>

          <div className="mt-5 hidden grid-cols-[minmax(16rem,1fr)_11rem] gap-4 border-b border-[#e2e6ee] px-4 pb-3 text-xs font-semibold text-[#526177] lg:grid">
            <span>用品信息</span>
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
                    toast.showSuccess("家庭用品已删除");
                  }}
                  onError={toast.showError}
                  onSaved={(nextItem) => {
                    setLibraryItems((items) =>
                      items.map((entry) =>
                        entry.id === nextItem.id ? nextItem : entry
                      )
                    );
                    toast.showSuccess("用品已更新");
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
    <div className="rounded-2xl border border-[#e2e6ee] bg-white px-3 py-2 shadow-sm shadow-slate-900/[0.04]">
      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
        {catCareItemTypes.map(([value, label]) => (
          <button
            className={`grid min-h-14 min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${
              activeItemType === value
                ? "bg-[#eef8f4] text-[#07847f] ring-1 ring-[#9ccfc7]"
                : "text-[#526177] hover:bg-[#f6faf8] hover:text-[#07847f]"
            }`}
            key={value}
            onClick={() => onChange(value)}
            type="button"
          >
            <CatCareItemTypeIcon className="h-9 w-9" itemType={value} />
            <span className="min-w-0 truncate">{label}</span>
            <span
              className={`inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeItemType === value
                  ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/10"
                  : "bg-transparent text-[#75839a]"
              }`}
            >
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
  onSaved,
  tags
}: {
  catId: string;
  item: CatCareLibraryItem;
  onDeleted: (id: string) => void;
  onError: (message: string) => void;
  onSaved: (item: CatCareLibraryItem) => void;
  tags: Array<{ name: string; visibleToSitter: boolean }>;
}) {
  const uniqueTags = Array.from(new Set(tags.map((tag) => tag.name)));
  const visibleToSitter = tags.length === 0 || tags.some((tag) => tag.visibleToSitter);

  return (
    <article className="grid gap-4 px-0 py-4 lg:grid-cols-[minmax(16rem,1fr)_11rem] lg:items-center lg:px-4">
      <div className="flex min-w-0 items-center gap-4">
        <CatCareItemTypeIcon className="h-10 w-10" itemType={item.itemType} />
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-[#101a32]">
            {item.name}
          </h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
            {item.brand ? `${item.brand} · ` : ""}
            {item.notes ?? "未填写备注"}
          </p>
          {uniqueTags.length > 0 || !visibleToSitter ? (
            <div className="mt-2 flex min-h-7 flex-wrap items-center gap-2">
              {uniqueTags.map((tag) => (
                <span
                  className="inline-flex min-h-6 items-center rounded-full bg-[#e6f7f2] px-2.5 text-xs font-semibold leading-none text-[#07847f]"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
              {!visibleToSitter ? (
                <span className="w-fit rounded-full bg-[#f2f4f7] px-2.5 py-1 text-xs font-semibold text-[#75839a]">
                  仅主人
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex min-w-0 flex-nowrap items-center justify-start gap-2 lg:justify-end">
        <EditLibraryItemNotesButton
          action={updateCatCareLibraryItemLocalAction}
          brand={item.brand}
          currentCatId={catId}
          itemId={item.id}
          itemName={item.name}
          notes={item.notes}
          onError={onError}
          onSaved={onSaved}
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
