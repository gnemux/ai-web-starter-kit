export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      billing_credit_ledger: {
        Row: {
          id: string;
          owner_id: string;
          entitlement_id: string | null;
          event_type: "grant" | "consume" | "refund" | "expire" | "adjustment";
          amount: number;
          unit: string;
          idempotency_key: string;
          source_type:
            | "subscription"
            | "credit_pack"
            | "ai_usage"
            | "admin"
            | "refund"
            | "system";
          source_id: string | null;
          reason: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          entitlement_id?: string | null;
          event_type: "grant" | "consume" | "refund" | "expire" | "adjustment";
          amount: number;
          unit: string;
          idempotency_key: string;
          source_type:
            | "subscription"
            | "credit_pack"
            | "ai_usage"
            | "admin"
            | "refund"
            | "system";
          source_id?: string | null;
          reason?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          entitlement_id?: string | null;
          event_type?: "grant" | "consume" | "refund" | "expire" | "adjustment";
          amount?: number;
          unit?: string;
          idempotency_key?: string;
          source_type?:
            | "subscription"
            | "credit_pack"
            | "ai_usage"
            | "admin"
            | "refund"
            | "system";
          source_id?: string | null;
          reason?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      billing_entitlements: {
        Row: {
          id: string;
          owner_id: string;
          source_type:
            | "plan"
            | "subscription"
            | "credit_pack"
            | "manual_grant"
            | "trial";
          source_id: string | null;
          feature_key: string;
          allowance_kind: "boolean" | "quantity";
          quantity: number | null;
          quantity_used: number;
          unit: string | null;
          renews_at: string | null;
          expires_at: string | null;
          status: "active" | "expired" | "revoked";
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          source_type:
            | "plan"
            | "subscription"
            | "credit_pack"
            | "manual_grant"
            | "trial";
          source_id?: string | null;
          feature_key: string;
          allowance_kind: "boolean" | "quantity";
          quantity?: number | null;
          quantity_used?: number;
          unit?: string | null;
          renews_at?: string | null;
          expires_at?: string | null;
          status?: "active" | "expired" | "revoked";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          source_type?:
            | "plan"
            | "subscription"
            | "credit_pack"
            | "manual_grant"
            | "trial";
          source_id?: string | null;
          feature_key?: string;
          allowance_kind?: "boolean" | "quantity";
          quantity?: number | null;
          quantity_used?: number;
          unit?: string | null;
          renews_at?: string | null;
          expires_at?: string | null;
          status?: "active" | "expired" | "revoked";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_orders: {
        Row: {
          id: string;
          owner_id: string;
          provider: string;
          provider_order_id: string | null;
          provider_checkout_session_id: string | null;
          idempotency_key: string;
          plan_id: string;
          price_id: string;
          status: "pending" | "paid" | "failed" | "refunded" | "canceled";
          currency: string;
          amount_cents: number;
          metadata: Json;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          provider?: string;
          provider_order_id?: string | null;
          provider_checkout_session_id?: string | null;
          idempotency_key: string;
          plan_id: string;
          price_id: string;
          status: "pending" | "paid" | "failed" | "refunded" | "canceled";
          currency: string;
          amount_cents: number;
          metadata?: Json;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          provider?: string;
          provider_order_id?: string | null;
          provider_checkout_session_id?: string | null;
          idempotency_key?: string;
          plan_id?: string;
          price_id?: string;
          status?: "pending" | "paid" | "failed" | "refunded" | "canceled";
          currency?: string;
          amount_cents?: number;
          metadata?: Json;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_subscriptions: {
        Row: {
          id: string;
          owner_id: string;
          provider: string;
          provider_subscription_id: string | null;
          plan_id: string;
          price_id: string;
          status:
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "expired"
            | "refunded";
          current_period_start: string | null;
          current_period_end: string | null;
          trial_ends_at: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          provider?: string;
          provider_subscription_id?: string | null;
          plan_id: string;
          price_id: string;
          status:
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "expired"
            | "refunded";
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          provider?: string;
          provider_subscription_id?: string | null;
          plan_id?: string;
          price_id?: string;
          status?:
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "expired"
            | "refunded";
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_usage_ledger: {
        Row: {
          id: string;
          owner_id: string;
          feature_key: string;
          units: number;
          unit: string;
          status: "reserved" | "committed" | "released" | "failed";
          idempotency_key: string;
          related_credit_ledger_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          feature_key: string;
          units: number;
          unit: string;
          status: "reserved" | "committed" | "released" | "failed";
          idempotency_key: string;
          related_credit_ledger_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          feature_key?: string;
          units?: number;
          unit?: string;
          status?: "reserved" | "committed" | "released" | "failed";
          idempotency_key?: string;
          related_credit_ledger_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      demo_items: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          notes: string | null;
          visibility: "private" | "public";
          status: "active" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          notes?: string | null;
          visibility?: "private" | "public";
          status?: "active" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          notes?: string | null;
          visibility?: "private" | "public";
          status?: "active" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          id: string;
          provider: string;
          event_id: string;
          event_type: string;
          status: "received" | "processed" | "ignored" | "failed";
          owner_id: string | null;
          checkout_session_id: string | null;
          price_id: string | null;
          idempotency_key: string;
          raw_payload: Json;
          error_message: string | null;
          processed_at: string | null;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          event_id: string;
          event_type: string;
          status?: "received" | "processed" | "ignored" | "failed";
          owner_id?: string | null;
          checkout_session_id?: string | null;
          price_id?: string | null;
          idempotency_key: string;
          raw_payload?: Json;
          error_message?: string | null;
          processed_at?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          event_id?: string;
          event_type?: string;
          status?: "received" | "processed" | "ignored" | "failed";
          owner_id?: string | null;
          checkout_session_id?: string | null;
          price_id?: string | null;
          idempotency_key?: string;
          raw_payload?: Json;
          error_message?: string | null;
          processed_at?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
