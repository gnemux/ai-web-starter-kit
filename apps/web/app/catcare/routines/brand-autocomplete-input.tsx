"use client";

import { useMemo, useState } from "react";

import { CatCareSearchIcon } from "../catcare-action-icons";
import {
  getCatFoodProductOptions,
  type CatFoodProductType
} from "@/lib/catcare/cat-food-options";

export function BrandAutocompleteInput({
  defaultValue,
  extraOptions = [],
  locale,
  name,
  onValueChange,
  productType,
  required = false
}: {
  defaultValue: string;
  extraOptions?: readonly string[];
  locale: "zh" | "en";
  name: string;
  onValueChange?: (value: string) => void;
  productType?: CatFoodProductType;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const productOptions = productType ? getCatFoodProductOptions(productType) : [];
  const options = useMemo(
    () => Array.from(new Set([...extraOptions, ...productOptions])),
    [extraOptions, productOptions]
  );
  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    return options
      .filter((product) => !query || product.toLowerCase().includes(query))
      .slice(0, 10);
  }, [options, value]);
  const normalizedValue = value.trim().toLowerCase();
  const isCustomValue =
    normalizedValue.length > 0 &&
    !options.some((product) => product.trim().toLowerCase() === normalizedValue);

  return (
    <div>
      <div className="relative">
        <CatCareSearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#07847f]" />
        <input
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-[#d9e0ea] bg-white px-4 pl-12 text-sm font-semibold text-[#16233b] outline-none transition placeholder:text-[#98a4b5] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10"
          name={name}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setValue(nextValue);
            onValueChange?.(nextValue);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={locale === "en" ? "Search product" : "搜索或输入产品"}
          required={required}
          value={value}
        />
        {open && suggestions.length > 0 ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 grid max-h-56 overflow-auto rounded-xl border border-[#d9e0ea] bg-white p-2 shadow-xl shadow-slate-900/10">
            {suggestions.map((product) => (
              <button
                className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#243653] transition hover:bg-[#e6f7f2] hover:text-[#07847f]"
                key={product}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setValue(product);
                  onValueChange?.(product);
                  setOpen(false);
                }}
                type="button"
              >
                {product}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {isCustomValue ? (
        <p className="mt-2 text-xs font-semibold leading-5 text-[#75839a]">
          {locale === "en"
            ? "Not in the catalog. It will be saved as a custom product."
            : "未命中字典，将按自定义产品保存。"}
        </p>
      ) : null}
    </div>
  );
}
