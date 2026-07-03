import { serviceError, serviceOk, type ServiceResult } from "./api";

export const billingPlanIds = ["free", "plus", "pro"] as const;

export type BillingPlanId = (typeof billingPlanIds)[number];

const billingPlanRank: Record<BillingPlanId, number> = {
  free: 0,
  plus: 1,
  pro: 2
};

export const billingPriceIds = [
  "free",
  "plus_monthly",
  "pro_monthly",
  "ai_credit_pack_100k"
] as const;

export type BillingPriceId = (typeof billingPriceIds)[number];

export const billingFeatureKeys = [
  "projects",
  "pages",
  "leads",
  "ai_tokens",
  "custom_domain"
] as const;

export type BillingFeatureKey = (typeof billingFeatureKeys)[number];

export type BillingAllowance =
  | {
      kind: "boolean";
      enabled: boolean;
    }
  | {
      kind: "quantity";
      quantity: number;
      unit: "count" | "credit" | "token";
      used?: number;
    };

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  description: string;
  featured: boolean;
  entitlements: Record<BillingFeatureKey, BillingAllowance>;
};

export type BillingPrice = {
  id: BillingPriceId;
  planId: BillingPlanId | null;
  type: "free" | "recurring" | "one_time";
  amountCents: number;
  currency: "usd";
  interval: "month" | null;
  creditFeatureKey?: BillingFeatureKey;
  creditQuantity?: number;
  providerPriceId?: string | null;
};

export type BillingSubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "refunded";

export type BillingOrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "canceled";

export type BillingEntitlementStatus = "active" | "expired" | "revoked";

export type BillingEntitlementSource =
  | "plan"
  | "subscription"
  | "credit_pack"
  | "manual_grant"
  | "trial";

export type BillingEntitlement = {
  id: string;
  ownerId: string;
  sourceType: BillingEntitlementSource;
  sourceId: string | null;
  featureKey: BillingFeatureKey;
  allowance: BillingAllowance;
  renewsAt: string | null;
  expiresAt: string | null;
  status: BillingEntitlementStatus;
  createdAt: string;
  updatedAt: string;
};

export type BillingSubscription = {
  id: string;
  ownerId: string;
  provider: string;
  providerSubscriptionId: string | null;
  planId: BillingPlanId;
  priceId: BillingPriceId;
  status: Exclude<BillingSubscriptionStatus, "none">;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingCreditLedgerEventType =
  | "grant"
  | "consume"
  | "refund"
  | "expire"
  | "adjustment";

export type BillingCreditLedgerEntry = {
  ownerId: string;
  entitlementId: string | null;
  eventType: BillingCreditLedgerEventType;
  amount: number;
  unit: "count" | "credit" | "token";
  idempotencyKey: string;
  sourceType:
    | "subscription"
    | "credit_pack"
    | "ai_usage"
    | "admin"
    | "refund"
    | "system";
  sourceId?: string;
  reason?: string;
};

export type BillingUsageLedgerEntry = {
  ownerId: string;
  featureKey: BillingFeatureKey;
  units: number;
  unit: "count" | "credit" | "token";
  status: "reserved" | "committed" | "released" | "failed";
  idempotencyKey: string;
  relatedCreditLedgerId?: string;
};

export type BillingEntitlementSnapshot = {
  ownerId: string;
  planId: BillingPlanId;
  subscriptionStatus: BillingSubscriptionStatus;
  currentPeriodEnd: string | null;
  entitlements: Record<BillingFeatureKey, BillingAllowance>;
};

export type BillingEntitlementDecision = {
  allowed: boolean;
  featureKey: BillingFeatureKey;
  reason:
    | "allowed"
    | "not_enabled"
    | "quota_exceeded"
    | "subscription_inactive";
  remaining?: number;
};

export const defaultBillingPlans: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Starter access for validation and local demos.",
    featured: false,
    entitlements: {
      projects: { kind: "boolean", enabled: true },
      pages: { kind: "boolean", enabled: true },
      leads: { kind: "boolean", enabled: false },
      ai_tokens: { kind: "quantity", quantity: 10000, unit: "credit" },
      custom_domain: { kind: "boolean", enabled: false }
    }
  },
  {
    id: "plus",
    name: "Plus",
    description: "Intermediate plan for early product teams.",
    featured: false,
    entitlements: {
      projects: { kind: "boolean", enabled: true },
      pages: { kind: "boolean", enabled: true },
      leads: { kind: "boolean", enabled: true },
      ai_tokens: { kind: "quantity", quantity: 60000, unit: "credit" },
      custom_domain: { kind: "boolean", enabled: false }
    }
  },
  {
    id: "pro",
    name: "Pro",
    description: "Paid template plan for MVP product validation.",
    featured: true,
    entitlements: {
      projects: { kind: "boolean", enabled: true },
      pages: { kind: "boolean", enabled: true },
      leads: { kind: "boolean", enabled: true },
      ai_tokens: { kind: "quantity", quantity: 200000, unit: "credit" },
      custom_domain: { kind: "boolean", enabled: true }
    }
  }
];

