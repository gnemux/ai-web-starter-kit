import "server-only";

import type { SafeCapabilityContext } from "@xwlc/platform";

import { trackServerEvent } from "../analytics/server";
import { sanitizeCatCareAnalyticsProperties } from "./analytics-properties";

export type CatCareAnalyticsEvent =
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

export type CatCareAnalyticsProperties = {
  breed?: string | null;
  care_event_count?: number;
  cat_count?: number;
  custom_item_count?: number;
  deletion_mode?: "soft";
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

export async function trackCatCareAnalyticsEvent({
  distinctId,
  event,
  metadata,
  properties,
  provider
}: {
  distinctId: string;
  event: CatCareAnalyticsEvent;
  metadata?: SafeCapabilityContext;
  properties: CatCareAnalyticsProperties;
  provider: string;
}) {
  await trackServerEvent({
    distinctId,
    event,
    metadata,
    module: "catcare",
    properties: {
      provider,
      ...sanitizeCatCareAnalyticsProperties(properties)
    }
  });
}
