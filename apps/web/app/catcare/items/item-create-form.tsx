"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import {
  catCareItemTypes,
  type CatCareItemType
} from "../catcare-item-types";
import {
  CatCareField,
  catCareInputClass
} from "../owner-flow-components";
import { CatCareSaveIcon } from "../catcare-action-icons";
import { BrandAutocompleteInput } from "../routines/brand-autocomplete-input";
import type { CatFoodProductType } from "@/lib/catcare/cat-food-options";

const productTypeByItemType: Partial<
  Record<CatCareItemType, CatFoodProductType>
> = {
  dry_food: "dry_food",
  supplement: "supplement",
  treat: "treat",
  wet_food: "wet_food"
};

export function ItemCreateForm({
  action,
  catalogProducts,
  currentCatId,
  initialItemType = "dry_food",
  libraryItems
}: {
  action: (formData: FormData) => void | Promise<void>;
  catalogProducts: Array<{ itemType: string; displayName: string }>;
  currentCatId: string;
  initialItemType?: CatCareItemType;
  libraryItems: Array<{ itemType: string; name: string }>;
}) {
  const [itemType, setItemType] = useState<CatCareItemType>(initialItemType);
  const libraryOptions = libraryItems
    .filter((item) => item.itemType === itemType)
    .map((item) => item.name);
  const catalogOptions = catalogProducts
    .filter((item) => item.itemType === itemType)
    .map((item) => item.displayName);
  const nameOptions = [...libraryOptions, ...catalogOptions];
  const fallbackProductType =
    catalogOptions.length === 0 ? productTypeByItemType[itemType] : undefined;

  return (
    <form action={action} className="mt-5 grid gap-4">
      <input name="currentCatId" type="hidden" value={currentCatId} />
      <CatCareField label="类型">
        <input name="itemType" type="hidden" value={itemType} />
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] p-2 sm:grid-cols-3">
          {catCareItemTypes.map(([value, label]) => (
            <button
              className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition ${
                itemType === value
                  ? "bg-[#07847f] text-white shadow-sm shadow-teal-900/15"
                  : "bg-white text-[#526177] ring-1 ring-[#e2e6ee] hover:text-[#07847f]"
              }`}
              key={value}
              onClick={() => setItemType(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </CatCareField>
      <CatCareField label="名称">
        {fallbackProductType || nameOptions.length > 0 ? (
          <BrandAutocompleteInput
            defaultValue=""
            extraOptions={nameOptions}
            locale="zh"
            name="name"
            productType={fallbackProductType}
            required
          />
        ) : (
          <input
            className={catCareInputClass}
            name="name"
            placeholder="例如：豆腐猫砂、益生菌、备用饭碗"
            required
          />
        )}
        <p className="text-xs font-semibold leading-5 text-[#75839a]">
          主食罐归入「罐头/湿粮」；猫条、冻干归入「零食」。
          鱼油、益生菌、化毛膏归入「营养补充」；兽医处方或临时用药归入「药品」。
        </p>
      </CatCareField>
      <CatCareField label="存放/备注">
        <textarea
          className={`${catCareInputClass} min-h-28 py-4 leading-6`}
          name="instructions"
          placeholder="例如：放在客厅柜子第二层；开封后冷藏。具体用量和频次在喂养习惯里设置。"
        />
      </CatCareField>
      <label className="flex items-center gap-3 rounded-xl border border-[#d9e0ea] bg-[#fbfdfc] px-4 py-3 text-sm font-semibold text-[#243653]">
        <input
          className="h-5 w-5 accent-[#07847f]"
          defaultChecked
          name="visibleToSitter"
          type="checkbox"
        />
        生成照护计划时给照看者看
      </label>
      <ItemSubmitButton />
    </form>
  );
}

function ItemSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#07847f] bg-[#07847f] px-5 text-base font-semibold leading-none text-white shadow-sm shadow-teal-900/20 transition hover:bg-[#06706c] disabled:cursor-wait disabled:opacity-70 [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5"
      disabled={pending}
      type="submit"
    >
      <CatCareSaveIcon />
      {pending ? "保存中…" : "加入家庭用品库"}
    </button>
  );
}
