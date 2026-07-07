export const catCareItemTypes = [
  ["dry_food", "主粮"],
  ["wet_food", "罐头/湿粮"],
  ["treat", "零食"],
  ["supplement", "营养补充"],
  ["medicine", "药品"],
  ["litter", "猫砂"],
  ["supply", "器具"],
  ["other", "其它"]
] as const;

export type CatCareItemType = (typeof catCareItemTypes)[number][0];

export function getCatCareItemTypeLabel(itemType: string) {
  return (
    catCareItemTypes.find(([value]) => value === itemType)?.[1] ?? "用品"
  );
}

export function normalizeCatCareItemType(value: string | undefined) {
  return catCareItemTypes.some(([itemType]) => itemType === value)
    ? (value as CatCareItemType)
    : "dry_food";
}
