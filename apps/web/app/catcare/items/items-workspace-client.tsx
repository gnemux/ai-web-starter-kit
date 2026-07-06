"use client";

import { useState } from "react";

import {
  CatCareBowlActionIcon,
  CatCarePlusCircleIcon
} from "../catcare-action-icons";
import { CatCareToast, useCatCareToast } from "../catcare-toast";
import {
  CatCareButton,
  CatCarePanel
} from "../owner-flow-components";
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

const itemTypes = [
  ["dry_food", "主粮", "Dry food"],
  ["wet_food", "罐头/湿粮", "Wet food"],
  ["treat", "零食/零食罐", "Treat"],
  ["supplement", "营养补充品", "Supplement"],
  ["medicine", "药品", "Medicine"],
  ["litter", "猫砂", "Litter"],
  ["supply", "器具/设备", "Supply"],
  ["other", "其它", "Other"]
] as const;

type ItemType = (typeof itemTypes)[number][0];

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
  initialItemType: ItemType;
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
  const toast = useCatCareToast();
  const catsById = new Map(cats.map((cat) => [cat.id, cat.name]));
  const tagsByOwnerItemId = itemTags.reduce((groups, tag) => {
    const tags = groups.get(tag.ownerItemId) ?? [];
    tags.push(catsById.get(tag.catId) ?? "未知猫咪");
    groups.set(tag.ownerItemId, tags);
    return groups;
  }, new Map<string, string[]>());

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
        <h1 className="text-3xl font-semibold text-[#101a32]">
          食物与用品
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#526177]">
          记录家庭已有的食物、猫砂、药品和护理用品。
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <CatCarePanel>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-[#101a32]">
              我家用品库
            </h2>
            <p className="text-sm font-semibold leading-6 text-[#526177]">
              家庭用品是账号资产；猫咪标签只表示谁在用它。习惯里填写的主粮、罐头、零食会自动进入这里。
            </p>
          </div>
          {libraryItems.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {libraryItems.map((item) => (
                <LibraryItemCard
                  catId={selectedCat.id}
                  item={item}
                  key={item.id}
                  onError={toast.showError}
                  onDeleted={(id) => {
                    setLibraryItems((items) => items.filter((entry) => entry.id !== id));
                    setItemTags((tags) => tags.filter((tag) => tag.ownerItemId !== id));
                    toast.showSuccess("家庭用品已删除。");
                  }}
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
                还没有家庭用品
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
                从右侧选择产品目录或输入自定义用品，保存后进入家庭库。
              </p>
            </div>
          )}

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

        <CatCarePanel>
          <h2 className="text-2xl font-semibold text-[#101a32]">
            新建家庭用品
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            保存后会进入家庭用品库；具体用量、频次和猫咪使用规则在喂养习惯或家庭库标签里维护。
          </p>
          <ItemCreateForm
            action={createItem}
            catalogProducts={catalogProducts}
            currentCatId=""
            initialItemType={initialItemType}
            key={`${initialItemType}-${formKey}`}
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

function LibraryItemCard({
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
  tags: string[];
}) {
  const typeLabel =
    itemTypes.find(([value]) => value === item.itemType)?.[1] ?? "用品";
  const uniqueTags = Array.from(new Set(tags));

  return (
    <article className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#101a32]">
            {item.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#526177]">
            {item.brand ? `${typeLabel} · ${item.brand}` : typeLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
            onError={onError}
            onDeleted={onDeleted}
          />
        </div>
      </div>
      {item.notes ? (
        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#526177]">
          {item.notes}
        </p>
      ) : null}
      <div className="mt-4 flex min-h-7 flex-wrap items-center gap-2">
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
    </article>
  );
}