export const defaultBillingPrices: BillingPrice[] = [
  {
    id: "free",
    planId: "free",
    type: "free",
    amountCents: 0,
    currency: "usd",
    interval: null,
    providerPriceId: null
  },
  {
    id: "plus_monthly",
    planId: "plus",
    type: "recurring",
    amountCents: 900,
    currency: "usd",
    interval: "month",
    providerPriceId: null
  },
  {
    id: "pro_monthly",
    planId: "pro",
    type: "recurring",
    amountCents: 900,
    currency: "usd",
    interval: "month",
    providerPriceId: null
  },
  {
    id: "ai_credit_pack_100k",
    planId: null,
    type: "one_time",
    amountCents: 500,
    currency: "usd",
    interval: null,
    creditFeatureKey: "ai_tokens",
    creditQuantity: 100000,
    providerPriceId: null
  }
];

export function getBillingPlan(planId: BillingPlanId): BillingPlan {
  return (
    defaultBillingPlans.find((plan) => plan.id === planId) ??
    defaultBillingPlans[0]
  );
}

export function compareBillingPlans(
  leftPlanId: BillingPlanId,
  rightPlanId: BillingPlanId
): number {
  return billingPlanRank[leftPlanId] - billingPlanRank[rightPlanId];
}

export function isBillingPlanUpgrade(
  currentPlanId: BillingPlanId,
  targetPlanId: BillingPlanId
): boolean {
  return compareBillingPlans(targetPlanId, currentPlanId) > 0;
}

export function getBillingPrice(
  priceId: BillingPriceId
): BillingPrice | null {
  return defaultBillingPrices.find((price) => price.id === priceId) ?? null;
}

export function createDefaultBillingSnapshot(
  ownerId: string
): BillingEntitlementSnapshot {
  const plan = getBillingPlan("free");

  return {
    ownerId,
    planId: plan.id,
    subscriptionStatus: "none",
    currentPeriodEnd: null,
    entitlements: cloneEntitlements(plan.entitlements)
  };
}

export function createBillingSnapshot(input: {
  ownerId: string;
  planId?: BillingPlanId | null;
  subscriptionStatus?: BillingSubscriptionStatus;
  currentPeriodEnd?: string | null;
  entitlements?: BillingEntitlement[];
  now?: Date;
}): BillingEntitlementSnapshot {
  const status = input.subscriptionStatus ?? "none";
  const planId =
    isPaidSubscriptionUsable(status, input.currentPeriodEnd ?? null, input.now)
      ? input.planId ?? "pro"
      : "free";
  const plan = getBillingPlan(planId);
  const entitlements = cloneEntitlements(plan.entitlements);

  for (const entitlement of input.entitlements ?? []) {
    if (!isEntitlementActive(entitlement, input.now)) {
      continue;
    }

    entitlements[entitlement.featureKey] = mergeAllowance(
      entitlements[entitlement.featureKey],
      entitlement.allowance
    );
  }

  return {
    ownerId: input.ownerId,
    planId,
    subscriptionStatus: status,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    entitlements
  };
}

