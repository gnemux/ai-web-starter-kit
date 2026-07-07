"use client";

import { useState } from "react";

import {
  CatCareChevronDownIcon,
  CatCareClockIcon,
  CatCarePlusCircleIcon,
  CatCareTrashIcon
} from "../catcare-action-icons";
import { getCatFoodProductOptions } from "@/lib/catcare/cat-food-options";
import type { CatCareLibraryItem } from "@/lib/catcare/product-service";
import { BrandAutocompleteInput } from "./brand-autocomplete-input";
import {
  noFixedTimeValue,
  CatCareTimeInput,
  RoutineScheduleControl
} from "./routine-schedule-control";

type CustomRoutineCategory = "meal" | "treat" | "supplement" | "medicine";

export type CustomRoutineItemDraft = {
  category: CustomRoutineCategory;
  enabled: boolean;
  frequency: string;
  instructions: string;
  timeHint: string;
  title: string;
};

const customCategoryOptions = [
  { id: "meal", label: "食物", labelEn: "Food" },
  { id: "treat", label: "零食", labelEn: "Treat" },
  { id: "supplement", label: "营养补充", labelEn: "Supplement" },
  { id: "medicine", label: "用药", labelEn: "Medicine" }
] as const satisfies ReadonlyArray<{
  id: CustomRoutineCategory;
  label: string;
  labelEn: string;
}>;

