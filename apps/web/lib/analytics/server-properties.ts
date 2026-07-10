import type {
  AiAnalyticsProperties,
  PaymentAnalyticsProperties
} from "@xwlc/core";

export type ProductAnalyticsEvent =
  | "catcare_cat_created"
  | "catcare_cat_updated"
  | "catcare_cat_deleted"
  | "catcare_routine_started"
  | "catcare_routine_copied"
  | "catcare_routine_saved"
  | "catcare_plan_created"
  | "catcare_plan_tasks_updated"
  | "catcare_plan_published"
  | "catcare_plan_closed"
  | "catcare_plan_deleted"
  | "catcare_share_link_created"
  | "catcare_share_link_revoked"
  | "catcare_share_page_viewed"
  | "catcare_share_link_rejected"
  | "catcare_submission_created";

export type ProductAnalyticsProperties = {
  provider: string;
  breed?: string | null;
  care_event_count?: number;
  cat_count?: number;
  custom_item_count?: number;
  enabled_item_count?: number;
  enabled_task_count?: number;
  has_existing_routine?: boolean;
  has_photo?: boolean;
  item_count?: number;
  outcome?: "valid" | "expired" | "revoked" | "invalid" | "unavailable";
  plan_status?: string;
  result?: "success" | "created" | "updated" | "rejected";
  routine_count?: number;
  scenario?: string;
  source?: string;
  task_count?: number;
};

const stringProperties = [
  "billing_period",
  "breed",
  "capability",
  "checkout_kind",
  "checkout_session_id",
  "currency",
  "entitlement_type",
  "feature_key",
  "mode",
  "model",
  "order_status",
  "outcome",
  "payment_mode",
  "plan",
  "plan_status",
  "price_id",
  "provider",
  "provider_model_id",
  "quota_reason",
  "reason",
  "result",
  "scenario",
  "source",
  "usage_record_status"
] as const;
const numberProperties = [
  "amount_cents",
  "care_event_count",
  "cat_count",
  "consumed_credits",
  "custom_item_count",
  "enabled_item_count",
  "enabled_task_count",
  "item_count",
  "remaining_credits",
  "remaining_units",
  "requested_credits",
  "requested_units",
  "routine_count",
  "task_count"
] as const;
const booleanProperties = ["has_existing_routine", "has_photo"] as const;

export function sanitizeServerProperties(
  properties:
    | PaymentAnalyticsProperties
    | AiAnalyticsProperties
    | ProductAnalyticsProperties
    | Record<string, unknown>
): Record<string, unknown> {
  const values = properties as Record<string, unknown>;
  const safe: Record<string, unknown> = {};

  for (const key of stringProperties) {
    if (typeof values[key] === "string" && values[key]) {
      safe[key] = values[key];
    }
  }

  for (const key of numberProperties) {
    if (typeof values[key] === "number") {
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
