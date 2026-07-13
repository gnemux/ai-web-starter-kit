import type { CatCareAnalyticsProperties } from "./analytics";

const stringProperties = [
  "breed",
  "deletion_mode",
  "outcome",
  "plan_status",
  "result",
  "scenario",
  "source"
] as const;
const numberProperties = [
  "care_event_count",
  "cat_count",
  "custom_item_count",
  "enabled_item_count",
  "enabled_task_count",
  "item_count",
  "routine_count",
  "task_count"
] as const;
const booleanProperties = ["has_existing_routine", "has_photo"] as const;

export function sanitizeCatCareAnalyticsProperties(
  properties: CatCareAnalyticsProperties | Record<string, unknown>
): Record<string, string | number | boolean> {
  const values = properties as Record<string, unknown>;
  const safe: Record<string, string | number | boolean> = {};

  for (const key of stringProperties) {
    if (typeof values[key] === "string" && values[key]) {
      safe[key] = values[key];
    }
  }

  for (const key of numberProperties) {
    if (typeof values[key] === "number" && Number.isFinite(values[key])) {
      safe[key] = values[key];
    }
  }

  for (const key of booleanProperties) {
    if (typeof values[key] === "boolean") {
      safe[key] = values[key];
    }
  }

  return safe;
}
