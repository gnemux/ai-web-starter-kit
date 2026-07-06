"use client";

import { useMemo, useState } from "react";

import { CatCareXIcon } from "../catcare-action-icons";
import { unassignCatCareItemLocalAction } from "../actions";
import type {
  CatCareCatSummary,
  CatCareItem,
  CatCareItemTag,
  CatCareLibraryItem
} from "@/lib/catcare/product-service";

const itemTypes = [
  ["dry_food", "主粮"],
  ["wet_food", "罐头/湿粮"],
  ["treat", "零食/零食罐"],
  ["supplement", "营养补充品"],
  ["medicine", "药品"],
  ["litter", "猫砂"],
  ["supply", "器具/设备"],
  ["other", "其它"]
] as const;

export function ItemUsageTabsClient({
  cats,
  initialCatId,
  itemTags,
  libraryItems,
  onError,
  onUnassigned,
  routineOwnerItemKeys,
  routineOwnerItemKeysByCatId
}: {
  cats: CatCareCatSummary[];
  initialCatId: string;
  itemTags: CatCareItemTag[];
  libraryItems: CatCareLibraryItem[];
  onError: (message: string) => void;
  onUnassigned: (id: string) => void;
  routineOwnerItemKeys: string[];
  routineOwnerItemKeysByCatId: Record<string, string[]>;
}) {
  const [selectedCatId, setSelectedCatId] = useState(initialCatId);
  const libraryById = useMemo(
    () => new Map(libraryItems.map((item) => [item.id, item])),
    [libraryItems]
  );
  const routineKeySet = useMemo(
    () =>
      new Set(routineOwnerItemKeysByCatId[selectedCatId] ?? routineOwnerItemKeys),
    [routineOwnerItemKeys, routineOwnerItemKeysByCatId, selectedCatId]
  );
  const items = itemTags
    .filter((tag) => tag.catId === selectedCatId)
    .map((tag): CatCareItem | null => {
      const libraryItem = libraryById.get(tag.ownerItemId);

      return libraryItem
        ? {
            brand: libraryItem.brand,
            catId: tag.catId,
            createdAt: libraryItem.createdAt,
            defaultAmount: tag.defaultAmount,
            defaultFrequency: tag.defaultFrequency,
            id: tag.id,
            instructions: tag.instructions,
            itemType: libraryItem.itemType,
            name: libraryItem.name,
            ownerId: libraryItem.ownerId,
            ownerItemId: libraryItem.id,
            updatedAt: libraryItem.updatedAt,
            visibleToSitter: tag.visibleToSitter
          }
        : null;
    })
    .filter((item): item is CatCareItem => Boolean(item));

  return (
    <>
      <div className="mt-7 flex flex-col gap-3 border-t border-[#e2e6ee] pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#101a32]">
              猫咪使用标签
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
              这里仅查看某只猫正在使用哪些家庭用品；移除标签不会删除家庭用品本身。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cats.map((cat) => (
              <button
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  cat.id === selectedCatId
                    ? "border-[#07847f] bg-[#07847f] text-white"
                    : "border-[#d9e0ea] bg-white text-[#526177] hover:border-[#07847f]/50 hover:text-[#07847f]"
                }`}
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                type="button"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <ItemCard
              isRoutineReferenced={routineKeySet.has(makeItemKey(item))}
              item={item}
              key={item.id}
              onError={onError}
              onUnassigned={onUnassigned}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#b8c5d8] bg-[#fbfdfc] p-6">
          <h3 className="text-lg font-semibold text-[#101a32]">
            还没有额外用品记录
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
            可以在喂养习惯里选择产品，也可以在家庭库中保留未分配用品。
          </p>
        </div>
      )}
    </>
  );
}

function ItemCard({
  isRoutineReferenced,
  item,
  onError,
  onUnassigned
}: {
  isRoutineReferenced: boolean;
  item: CatCareItem;
  onError: (message: string) => void;
  onUnassigned: (id: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const typeLabel =
    itemTypes.find(([value]) => value === item.itemType)?.[1] ?? "用品";

  return (
    <article className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#101a32]">{item.name}</h3>
          <p className="mt-1 text-sm font-semibold text-[#526177]">
            {typeLabel}
          </p>
        </div>
        {!isRoutineReferenced ? (
          <span className="rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f]">
            {item.visibleToSitter ? "照看可见" : "仅主人"}
          </span>
        ) : null}
      </div>
      <dl className="mt-4 grid gap-2 text-sm font-semibold text-[#526177]">
        {item.defaultAmount ? (
          <div className="flex justify-between gap-4">
            <dt>用量</dt>
            <dd className="text-right text-[#101a32]">{item.defaultAmount}</dd>
          </div>
        ) : null}
        {item.defaultFrequency ? (
          <div className="flex justify-between gap-4">
            <dt>频率</dt>
            <dd className="text-right text-[#101a32]">
              {formatItemFrequency(item.defaultFrequency)}
            </dd>
          </div>
        ) : null}
      </dl>
      {item.instructions ? (
        <p className="mt-3 text-sm leading-6 text-[#526177]">
          {item.instructions}
        </p>
      ) : null}
      {isRoutineReferenced ? (
        <p className="mt-4 rounded-xl bg-[#f2fbf8] px-4 py-3 text-sm font-semibold leading-6 text-[#07847f]">
          由当前喂养习惯引用；如需移除，请先在喂养习惯中更换或关闭该项。
        </p>
      ) : (
        <form
          action={async (formData) => {
            setPending(true);

            const result = await unassignCatCareItemLocalAction(formData);

            setPending(false);

            if (!result.ok) {
              onError(result.error.message);
              return;
            }

            onUnassigned(result.data.id);
          }}
          className="mt-4"
        >
          <input name="catId" type="hidden" value={item.catId} />
          <input name="id" type="hidden" value={item.id} />
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#526177] transition hover:border-[#b33a2f]/50 hover:text-[#b33a2f] disabled:opacity-60 [&>[data-catcare-action-icon]]:h-4 [&>[data-catcare-action-icon]]:w-4"
            disabled={pending}
          >
            <CatCareXIcon />
            移除当前猫标签
          </button>
        </form>
      )}
    </article>
  );
}

function makeItemKey(item: CatCareItem) {
  return `${item.itemType}:${item.name.trim().toLowerCase()}`;
}

function formatItemFrequency(value: string) {
  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value);

  if (!match) {
    return value;
  }

  const count = Number(match[2] ?? "1");
  const countText = count > 1 ? ` ${count} 次` : "";

  if (match[1] === "daily") {
    return `每日${countText}`;
  }

  if (match[1] === "every_2_days") {
    return `每两日${countText}`;
  }

  return `每周${countText}`;
}