export function CustomRoutineItemsClient({
  initialItems,
  libraryItems,
  locale
}: {
  initialItems: CustomRoutineItemDraft[];
  libraryItems: CatCareLibraryItem[];
  locale: "zh" | "en";
}) {
  const [items, setItems] = useState<CustomRoutineItemDraft[]>(
    initialItems.slice(0, 8).map((item) => ({
      ...item,
      instructions: stripAmountFrequencyPrefix(item.instructions)
    }))
  );
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(
    null
  );
  const copy = {
    add: locale === "en" ? "Add item" : "添加一项",
    category: locale === "en" ? "Type" : "类型",
    empty:
      locale === "en"
        ? "Add reusable treats, supplements, mixed feeding notes, or scheduled medicine."
        : "可添加多种零食、益生菌、拌罐头说明或固定频率用药。",
    instructions: locale === "en" ? "Instructions" : "说明",
    repeat: locale === "en" ? "Repeat" : "频率",
    remove: locale === "en" ? "Remove" : "删除",
    time: locale === "en" ? "Time" : "时间",
    title: locale === "en" ? "Extra food and supplements" : "额外食物、零食与补充剂",
    titleLabel: locale === "en" ? "Product / task" : "产品/任务"
  };

  function addItem() {
    if (items.length >= 8) {
      return;
    }

    setItems([
      ...items,
      {
        category: "treat",
        enabled: true,
        frequency: "daily",
        instructions: "",
        timeHint: "08:00",
        title: ""
      }
    ]);
  }

  function updateItem(
    index: number,
    field: keyof CustomRoutineItemDraft,
    value: string | boolean
  ) {
    setItems(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeItem(index: number) {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateCategory(index: number, category: CustomRoutineCategory) {
    setItems(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, category, title: "" } : item
      )
    );
  }

  return (
    <section className="rounded-2xl border border-dashed border-[#b8c1cf] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#101a32]">{copy.title}</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-[#526177]">
            {copy.empty}
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#07847f] bg-white px-4 text-sm font-semibold text-[#07847f] transition hover:bg-[#f2fbf8] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={items.length >= 8}
          onClick={addItem}
          type="button"
        >
          <CatCarePlusCircleIcon className="h-4 w-4" />
          {copy.add}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <div
              className="grid content-start gap-4 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4 shadow-sm shadow-slate-900/[0.03]"
              key={index}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="relative min-w-0">
                  <input
                    name={`custom.${index}.category`}
                    type="hidden"
                    value={item.category}
                  />
                  <button
                    className="flex h-10 max-w-40 items-center justify-between gap-2 rounded-full border border-[#d9e0ea] bg-white px-4 text-left text-sm font-semibold text-[#16233b] transition hover:border-[#07847f]/50 focus:border-[#07847f] focus:outline-none focus:ring-4 focus:ring-[#07847f]/10"
                    onClick={() =>
                      setOpenCategoryIndex(
                        openCategoryIndex === index ? null : index
                      )
                    }
                    type="button"
                  >
                    <span className="truncate">
                      {getCustomCategoryLabel(item.category, locale)}
                    </span>
                    <CatCareChevronDownIcon className="h-4 w-4 shrink-0 text-[#07847f]" />
                  </button>
                  {openCategoryIndex === index ? (
                    <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-40 rounded-xl border border-[#d9e0ea] bg-white p-1 shadow-xl shadow-slate-900/10">
                      {customCategoryOptions.map((option) => (
                        <button
                          className={`flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold transition ${
                            item.category === option.id
                              ? "bg-[#e6f7f2] text-[#07847f]"
                              : "text-[#526177] hover:bg-[#fbfdfc] hover:text-[#07847f]"
                          }`}
                          key={option.id}
                          onClick={() => {
                            updateCategory(index, option.id);
                            setOpenCategoryIndex(null);
                          }}
                          type="button"
                        >
                          {locale === "en" ? option.labelEn : option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <label className="relative inline-flex h-11 w-16 items-center">
                    <input
                      checked={item.enabled}
                      className="peer sr-only"
                      name={`custom.${index}.enabled`}
                      onChange={(event) =>
                        updateItem(index, "enabled", event.currentTarget.checked)
                      }
                      type="checkbox"
                    />
                    <span className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 rounded-full bg-[#d9e0ea] transition peer-checked:bg-[#07847f]" />
                    <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition peer-checked:translate-x-8" />
                  </label>
                  <button
                    aria-label={copy.remove}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#f0c9c2] bg-white text-[#b33a2f] transition hover:bg-[#fff4f2]"
                    onClick={() => removeItem(index)}
                    type="button"
                  >
                    <CatCareTrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold text-[#526177]">
                    {copy.titleLabel}
                  </span>
                  <BrandAutocompleteInput
                    defaultValue={item.title}
                    extraOptions={getCustomProductOptions(
                      item.category,
                      libraryItems
                    )}
                    key={item.category}
                    locale={locale}
                    name={`custom.${index}.title`}
                    onValueChange={(value) => updateItem(index, "title", value)}
                    required
                  />
                </label>
                <fieldset>
                  <RoutineScheduleControl
                    frequencyName={`custom.${index}.frequency`}
                    initialTime={item.timeHint}
                    initialValue={item.frequency}
                    locale={locale}
                    showTimes={false}
                  />
                </fieldset>
                <CustomTimeField
                  initialTime={item.timeHint}
                  locale={locale}
                  name={`custom.${index}.time`}
                />
                <label className="grid gap-2">
                  <span className="text-xs font-semibold text-[#526177]">
                    {locale === "en" ? "Amount" : "用量"}
                  </span>
                  <input
                    className="h-11 rounded-xl border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#16233b] outline-none focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
                    maxLength={2000}
                    name={`custom.${index}.instructions`}
                    onChange={(event) =>
                      updateItem(index, "instructions", event.currentTarget.value)
                    }
                    placeholder={locale === "en" ? "1 stick / half can / 2 capsules" : "1 条 / 半罐 / 2 颗"}
                    value={item.instructions}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function stripAmountFrequencyPrefix(value: string) {
  return value
    .trim()
    .replace(/^(每天|每日|天天|每周|每两日|每2日|隔日)\s*/u, "");
}

function getCustomCategoryLabel(
  category: CustomRoutineCategory,
  locale: "zh" | "en"
) {
  const option =
    customCategoryOptions.find((item) => item.id === category) ??
    customCategoryOptions[1];

  return locale === "en" ? option.labelEn : option.label;
}

function CustomTimeField({
  initialTime,
  locale,
  name
}: {
  initialTime: string;
  locale: "zh" | "en";
  name: string;
}) {
  const [noFixedTime, setNoFixedTime] = useState(
    initialTime.trim() === "" || initialTime === noFixedTimeValue
  );
  const [time, setTime] = useState(
    /^\d{2}:\d{2}$/.test(initialTime) ? initialTime : "08:00"
  );

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#526177]">
          {locale === "en" ? "Time point" : "时间点"}
        </span>
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526177]">
          <input
            checked={noFixedTime}
            className="h-4 w-4 accent-[#07847f]"
            onChange={(event) => setNoFixedTime(event.currentTarget.checked)}
            type="checkbox"
          />
          {locale === "en" ? "No fixed time" : "无固定时间"}
        </label>
      </div>
      {noFixedTime ? (
        <label className="relative block">
          <input name={name} type="hidden" value={noFixedTimeValue} />
          <CatCareClockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#07847f]" />
          <input
            className="h-11 w-full rounded-xl border border-[#d9e0ea] bg-white px-3 pl-10 text-sm font-semibold text-[#16233b] outline-none"
            readOnly
            value={locale === "en" ? "Any time" : "任意时间"}
          />
        </label>
      ) : (
        <CatCareTimeInput name={name} onChange={setTime} value={time} />
      )}
    </div>
  );
}

function getCustomProductOptions(
  category: CustomRoutineCategory,
  libraryItems: CatCareLibraryItem[]
) {
  const libraryTypes =
    category === "meal"
      ? ["dry_food", "wet_food"]
    : category === "treat"
      ? ["treat"]
      : category === "supplement"
        ? ["supplement"]
        : category === "medicine"
          ? ["medicine"]
          : [];
  const catalogOptions =
    category === "meal"
      ? [
          ...getCatFoodProductOptions("dry_food"),
          ...getCatFoodProductOptions("wet_food")
        ]
      : category === "treat"
        ? getCatFoodProductOptions("treat")
        : category === "supplement" || category === "medicine"
          ? getCatFoodProductOptions("supplement")
          : [];

  return Array.from(
    new Set([
      ...libraryItems
        .filter((item) => libraryTypes.includes(item.itemType))
        .map((item) => item.name),
      ...catalogOptions
    ])
  );
}
