export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_snapshots: {
        Row: {
          avg_duration_ms: number | null
          client_id: string
          organization_id: string
          created_at: string
          failed_runs: number
          id: string
          snapshot_date: string
          successful_runs: number
          total_records: number
          total_runs: number
        }
        Insert: {
          avg_duration_ms?: number | null
          client_id: string
          organization_id: string
          created_at?: string
          failed_runs?: number
          id?: string
          snapshot_date: string
          successful_runs?: number
          total_records?: number
          total_runs?: number
        }
        Update: {
          avg_duration_ms?: number | null
          client_id?: string
          organization_id?: string
          created_at?: string
          failed_runs?: number
          id?: string
          snapshot_date?: string
          successful_runs?: number
          total_records?: number
          total_runs?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          client_id: string
          organization_id: string
          event_id: string | null
          feature_type:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          duration_ms: number | null
          error_message: string | null
          id: string
          metadata: Json
          n8n_workflow_id: string
          ran_at: string
          records_failed: number
          records_processed: number
          status: "success" | "error" | "partial"
          workflow_id: string | null
          workflow_run_id: string | null
          workflow_name: string
        }
        Insert: {
          client_id: string
          organization_id: string
          event_id?: string | null
          feature_type:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json
          n8n_workflow_id: string
          ran_at?: string
          records_failed?: number
          records_processed?: number
          status?: "success" | "error" | "partial"
          workflow_id?: string | null
          workflow_run_id?: string | null
          workflow_name: string
        }
        Update: {
          client_id?: string
          organization_id?: string
          event_id?: string | null
          feature_type?:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          n8n_workflow_id?: string
          ran_at?: string
          records_failed?: number
          records_processed?: number
          status?: "success" | "error" | "partial"
          workflow_id?: string | null
          workflow_run_id?: string | null
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string
          created_at: string
          email: string
          id: string
          organization_id: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          id?: string
          organization_id: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          organization_id?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_services: {
        Row: {
          client_id: string
          organization_id: string
          created_at: string
          feature_type:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          id: string
          status: "onboarding" | "active" | "paused" | "cancelled"
          updated_at: string
        }
        Insert: {
          client_id: string
          organization_id: string
          created_at?: string
          feature_type:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          id?: string
          status?: "onboarding" | "active" | "paused" | "cancelled"
          updated_at?: string
        }
        Update: {
          client_id?: string
          organization_id?: string
          created_at?: string
          feature_type?:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          id?: string
          status?: "onboarding" | "active" | "paused" | "cancelled"
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: { id: string; name: string; slug: string; vertical_key: string; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; slug: string; vertical_key?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; slug?: string; vertical_key?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      organization_members: {
        Row: { id: string; organization_id: string; user_id: string; role: "owner" | "admin" | "member"; created_at: string }
        Insert: { id?: string; organization_id: string; user_id: string; role?: "owner" | "admin" | "member"; created_at?: string }
        Update: { id?: string; organization_id?: string; user_id?: string; role?: "owner" | "admin" | "member"; created_at?: string }
        Relationships: [{ foreignKeyName: "organization_members_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }]
      }
      integrations: {
        Row: { id: string; organization_id: string; provider: string; name: string; status: string; connection_health: string; credentials_metadata: Json; configuration: Json; last_sync_at: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; provider: string; name: string; status?: string; connection_health?: string; credentials_metadata?: Json; configuration?: Json; last_sync_at?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; provider?: string; name?: string; status?: string; connection_health?: string; credentials_metadata?: Json; configuration?: Json; last_sync_at?: string | null; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "integrations_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }]
      }
      feature_subscriptions: {
        Row: { id: string; organization_id: string; feature_key: string; status: string; configuration: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; feature_key: string; status?: string; configuration?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; feature_key?: string; status?: string; configuration?: Json; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "feature_subscriptions_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }]
      }
      organization_onboarding: {
        Row: { id: string; organization_id: string; status: Database["public"]["Enums"]["organization_onboarding_status"]; owner_user_id: string | null; owner_metadata: Json; started_at: string | null; submitted_at: string | null; launched_at: string | null; answers: Json; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; status?: Database["public"]["Enums"]["organization_onboarding_status"]; owner_user_id?: string | null; owner_metadata?: Json; started_at?: string | null; submitted_at?: string | null; launched_at?: string | null; answers?: Json; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; status?: Database["public"]["Enums"]["organization_onboarding_status"]; owner_user_id?: string | null; owner_metadata?: Json; started_at?: string | null; submitted_at?: string | null; launched_at?: string | null; answers?: Json; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "organization_onboarding_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: true; referencedRelation: "organizations"; referencedColumns: ["id"] }]
      }
      organization_onboarding_steps: {
        Row: { id: string; organization_id: string; onboarding_id: string; step_key: string; status: Database["public"]["Enums"]["organization_onboarding_step_status"]; assigned_to: string | null; completed_at: string | null; data: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; onboarding_id: string; step_key: string; status?: Database["public"]["Enums"]["organization_onboarding_step_status"]; assigned_to?: string | null; completed_at?: string | null; data?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; onboarding_id?: string; step_key?: string; status?: Database["public"]["Enums"]["organization_onboarding_step_status"]; assigned_to?: string | null; completed_at?: string | null; data?: Json; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "organization_onboarding_steps_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }, { foreignKeyName: "organization_onboarding_steps_onboarding_id_fkey"; columns: ["onboarding_id"]; isOneToOne: false; referencedRelation: "organization_onboarding"; referencedColumns: ["id"] }]
      }
      workflow_runs: {
        Row: { id: string; organization_id: string; workflow_id: string | null; event_id: string; feature_key: string; status: "success" | "error" | "partial"; started_at: string; finished_at: string | null; duration_ms: number | null; retries: number; records_processed: number; records_failed: number; outputs: Json; error_message: string | null; correlation_id: string | null; created_at: string }
        Insert: { id?: string; organization_id: string; workflow_id?: string | null; event_id: string; feature_key?: string; status?: "success" | "error" | "partial"; started_at?: string; finished_at?: string | null; duration_ms?: number | null; retries?: number; records_processed?: number; records_failed?: number; outputs?: Json; error_message?: string | null; correlation_id?: string | null; created_at?: string }
        Update: { id?: string; organization_id?: string; workflow_id?: string | null; event_id?: string; feature_key?: string; status?: "success" | "error" | "partial"; started_at?: string; finished_at?: string | null; duration_ms?: number | null; retries?: number; records_processed?: number; records_failed?: number; outputs?: Json; error_message?: string | null; correlation_id?: string | null; created_at?: string }
        Relationships: [{ foreignKeyName: "workflow_runs_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }, { foreignKeyName: "workflow_runs_workflow_id_fkey"; columns: ["workflow_id"]; isOneToOne: false; referencedRelation: "workflows"; referencedColumns: ["id"] }]
      }
      workflow_steps: {
        Row: { id: string; organization_id: string; workflow_run_id: string; step_key: string; step_name: string; status: string; attempt: number; started_at: string | null; finished_at: string | null; duration_ms: number | null; outputs: Json; error_message: string | null; created_at: string }
        Insert: { id?: string; organization_id: string; workflow_run_id: string; step_key: string; step_name: string; status?: string; attempt?: number; started_at?: string | null; finished_at?: string | null; duration_ms?: number | null; outputs?: Json; error_message?: string | null; created_at?: string }
        Update: { id?: string; organization_id?: string; workflow_run_id?: string; step_key?: string; step_name?: string; status?: string; attempt?: number; started_at?: string | null; finished_at?: string | null; duration_ms?: number | null; outputs?: Json; error_message?: string | null; created_at?: string }
        Relationships: [{ foreignKeyName: "workflow_steps_workflow_run_id_fkey"; columns: ["workflow_run_id"]; isOneToOne: false; referencedRelation: "workflow_runs"; referencedColumns: ["id"] }]
      }
      workflow_run_entities: {
        Row: { id: string; organization_id: string; workflow_run_id: string; vertical_key: string; entity_type: string; entity_id: string; action: string; source_system: string; external_id: string | null; metadata: Json; created_at: string }
        Insert: { id?: string; organization_id: string; workflow_run_id: string; vertical_key?: string; entity_type: string; entity_id: string; action?: string; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string }
        Update: { id?: string; organization_id?: string; workflow_run_id?: string; vertical_key?: string; entity_type?: string; entity_id?: string; action?: string; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string }
        Relationships: [{ foreignKeyName: "workflow_run_entities_workflow_run_id_fkey"; columns: ["workflow_run_id"]; isOneToOne: false; referencedRelation: "workflow_runs"; referencedColumns: ["id"] }]
      }
      notifications: {
        Row: { id: string; organization_id: string; notification_type: string; subject: string | null; body: string; status: string; resource_type: string | null; resource_id: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; notification_type: string; subject?: string | null; body: string; status?: string; resource_type?: string | null; resource_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; notification_type?: string; subject?: string | null; body?: string; status?: string; resource_type?: string | null; resource_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      notification_deliveries: {
        Row: { id: string; organization_id: string; notification_id: string; channel: "email" | "sms" | "webhook" | "push"; destination_metadata: Json; provider_message_id: string | null; status: string; attempts: number; sent_at: string | null; error_message: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; notification_id: string; channel: "email" | "sms" | "webhook" | "push"; destination_metadata?: Json; provider_message_id?: string | null; status?: string; attempts?: number; sent_at?: string | null; error_message?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; notification_id?: string; channel?: "email" | "sms" | "webhook" | "push"; destination_metadata?: Json; provider_message_id?: string | null; status?: string; attempts?: number; sent_at?: string | null; error_message?: string | null; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "notification_deliveries_notification_id_fkey"; columns: ["notification_id"]; isOneToOne: false; referencedRelation: "notifications"; referencedColumns: ["id"] }]
      }
      reports: {
        Row: { id: string; organization_id: string; report_type: string; period_start: string | null; period_end: string | null; status: string; artifact_url: string | null; data: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; report_type: string; period_start?: string | null; period_end?: string | null; status?: string; artifact_url?: string | null; data?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; report_type?: string; period_start?: string | null; period_end?: string | null; status?: string; artifact_url?: string | null; data?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      ai_jobs: {
        Row: { id: string; organization_id: string; workflow_run_id: string | null; provider: string; model: string; prompt_hash: string; input_tokens: number | null; output_tokens: number | null; total_tokens: number | null; duration_ms: number | null; cost: number | null; result_status: string; correlation_id: string | null; result: Json | null; error_message: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; workflow_run_id?: string | null; provider: string; model: string; prompt_hash: string; input_tokens?: number | null; output_tokens?: number | null; total_tokens?: number | null; duration_ms?: number | null; cost?: number | null; result_status?: string; correlation_id?: string | null; result?: Json | null; error_message?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; workflow_run_id?: string | null; provider?: string; model?: string; prompt_hash?: string; input_tokens?: number | null; output_tokens?: number | null; total_tokens?: number | null; duration_ms?: number | null; cost?: number | null; result_status?: string; correlation_id?: string | null; result?: Json | null; error_message?: string | null; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "ai_jobs_workflow_run_id_fkey"; columns: ["workflow_run_id"]; isOneToOne: false; referencedRelation: "workflow_runs"; referencedColumns: ["id"] }]
      }
      audit_log: {
        Row: { id: string; organization_id: string; actor_type: string; actor_id: string | null; entity_type: string; entity_id: string | null; action: string; before_state: Json | null; after_state: Json | null; request_id: string | null; workflow_id: string | null; created_at: string }
        Insert: { id?: string; organization_id: string; actor_type?: string; actor_id?: string | null; entity_type: string; entity_id?: string | null; action: string; before_state?: Json | null; after_state?: Json | null; request_id?: string | null; workflow_id?: string | null; created_at?: string }
        Update: { id?: string; organization_id?: string; actor_type?: string; actor_id?: string | null; entity_type?: string; entity_id?: string | null; action?: string; before_state?: Json | null; after_state?: Json | null; request_id?: string | null; workflow_id?: string | null; created_at?: string }
        Relationships: [{ foreignKeyName: "audit_log_workflow_id_fkey"; columns: ["workflow_id"]; isOneToOne: false; referencedRelation: "workflows"; referencedColumns: ["id"] }]
      }
      leads: {
        Row: {
          id: string
          client_id: string
          lead_type: "buyer" | "seller" | "inquiry" | "other"
          status: "new" | "contacted" | "qualified" | "nurture" | "converted" | "lost"
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          assigned_agent_external_id: string | null
          source_system: string
          external_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          lead_type?: "buyer" | "seller" | "inquiry" | "other"
          status?: "new" | "contacted" | "qualified" | "nurture" | "converted" | "lost"
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          assigned_agent_external_id?: string | null
          source_system?: string
          external_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          lead_type?: "buyer" | "seller" | "inquiry" | "other"
          status?: "new" | "contacted" | "qualified" | "nurture" | "converted" | "lost"
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          assigned_agent_external_id?: string | null
          source_system?: string
          external_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [{ foreignKeyName: "leads_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] }]
      }
      listings: {
        Row: {
          id: string
          client_id: string
          listing_type: "sale" | "rental"
          status: "draft" | "active" | "pending" | "under_contract" | "sold" | "withdrawn" | "expired"
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state_region: string | null
          postal_code: string | null
          country_code: string | null
          property_type: string | null
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          listing_url: string | null
          source_system: string
          external_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          listing_type?: "sale" | "rental"
          status?: "draft" | "active" | "pending" | "under_contract" | "sold" | "withdrawn" | "expired"
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state_region?: string | null
          postal_code?: string | null
          country_code?: string | null
          property_type?: string | null
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          listing_url?: string | null
          source_system?: string
          external_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          listing_type?: "sale" | "rental"
          status?: "draft" | "active" | "pending" | "under_contract" | "sold" | "withdrawn" | "expired"
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state_region?: string | null
          postal_code?: string | null
          country_code?: string | null
          property_type?: string | null
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          listing_url?: string | null
          source_system?: string
          external_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [{ foreignKeyName: "listings_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] }]
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          lead_id: string | null
          listing_id: string | null
          appointment_type: string
          status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
          title: string
          starts_at: string
          ends_at: string
          timezone: string
          notes: string | null
          source_system: string
          external_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          lead_id?: string | null
          listing_id?: string | null
          appointment_type?: string
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
          title: string
          starts_at: string
          ends_at: string
          timezone?: string
          notes?: string | null
          source_system?: string
          external_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          lead_id?: string | null
          listing_id?: string | null
          appointment_type?: string
          status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
          title?: string
          starts_at?: string
          ends_at?: string
          timezone?: string
          notes?: string | null
          source_system?: string
          external_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "appointments_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] },
          { foreignKeyName: "appointments_lead_id_fkey"; columns: ["lead_id"]; isOneToOne: false; referencedRelation: "leads"; referencedColumns: ["id"] },
          { foreignKeyName: "appointments_listing_id_fkey"; columns: ["listing_id"]; isOneToOne: false; referencedRelation: "listings"; referencedColumns: ["id"] },
        ]
      }
      automation_run_entities: {
        Row: { id: string; client_id: string; run_id: string; entity_type: "lead" | "listing" | "appointment"; entity_id: string; action: "created" | "updated" | "synced" | "status_changed" | "deleted"; source_system: string; external_id: string | null; metadata: Json; created_at: string }
        Insert: { id?: string; client_id: string; run_id: string; entity_type: "lead" | "listing" | "appointment"; entity_id: string; action?: "created" | "updated" | "synced" | "status_changed" | "deleted"; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string }
        Update: { id?: string; client_id?: string; run_id?: string; entity_type?: "lead" | "listing" | "appointment"; entity_id?: string; action?: "created" | "updated" | "synced" | "status_changed" | "deleted"; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string }
        Relationships: [
          { foreignKeyName: "automation_run_entities_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] },
          { foreignKeyName: "automation_run_entities_run_id_fkey"; columns: ["run_id"]; isOneToOne: false; referencedRelation: "automation_runs"; referencedColumns: ["id"] },
        ]
      }
      record_audit_log: {
        Row: { id: string; client_id: string; entity_type: "lead" | "listing" | "appointment"; entity_id: string; action: "created" | "updated" | "synced" | "status_changed" | "deleted"; source_system: string; external_id: string | null; actor_type: string; actor_id: string | null; changed_fields: Json; metadata: Json; occurred_at: string; created_at: string }
        Insert: { id?: string; client_id: string; entity_type: "lead" | "listing" | "appointment"; entity_id: string; action: "created" | "updated" | "synced" | "status_changed" | "deleted"; source_system?: string; external_id?: string | null; actor_type?: string; actor_id?: string | null; changed_fields?: Json; metadata?: Json; occurred_at?: string; created_at?: string }
        Update: { id?: string; client_id?: string; entity_type?: "lead" | "listing" | "appointment"; entity_id?: string; action?: "created" | "updated" | "synced" | "status_changed" | "deleted"; source_system?: string; external_id?: string | null; actor_type?: string; actor_id?: string | null; changed_fields?: Json; metadata?: Json; occurred_at?: string; created_at?: string }
        Relationships: [{ foreignKeyName: "record_audit_log_client_id_fkey"; columns: ["client_id"]; isOneToOne: false; referencedRelation: "clients"; referencedColumns: ["id"] }]
      }
      workflows: {
        Row: {
          client_id: string
          organization_id: string
          created_at: string
          description: string | null
          feature_type:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          id: string
          is_active: boolean
          n8n_workflow_id: string
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          organization_id: string
          created_at?: string
          description?: string | null
          feature_type?:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          id?: string
          is_active?: boolean
          n8n_workflow_id: string
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          organization_id?: string
          created_at?: string
          description?: string | null
          feature_type?:
            | "lead_follow_up"
            | "listing_notifications"
            | "client_communication"
            | "crm_sync"
            | "document_generation"
            | "appointment_scheduling"
            | "data_pipeline"
            | "custom_workflow"
          id?: string
          is_active?: boolean
          n8n_workflow_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          id: string
          document_key: string
          version: string
          title: string
          content_md: string
          effective_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_key: string
          version: string
          title: string
          content_md: string
          effective_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_key?: string
          version?: string
          title?: string
          content_md?: string
          effective_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_consents: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          document_key: string
          document_version: string
          consented_at: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          document_key: string
          document_version: string
          consented_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          document_key?: string
          document_version?: string
          consented_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_preferences: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          essential: boolean
          functional: boolean
          analytics: boolean
          marketing: boolean
          consented_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          essential?: boolean
          functional?: boolean
          analytics?: boolean
          marketing?: boolean
          consented_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          essential?: boolean
          functional?: boolean
          analytics?: boolean
          marketing?: boolean
          consented_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cookie_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cookie_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ingest_workflow_run: {
        Args: {
          p_event_id: string
          p_client_id: string
          p_organization_id: string | null
          p_feature_key: string
          p_workflow_name: string
          p_n8n_workflow_id: string
          p_status: Database["public"]["Enums"]["run_status"]
          p_workflow_id: string | null
          p_started_at: string | null
          p_finished_at: string | null
          p_duration_ms: number | null
          p_retries: number
          p_records_processed: number
          p_records_failed: number
          p_error_message: string | null
          p_outputs: Json
          p_steps: Json
          p_entity_refs: Json
          p_metadata: Json
        }
        Returns: string
      }
      provision_client_workspace: {
        Args: { p_company_name: string; p_email: string; p_plan: string; p_user_id: string; p_vertical_key?: string; p_feature_keys?: Json; p_services?: Json }
        Returns: { organization_id: string; client_id: string; onboarding_id: string }[]
      }
      submit_organization_onboarding: {
        Args: { p_onboarding_id: string }
        Returns: Database["public"]["Tables"]["organization_onboarding"]["Row"]
      }
      admin_update_organization_onboarding: {
        Args: { p_onboarding_id: string; p_status: Database["public"]["Enums"]["organization_onboarding_status"]; p_owner_user_id?: string | null }
        Returns: Database["public"]["Tables"]["organization_onboarding"]["Row"]
      }
    }
    Enums: {
      client_service_status: "onboarding" | "active" | "paused" | "cancelled"
      feature_type:
        | "lead_follow_up"
        | "listing_notifications"
        | "client_communication"
        | "crm_sync"
        | "document_generation"
        | "appointment_scheduling"
        | "data_pipeline"
        | "custom_workflow"
      run_status: "success" | "error" | "partial"
      organization_onboarding_status: "draft" | "in_progress" | "submitted" | "in_review" | "ready" | "launched" | "paused"
      organization_onboarding_step_status: "not_started" | "in_progress" | "complete" | "blocked" | "skipped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  real_estate: {
    Tables: {
      leads: {
        Row: { id: string; organization_id: string; lead_type: string; status: string; first_name: string | null; last_name: string | null; email: string | null; phone: string | null; assigned_agent_external_id: string | null; source_system: string; external_id: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; lead_type?: string; status?: string; first_name?: string | null; last_name?: string | null; email?: string | null; phone?: string | null; assigned_agent_external_id?: string | null; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; lead_type?: string; status?: string; first_name?: string | null; last_name?: string | null; email?: string | null; phone?: string | null; assigned_agent_external_id?: string | null; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      listings: {
        Row: { id: string; organization_id: string; listing_type: string; status: string; address_line1: string | null; address_line2: string | null; city: string | null; state_region: string | null; postal_code: string | null; country_code: string | null; property_type: string | null; price: number | null; bedrooms: number | null; bathrooms: number | null; listing_url: string | null; source_system: string; external_id: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; listing_type?: string; status?: string; address_line1?: string | null; address_line2?: string | null; city?: string | null; state_region?: string | null; postal_code?: string | null; country_code?: string | null; property_type?: string | null; price?: number | null; bedrooms?: number | null; bathrooms?: number | null; listing_url?: string | null; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; listing_type?: string; status?: string; address_line1?: string | null; address_line2?: string | null; city?: string | null; state_region?: string | null; postal_code?: string | null; country_code?: string | null; property_type?: string | null; price?: number | null; bedrooms?: number | null; bathrooms?: number | null; listing_url?: string | null; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      appointments: {
        Row: { id: string; organization_id: string; lead_id: string | null; listing_id: string | null; appointment_type: string; status: string; title: string; starts_at: string; ends_at: string; timezone: string; notes: string | null; source_system: string; external_id: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; lead_id?: string | null; listing_id?: string | null; appointment_type?: string; status?: string; title: string; starts_at: string; ends_at: string; timezone?: string; notes?: string | null; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; lead_id?: string | null; listing_id?: string | null; appointment_type?: string; status?: string; title?: string; starts_at?: string; ends_at?: string; timezone?: string; notes?: string | null; source_system?: string; external_id?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_service_status: ["onboarding", "active", "paused", "cancelled"],
      feature_type: [
        "lead_follow_up",
        "listing_notifications",
        "client_communication",
        "crm_sync",
        "document_generation",
        "appointment_scheduling",
        "data_pipeline",
        "custom_workflow",
      ],
      run_status: ["success", "error", "partial"],
    },
  },
} as const
