import type { CareRoutineItemRow } from "./types";

export const CAT_SELECT =
  "id, owner_id, name, gender, birth_date, life_stage, breed, weight_kg, photo_url, safety_notes, notes, deleted_at, created_at, updated_at";
export const CAT_SUMMARY_SELECT = "id, name";
export const ROUTINE_SELECT =
  "id, owner_id, cat_id, title, source, is_default, notes, created_at, updated_at";
export const ROUTINE_ITEM_SELECT =
  "id, routine_id, category, title, frequency, time_hint, instructions, enabled, sort_order, created_at, updated_at";
export const CARE_ITEM_SELECT =
  "id, owner_id, cat_id, item_type, name, default_amount, default_frequency, instructions, visible_to_sitter, created_at, updated_at";
export const PRODUCT_CATALOG_SELECT =
  "id, item_type, brand, product_name, display_name, aliases, country_region, source, is_active, created_at, updated_at";
export const OWNER_ITEM_SELECT =
  "id, owner_id, catalog_product_id, item_type, display_name, brand, notes, created_at, updated_at";
export const CAT_ITEM_ASSIGNMENT_SELECT =
  "id, owner_id, cat_id, owner_item_id, default_amount, default_frequency, instructions, visible_to_sitter, created_at, updated_at";
export const CARE_EVENT_SELECT =
  "id, owner_id, cat_id, event_type, title, note, related_item_name, severity, occurred_on, started_on, ended_on, created_at, updated_at";
export const CARE_PLAN_CAT_SELECT =
  "id, plan_id, cat_id, cat_name_snapshot, cat_deleted_at, sort_order, created_at";
export const CATCARE_ANALYTICS_PROVIDER = "posthog";
export const MAX_ROUTINE_FREQUENCY_COUNT = 12;

export const routineItemDefinitions = [
  { category: "meal", key: "dry_food", sortOrder: 0, title: "主粮", fallbackFrequency: "daily_2", fallbackTime: "08:30,18:30", fallbackInstructions: "50g" },
  { category: "meal", key: "canned", sortOrder: 1, title: "罐头", fallbackFrequency: "weekly_3", fallbackTime: "14:00,18:30", fallbackInstructions: "半罐" },
  { category: "treat", key: "treats", sortOrder: 2, title: "零食", fallbackFrequency: "daily", fallbackTime: "18:30", fallbackInstructions: "2-3 颗" },
  { category: "water", key: "water", sortOrder: 3, title: "换水", fallbackFrequency: "daily", fallbackTime: "", fallbackInstructions: "换新鲜水，全天保持清洁" },
  { category: "litter", key: "litter", sortOrder: 4, title: "清理猫砂", fallbackFrequency: "daily", fallbackTime: "18:30", fallbackInstructions: "铲 1 次" },
  { category: "play", key: "play", sortOrder: 5, title: "陪玩", fallbackFrequency: "daily", fallbackTime: "18:30", fallbackInstructions: "15 分钟" }
] as const satisfies ReadonlyArray<{
  category: CareRoutineItemRow["category"];
  fallbackFrequency: string;
  key: string;
  sortOrder: number;
  title: string;
  fallbackTime: string;
  fallbackInstructions: string;
}>;
