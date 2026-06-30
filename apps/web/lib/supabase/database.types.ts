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
      cats: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          life_stage: "kitten" | "adult" | "senior" | "unknown" | null;
          breed: string | null;
          safety_notes: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          life_stage?: "kitten" | "adult" | "senior" | "unknown" | null;
          breed?: string | null;
          safety_notes?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          life_stage?: "kitten" | "adult" | "senior" | "unknown" | null;
          breed?: string | null;
          safety_notes?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_routines: {
        Row: {
          id: string;
          owner_id: string;
          cat_id: string;
          title: string;
          source: "manual" | "template" | "ai_assisted";
          is_default: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          cat_id: string;
          title?: string;
          source?: "manual" | "template" | "ai_assisted";
          is_default?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          cat_id?: string;
          title?: string;
          source?: "manual" | "template" | "ai_assisted";
          is_default?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_routine_items: {
        Row: {
          id: string;
          routine_id: string;
          category:
            | "meal"
            | "water"
            | "litter"
            | "medicine"
            | "treat"
            | "play"
            | "environment"
            | "other";
          title: string;
          frequency: string;
          time_hint: string | null;
          instructions: string | null;
          enabled: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          routine_id: string;
          category:
            | "meal"
            | "water"
            | "litter"
            | "medicine"
            | "treat"
            | "play"
            | "environment"
            | "other";
          title: string;
          frequency?: string;
          time_hint?: string | null;
          instructions?: string | null;
          enabled?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          routine_id?: string;
          category?:
            | "meal"
            | "water"
            | "litter"
            | "medicine"
            | "treat"
            | "play"
            | "environment"
            | "other";
          title?: string;
          frequency?: string;
          time_hint?: string | null;
          instructions?: string | null;
          enabled?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_items: {
        Row: {
          id: string;
          owner_id: string;
          cat_id: string;
          item_type:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "litter"
            | "supply"
            | "other";
          name: string;
          default_amount: string | null;
          default_frequency: string | null;
          instructions: string | null;
          visible_to_sitter: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          cat_id: string;
          item_type:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "litter"
            | "supply"
            | "other";
          name: string;
          default_amount?: string | null;
          default_frequency?: string | null;
          instructions?: string | null;
          visible_to_sitter?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          cat_id?: string;
          item_type?:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "litter"
            | "supply"
            | "other";
          name?: string;
          default_amount?: string | null;
          default_frequency?: string | null;
          instructions?: string | null;
          visible_to_sitter?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_events: {
        Row: {
          id: string;
          owner_id: string;
          cat_id: string;
          event_type:
            | "feeding"
            | "treat"
            | "health"
            | "medicine"
            | "vet"
            | "travel"
            | "behavior"
            | "environment"
            | "other";
          title: string;
          note: string | null;
          related_item_name: string | null;
          severity: "normal" | "watch" | "urgent";
          occurred_on: string | null;
          started_on: string | null;
          ended_on: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          cat_id: string;
          event_type:
            | "feeding"
            | "treat"
            | "health"
            | "medicine"
            | "vet"
            | "travel"
            | "behavior"
            | "environment"
            | "other";
          title: string;
          note?: string | null;
          related_item_name?: string | null;
          severity?: "normal" | "watch" | "urgent";
          occurred_on?: string | null;
          started_on?: string | null;
          ended_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          cat_id?: string;
          event_type?:
            | "feeding"
            | "treat"
            | "health"
            | "medicine"
            | "vet"
            | "travel"
            | "behavior"
            | "environment"
            | "other";
          title?: string;
          note?: string | null;
          related_item_name?: string | null;
          severity?: "normal" | "watch" | "urgent";
          occurred_on?: string | null;
          started_on?: string | null;
          ended_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_plans: {
        Row: {
          id: string;
          owner_id: string;
          cat_id: string;
          routine_id: string | null;
          title: string;
          status: "draft" | "published" | "reviewed" | "closed";
          scenario:
            | "business_trip"
            | "weekend_away"
            | "friend_visit"
            | "other";
          generation_source: "manual" | "template" | "ai_mock";
          ai_input_summary: Json;
          start_on: string | null;
          end_on: string | null;
          handoff_notes: string | null;
          generated_at: string | null;
          published_at: string | null;
          reviewed_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          cat_id: string;
          routine_id?: string | null;
          title: string;
          status?: "draft" | "published" | "reviewed" | "closed";
          scenario?:
            | "business_trip"
            | "weekend_away"
            | "friend_visit"
            | "other";
          generation_source?: "manual" | "template" | "ai_mock";
          ai_input_summary?: Json;
          start_on?: string | null;
          end_on?: string | null;
          handoff_notes?: string | null;
          generated_at?: string | null;
          published_at?: string | null;
          reviewed_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          cat_id?: string;
          routine_id?: string | null;
          title?: string;
          status?: "draft" | "published" | "reviewed" | "closed";
          scenario?:
            | "business_trip"
            | "weekend_away"
            | "friend_visit"
            | "other";
          generation_source?: "manual" | "template" | "ai_mock";
          ai_input_summary?: Json;
          start_on?: string | null;
          end_on?: string | null;
          handoff_notes?: string | null;
          generated_at?: string | null;
          published_at?: string | null;
          reviewed_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_tasks: {
        Row: {
          id: string;
          plan_id: string;
          category:
            | "meal"
            | "water"
            | "litter"
            | "medicine"
            | "treat"
            | "play"
            | "environment"
            | "observe"
            | "other";
          title: string;
          instructions: string | null;
          time_hint: string | null;
          frequency: string | null;
          source: "routine" | "care_item" | "event" | "owner" | "ai_suggestion";
          source_ref: string | null;
          sort_order: number;
          required: boolean;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          category?:
            | "meal"
            | "water"
            | "litter"
            | "medicine"
            | "treat"
            | "play"
            | "environment"
            | "observe"
            | "other";
          title: string;
          instructions?: string | null;
          time_hint?: string | null;
          frequency?: string | null;
          source?: "routine" | "care_item" | "event" | "owner" | "ai_suggestion";
          source_ref?: string | null;
          sort_order?: number;
          required?: boolean;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          category?:
            | "meal"
            | "water"
            | "litter"
            | "medicine"
            | "treat"
            | "play"
            | "environment"
            | "observe"
            | "other";
          title?: string;
          instructions?: string | null;
          time_hint?: string | null;
          frequency?: string | null;
          source?: "routine" | "care_item" | "event" | "owner" | "ai_suggestion";
          source_ref?: string | null;
          sort_order?: number;
          required?: boolean;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_submissions: {
        Row: {
          id: string;
          owner_id: string;
          plan_id: string;
          task_id: string | null;
          submitted_by_label: string;
          status: "completed" | "note" | "exception";
          note: string | null;
          abnormal: boolean;
          idempotency_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          plan_id: string;
          task_id?: string | null;
          submitted_by_label: string;
          status: "completed" | "note" | "exception";
          note?: string | null;
          abnormal?: boolean;
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          plan_id?: string;
          task_id?: string | null;
          submitted_by_label?: string;
          status?: "completed" | "note" | "exception";
          note?: string | null;
          abnormal?: boolean;
          idempotency_key?: string | null;
          created_at?: string;
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