export function assertBillingEntitlement(
  snapshot: BillingEntitlementSnapshot,
  featureKey: BillingFeatureKey,
  requiredQuantity = 1
): BillingEntitlementDecision {
  const allowance = snapshot.entitlements[featureKey];

  if (snapshot.subscriptionStatus === "past_due") {
    return {
      allowed: false,
      featureKey,
      reason: "subscription_inactive"
    };
  }

  if (allowance.kind === "boolean") {
    return {
      allowed: allowance.enabled,
      featureKey,
      reason: allowance.enabled ? "allowed" : "not_enabled"
    };
  }

  const used = allowance.used ?? 0;
  const remaining = Math.max(allowance.quantity - used, 0);

  return {
    allowed: remaining >= requiredQuantity,
    featureKey,
    reason: remaining >= requiredQuantity ? "allowed" : "quota_exceeded",
    remaining
  };
}

export function buildUsageLedgerEntry(input: BillingUsageLedgerEntry): ServiceResult<
  BillingUsageLedgerEntry
> {
  if (input.units <= 0) {
    return serviceError(
      "validation_error",
      "Usage units must be greater than zero.",
      { units: "Must be greater than zero." }
    );
  }

  if (!input.idempotencyKey.trim()) {
    return serviceError(
      "validation_error",
      "Usage events require an idempotency key.",
      { idempotencyKey: "Required." }
    );
  }

  return serviceOk(input);
}

export function buildCreditLedgerEntry(input: BillingCreditLedgerEntry): ServiceResult<
  BillingCreditLedgerEntry
> {
  if (input.amount === 0) {
    return serviceError(
      "validation_error",
      "Credit ledger amount cannot be zero.",
      { amount: "Must not be zero." }
    );
  }

  if (!input.idempotencyKey.trim()) {
    return serviceError(
      "validation_error",
      "Credit ledger events require an idempotency key.",
      { idempotencyKey: "Required." }
    );
  }

  return serviceOk(input);
}

export function isPaidSubscriptionUsable(
  status: BillingSubscriptionStatus,
  currentPeriodEnd: string | null,
  now = new Date()
): boolean {
  if (status === "trialing" || status === "active") {
    return true;
  }

  if (status === "canceled" && currentPeriodEnd) {
    return new Date(currentPeriodEnd).getTime() > now.getTime();
  }

  return false;
}

function isEntitlementActive(
  entitlement: BillingEntitlement,
  now = new Date()
): boolean {
  if (entitlement.status !== "active") {
    return false;
  }

  if (!entitlement.expiresAt) {
    return true;
  }

  return new Date(entitlement.expiresAt).getTime() > now.getTime();
}

function mergeAllowance(
  base: BillingAllowance,
  next: BillingAllowance
): BillingAllowance {
  if (base.kind === "boolean" || next.kind === "boolean") {
    return {
      kind: "boolean",
      enabled:
        (base.kind === "boolean" ? base.enabled : base.quantity > 0) ||
        (next.kind === "boolean" ? next.enabled : next.quantity > 0)
    };
  }

  return {
    kind: "quantity",
    quantity: base.quantity + next.quantity,
    unit: base.unit,
    used: (base.used ?? 0) + (next.used ?? 0)
  };
}

function cloneEntitlements(
  entitlements: Record<BillingFeatureKey, BillingAllowance>
): Record<BillingFeatureKey, BillingAllowance> {
  return {
    projects: { ...entitlements.projects },
    pages: { ...entitlements.pages },
    leads: { ...entitlements.leads },
    ai_tokens: { ...entitlements.ai_tokens },
    custom_domain: { ...entitlements.custom_domain }
  };
}
