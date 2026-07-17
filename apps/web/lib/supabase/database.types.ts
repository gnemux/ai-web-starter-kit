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
      audit_events: {
        Row: {
          actor_type: "user" | "anonymous_token" | "system";
          correlation_id: string;
          event_data: Json;
          event_name:
            | "care_plan_published"
            | "share_link_created"
            | "share_link_revoked"
            | "share_page_viewed"
            | "invalid_or_revoked_token_rejected"
            | "care_submission_created"
            | "owner_boundary_denied"
            | "cat_profile_archived";
          id: string;
          idempotency_key: string | null;
          occurred_at: string;
          owner_id: string | null;
          resource_id: string | null;
          resource_type: "care_plan" | "cat_profile" | null;
          task_id: string | null;
          token_record_id: string | null;
        };
        Insert: {
          actor_type: "user" | "anonymous_token" | "system";
          correlation_id: string;
          event_data?: Json;
          event_name:
            | "care_plan_published"
            | "share_link_created"
            | "share_link_revoked"
            | "share_page_viewed"
            | "invalid_or_revoked_token_rejected"
            | "care_submission_created"
            | "owner_boundary_denied"
            | "cat_profile_archived";
          id?: string;
          idempotency_key?: string | null;
          occurred_at?: string;
          owner_id?: string | null;
          resource_id?: string | null;
          resource_type?: "care_plan" | "cat_profile" | null;
          task_id?: string | null;
          token_record_id?: string | null;
        };
        Update: {
          actor_type?: "user" | "anonymous_token" | "system";
          correlation_id?: string;
          event_data?: Json;
          event_name?:
            | "care_plan_published"
            | "share_link_created"
            | "share_link_revoked"
            | "share_page_viewed"
            | "invalid_or_revoked_token_rejected"
            | "care_submission_created"
            | "owner_boundary_denied"
            | "cat_profile_archived";
          id?: string;
          idempotency_key?: string | null;
          occurred_at?: string;
          owner_id?: string | null;
          resource_id?: string | null;
          resource_type?: "care_plan" | "cat_profile" | null;
          task_id?: string | null;
          token_record_id?: string | null;
        };
        Relationships: [];
      };
      outbox_events: {
        Row: {
          aggregate_id: string;
          aggregate_type: "care_plan" | "care_submission" | "share_token";
          attempt_count: number;
          correlation_id: string;
          created_at: string;
          event_type:
            | "owner_notification"
            | "share_notification"
            | "submission_notification";
          id: string;
          idempotency_key: string | null;
          next_attempt_at: string | null;
          owner_id: string | null;
          payload: Json;
          status: "pending" | "processing" | "sent" | "failed" | "dead_letter";
          updated_at: string;
        };
        Insert: {
          aggregate_id: string;
          aggregate_type: "care_plan" | "care_submission" | "share_token";
          attempt_count?: number;
          correlation_id: string;
          created_at?: string;
          event_type:
            | "owner_notification"
            | "share_notification"
            | "submission_notification";
          id?: string;
          idempotency_key?: string | null;
          next_attempt_at?: string | null;
          owner_id?: string | null;
          payload?: Json;
          status?: "pending" | "processing" | "sent" | "failed" | "dead_letter";
          updated_at?: string;
        };
        Update: {
          aggregate_id?: string;
          aggregate_type?: "care_plan" | "care_submission" | "share_token";
          attempt_count?: number;
          correlation_id?: string;
          created_at?: string;
          event_type?:
            | "owner_notification"
            | "share_notification"
            | "submission_notification";
          id?: string;
          idempotency_key?: string | null;
          next_attempt_at?: string | null;
          owner_id?: string | null;
          payload?: Json;
          status?: "pending" | "processing" | "sent" | "failed" | "dead_letter";
          updated_at?: string;
        };
        Relationships: [];
      };
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
          gender: "male" | "female" | "unknown" | null;
          birth_date: string | null;
          life_stage: "kitten" | "adult" | "senior" | "unknown" | null;
          breed: string | null;
          weight_kg: number | null;
          photo_url: string | null;
          safety_notes: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          gender?: "male" | "female" | "unknown" | null;
          birth_date?: string | null;
          life_stage?: "kitten" | "adult" | "senior" | "unknown" | null;
          breed?: string | null;
          weight_kg?: number | null;
          photo_url?: string | null;
          safety_notes?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          gender?: "male" | "female" | "unknown" | null;
          birth_date?: string | null;
          life_stage?: "kitten" | "adult" | "senior" | "unknown" | null;
          breed?: string | null;
          weight_kg?: number | null;
          photo_url?: string | null;
          safety_notes?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
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
      catcare_product_catalog: {
        Row: {
          id: string;
          item_type:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "supplement"
            | "litter"
            | "supply"
            | "other";
          brand: string | null;
          product_name: string;
          display_name: string;
          aliases: string[];
          country_region: string | null;
          source: "seed" | "manual" | "import";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_type:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "supplement"
            | "litter"
            | "supply"
            | "other";
          brand?: string | null;
          product_name: string;
          display_name: string;
          aliases?: string[];
          country_region?: string | null;
          source?: "seed" | "manual" | "import";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_type?:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "supplement"
            | "litter"
            | "supply"
            | "other";
          brand?: string | null;
          product_name?: string;
          display_name?: string;
          aliases?: string[];
          country_region?: string | null;
          source?: "seed" | "manual" | "import";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      owner_item_library: {
        Row: {
          id: string;
          owner_id: string;
          catalog_product_id: string | null;
          item_type:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "supplement"
            | "litter"
            | "supply"
            | "other";
          display_name: string;
          brand: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          catalog_product_id?: string | null;
          item_type:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "supplement"
            | "litter"
            | "supply"
            | "other";
          display_name: string;
          brand?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          catalog_product_id?: string | null;
          item_type?:
            | "dry_food"
            | "wet_food"
            | "treat"
            | "medicine"
            | "supplement"
            | "litter"
            | "supply"
            | "other";
          display_name?: string;
          brand?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cat_item_assignments: {
        Row: {
          id: string;
          owner_id: string;
          cat_id: string;
          owner_item_id: string;
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
          owner_item_id: string;
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
          owner_item_id?: string;
          default_amount?: string | null;
          default_frequency?: string | null;
          instructions?: string | null;
          visible_to_sitter?: boolean;
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
            | "supplement"
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
            | "supplement"
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
            | "supplement"
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
          cat_id: string | null;
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
          cat_id?: string | null;
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
          cat_id?: string | null;
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
      care_plan_cats: {
        Row: {
          id: string;
          plan_id: string;
          cat_id: string | null;
          cat_name_snapshot: string;
          cat_deleted_at: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          cat_id?: string | null;
          cat_name_snapshot: string;
          cat_deleted_at?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          cat_id?: string | null;
          cat_name_snapshot?: string;
          cat_deleted_at?: string | null;
          sort_order?: number;
          created_at?: string;
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
          photo_required: boolean;
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
          photo_required?: boolean;
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
          photo_required?: boolean;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      care_submission_attachments: {
        Row: {
          id: string;
          owner_id: string;
          plan_id: string;
          submission_id: string;
          task_id: string | null;
          position: number;
          object_path: string;
          content_type: "image/webp";
          byte_size: number;
          width: number;
          height: number;
          content_sha256: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          plan_id: string;
          submission_id: string;
          task_id?: string | null;
          position: number;
          object_path: string;
          content_type?: "image/webp";
          byte_size: number;
          width: number;
          height: number;
          content_sha256: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          plan_id?: string;
          submission_id?: string;
          task_id?: string | null;
          position?: number;
          object_path?: string;
          content_type?: "image/webp";
          byte_size?: number;
          width?: number;
          height?: number;
          content_sha256?: string;
          created_at?: string;
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
      share_tokens: {
        Row: {
          id: string;
          owner_id: string;
          resource_type: "care_plan";
          resource_id: string;
          token_hash: string;
          scope: "care_plan";
          expires_at: string;
          revoked_at: string | null;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          resource_type: "care_plan";
          resource_id: string;
          token_hash: string;
          scope: "care_plan";
          expires_at: string;
          revoked_at?: string | null;
          last_used_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          resource_type?: "care_plan";
          resource_id?: string;
          token_hash?: string;
          scope?: "care_plan";
          expires_at?: string;
          revoked_at?: string | null;
          last_used_at?: string | null;
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
    Functions: {
      soft_delete_cat_profile: {
        Args: { target_cat_id: string };
        Returns: Array<{
          outcome: string;
          deleted_at: string | null;
          blocking_plan_id: string | null;
          blocking_reason: string | null;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
