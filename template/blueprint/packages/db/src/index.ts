export type FoundationTable = "user_profiles" | "billing_orders" | "billing_subscriptions" | "billing_entitlements" | "billing_credit_ledger" | "billing_usage_ledger" | "payment_events";
export type RlsEvidence = { table: FoundationTable; enabled: boolean; ownerRead: boolean; ownerWrite: boolean; serviceWrite: boolean };
export type SchemaEvidence = { migration: string; tables: FoundationTable[]; verifiedAt: string };
