export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_jobs: {
        Row: {
          correlation_id: string | null
          cost: number | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          input_tokens: number | null
          model: string
          organization_id: string
          output_tokens: number | null
          prompt_hash: string
          provider: string
          result: Json | null
          result_status: string
          total_tokens: number | null
          updated_at: string
          workflow_run_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          cost?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          model: string
          organization_id: string
          output_tokens?: number | null
          prompt_hash: string
          provider: string
          result?: Json | null
          result_status?: string
          total_tokens?: number | null
          updated_at?: string
          workflow_run_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          cost?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          model?: string
          organization_id?: string
          output_tokens?: number | null
          prompt_hash?: string
          provider?: string
          result?: Json | null
          result_status?: string
          total_tokens?: number | null
          updated_at?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_jobs_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          avg_duration_ms: number | null
          client_id: string
          created_at: string
          failed_runs: number
          id: string
          organization_id: string
          snapshot_date: string
          successful_runs: number
          total_records: number
          total_runs: number
        }
        Insert: {
          avg_duration_ms?: number | null
          client_id: string
          created_at?: string
          failed_runs?: number
          id?: string
          organization_id: string
          snapshot_date: string
          successful_runs?: number
          total_records?: number
          total_runs?: number
        }
        Update: {
          avg_duration_ms?: number | null
          client_id?: string
          created_at?: string
          failed_runs?: number
          id?: string
          organization_id?: string
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
          {
            foreignKeyName: "analytics_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          after_state: Json | null
          before_state: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          organization_id: string
          request_id: string | null
          workflow_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          organization_id: string
          request_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          organization_id?: string
          request_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          client_id: string
          duration_ms: number | null
          error_message: string | null
          event_id: string | null
          feature_type: Database["public"]["Enums"]["feature_type"]
          id: string
          metadata: Json
          n8n_workflow_id: string
          organization_id: string
          ran_at: string
          records_failed: number
          records_processed: number
          status: Database["public"]["Enums"]["run_status"]
          workflow_id: string | null
          workflow_name: string
          workflow_run_id: string | null
        }
        Insert: {
          client_id: string
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string | null
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          metadata?: Json
          n8n_workflow_id: string
          organization_id: string
          ran_at?: string
          records_failed?: number
          records_processed?: number
          status?: Database["public"]["Enums"]["run_status"]
          workflow_id?: string | null
          workflow_name: string
          workflow_run_id?: string | null
        }
        Update: {
          client_id?: string
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string | null
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          metadata?: Json
          n8n_workflow_id?: string
          organization_id?: string
          ran_at?: string
          records_failed?: number
          records_processed?: number
          status?: Database["public"]["Enums"]["run_status"]
          workflow_id?: string | null
          workflow_name?: string
          workflow_run_id?: string | null
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
            foreignKeyName: "automation_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_services: {
        Row: {
          client_id: string
          created_at: string
          feature_type: Database["public"]["Enums"]["feature_type"]
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["client_service_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          feature_type: Database["public"]["Enums"]["feature_type"]
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["client_service_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["client_service_status"]
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
          {
            foreignKeyName: "client_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_preferences: {
        Row: {
          analytics: boolean
          client_id: string
          consented_at: string
          essential: boolean
          functional: boolean
          id: string
          marketing: boolean
          organization_id: string
          updated_at: string
        }
        Insert: {
          analytics?: boolean
          client_id: string
          consented_at?: string
          essential?: boolean
          functional?: boolean
          id?: string
          marketing?: boolean
          organization_id: string
          updated_at?: string
        }
        Update: {
          analytics?: boolean
          client_id?: string
          consented_at?: string
          essential?: boolean
          functional?: boolean
          id?: string
          marketing?: boolean
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cookie_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cookie_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_subscriptions: {
        Row: {
          configuration: Json
          created_at: string
          feature_key: string
          id: string
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          feature_key: string
          id?: string
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          feature_key?: string
          id?: string
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          configuration: Json
          connection_health: string
          created_at: string
          credentials_metadata: Json
          id: string
          last_sync_at: string | null
          name: string
          organization_id: string
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          connection_health?: string
          created_at?: string
          credentials_metadata?: Json
          id?: string
          last_sync_at?: string | null
          name: string
          organization_id: string
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          connection_health?: string
          created_at?: string
          credentials_metadata?: Json
          id?: string
          last_sync_at?: string | null
          name?: string
          organization_id?: string
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_consents: {
        Row: {
          client_id: string
          consented_at: string
          created_at: string
          document_key: string
          document_version: string
          id: string
          ip_address: unknown
          organization_id: string
          user_agent: string | null
        }
        Insert: {
          client_id: string
          consented_at?: string
          created_at?: string
          document_key: string
          document_version: string
          id?: string
          ip_address?: unknown
          organization_id: string
          user_agent?: string | null
        }
        Update: {
          client_id?: string
          consented_at?: string
          created_at?: string
          document_key?: string
          document_version?: string
          id?: string
          ip_address?: unknown
          organization_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content_md: string
          created_at: string
          document_key: string
          effective_at: string
          id: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          content_md: string
          created_at?: string
          document_key: string
          effective_at: string
          id?: string
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          content_md?: string
          created_at?: string
          document_key?: string
          effective_at?: string
          id?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          destination_metadata: Json
          error_message: string | null
          id: string
          notification_id: string
          organization_id: string
          provider_message_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          channel: string
          created_at?: string
          destination_metadata?: Json
          error_message?: string | null
          id?: string
          notification_id: string
          organization_id: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          destination_metadata?: Json
          error_message?: string | null
          id?: string
          notification_id?: string
          organization_id?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_deliveries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          metadata: Json
          notification_type: string
          organization_id: string
          resource_id: string | null
          resource_type: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          metadata?: Json
          notification_type: string
          organization_id: string
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          metadata?: Json
          notification_type?: string
          organization_id?: string
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_tasks: {
        Row: {
          created_at: string
          deduplication_key: string
          due_at: string
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
          resolution_note: string | null
          review_status: string
          source_revision: string
          task_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deduplication_key: string
          due_at: string
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
          resolution_note?: string | null
          review_status?: string
          source_revision: string
          task_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deduplication_key?: string
          due_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
          resolution_note?: string | null
          review_status?: string
          source_revision?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_onboarding: {
        Row: {
          answers: Json
          created_at: string
          id: string
          launched_at: string | null
          metadata: Json
          organization_id: string
          owner_metadata: Json
          owner_user_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["organization_onboarding_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          launched_at?: string | null
          metadata?: Json
          organization_id: string
          owner_metadata?: Json
          owner_user_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["organization_onboarding_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          launched_at?: string | null
          metadata?: Json
          organization_id?: string
          owner_metadata?: Json
          owner_user_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["organization_onboarding_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_onboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_onboarding_steps: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          data: Json
          id: string
          onboarding_id: string
          organization_id: string
          status: Database["public"]["Enums"]["organization_onboarding_step_status"]
          step_key: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          onboarding_id: string
          organization_id: string
          status?: Database["public"]["Enums"]["organization_onboarding_step_status"]
          step_key: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          onboarding_id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["organization_onboarding_step_status"]
          step_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_onboarding_steps_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "organization_onboarding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_onboarding_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
          vertical_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
          vertical_key?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          vertical_key?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          artifact_url: string | null
          automation_date: string | null
          created_at: string
          data: Json
          id: string
          organization_id: string
          period_end: string | null
          period_start: string | null
          report_type: string
          status: string
          updated_at: string
        }
        Insert: {
          artifact_url?: string | null
          automation_date?: string | null
          created_at?: string
          data?: Json
          id?: string
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          report_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          artifact_url?: string | null
          automation_date?: string | null
          created_at?: string
          data?: Json
          id?: string
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          report_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      run_report_outbox: {
        Row: {
          attempts: number
          created_at: string
          event_id: string
          last_error_code: string | null
          last_http_status: number | null
          lease_token: string | null
          lease_until: string | null
          next_attempt_at: string
          operation: string
          organization_id: string
          payload: Json
          report_status: string
          request_hash: string
          result: Json
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          event_id: string
          last_error_code?: string | null
          last_http_status?: number | null
          lease_token?: string | null
          lease_until?: string | null
          next_attempt_at?: string
          operation: string
          organization_id: string
          payload: Json
          report_status?: string
          request_hash: string
          result: Json
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          event_id?: string
          last_error_code?: string | null
          last_http_status?: number | null
          lease_token?: string | null
          lease_until?: string | null
          next_attempt_at?: string
          operation?: string
          organization_id?: string
          payload?: Json
          report_status?: string
          request_hash?: string
          result?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_report_outbox_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_checkpoints: {
        Row: {
          checkpoint_key: string
          organization_id: string
          source_revision: number
          updated_at: string
        }
        Insert: {
          checkpoint_key: string
          organization_id: string
          source_revision?: number
          updated_at?: string
        }
        Update: {
          checkpoint_key?: string
          organization_id?: string
          source_revision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_checkpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_run_entities: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          external_id: string | null
          id: string
          metadata: Json
          organization_id: string
          source_system: string
          vertical_key: string
          workflow_run_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          entity_id: string
          entity_type: string
          external_id?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          source_system?: string
          vertical_key?: string
          workflow_run_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          external_id?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          source_system?: string
          vertical_key?: string
          workflow_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_run_entities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_run_entities_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          correlation_id: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_id: string
          feature_key: string
          finished_at: string | null
          id: string
          organization_id: string
          outputs: Json
          records_failed: number
          records_processed: number
          retries: number
          started_at: string
          status: Database["public"]["Enums"]["run_status"]
          workflow_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_id: string
          feature_key?: string
          finished_at?: string | null
          id?: string
          organization_id: string
          outputs?: Json
          records_failed?: number
          records_processed?: number
          retries?: number
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          workflow_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string
          feature_key?: string
          finished_at?: string | null
          id?: string
          organization_id?: string
          outputs?: Json
          records_failed?: number
          records_processed?: number
          retries?: number
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          attempt: number
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          organization_id: string
          outputs: Json
          started_at: string | null
          status: string
          step_key: string
          step_name: string
          workflow_run_id: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          organization_id: string
          outputs?: Json
          started_at?: string | null
          status?: string
          step_key: string
          step_name: string
          workflow_run_id: string
        }
        Update: {
          attempt?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          organization_id?: string
          outputs?: Json
          started_at?: string | null
          status?: string
          step_key?: string
          step_name?: string
          workflow_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          feature_type: Database["public"]["Enums"]["feature_type"]
          id: string
          is_active: boolean
          n8n_workflow_id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          is_active?: boolean
          n8n_workflow_id: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          is_active?: boolean
          n8n_workflow_id?: string
          name?: string
          organization_id?: string
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
          {
            foreignKeyName: "workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_organization_onboarding: {
        Args: {
          p_onboarding_id: string
          p_owner_user_id?: string
          p_status: Database["public"]["Enums"]["organization_onboarding_status"]
        }
        Returns: {
          answers: Json
          created_at: string
          id: string
          launched_at: string | null
          metadata: Json
          organization_id: string
          owner_metadata: Json
          owner_user_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["organization_onboarding_status"]
          submitted_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "organization_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ingest_workflow_run: {
        Args: {
          p_client_id: string
          p_duration_ms: number
          p_entity_refs: Json
          p_error_message: string | null
          p_event_id: string
          p_feature_key: string
          p_finished_at: string
          p_metadata: Json
          p_n8n_workflow_id: string
          p_organization_id: string
          p_outputs: Json
          p_records_failed: number
          p_records_processed: number
          p_retries: number
          p_started_at: string
          p_status: Database["public"]["Enums"]["run_status"]
          p_steps: Json
          p_workflow_id: string
          p_workflow_name: string
        }
        Returns: string
      }
      is_organization_admin: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      provision_client_workspace: {
        Args: {
          p_company_name: string
          p_email: string
          p_feature_keys?: Json
          p_plan: string
          p_services?: Json
          p_user_id: string
          p_vertical_key?: string
        }
        Returns: {
          client_id: string
          onboarding_id: string
          organization_id: string
        }[]
      }
      seed_demo_workspace: {
        Args: { p_email?: string; p_user_id: string }
        Returns: {
          demo_client_id: string
          demo_organization_id: string
        }[]
      }
      submit_organization_onboarding: {
        Args: { p_onboarding_id: string }
        Returns: {
          answers: Json
          created_at: string
          id: string
          launched_at: string | null
          metadata: Json
          organization_id: string
          owner_metadata: Json
          owner_user_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["organization_onboarding_status"]
          submitted_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "organization_onboarding"
          isOneToOne: true
          isSetofReturn: false
        }
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
        | "workflow_automation"
        | "system_integrations"
        | "agentic_operations"
        | "notifications"
        | "business_insights"
        | "modular_industry_workflows"
        | "system_data_synchronization"
        | "custom_business_solutions"
      organization_onboarding_status:
        | "draft"
        | "in_progress"
        | "submitted"
        | "in_review"
        | "ready"
        | "launched"
        | "paused"
      organization_onboarding_step_status:
        | "not_started"
        | "in_progress"
        | "complete"
        | "blocked"
        | "skipped"
      run_status: "success" | "error" | "partial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  real_estate: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: string
          automation_revision: number
          created_at: string
          ends_at: string
          external_id: string | null
          id: string
          lead_id: string | null
          listing_id: string | null
          metadata: Json
          notes: string | null
          organization_id: string
          source_system: string
          starts_at: string
          status: string
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          automation_revision?: number
          created_at?: string
          ends_at: string
          external_id?: string | null
          id?: string
          lead_id?: string | null
          listing_id?: string | null
          metadata?: Json
          notes?: string | null
          organization_id: string
          source_system?: string
          starts_at: string
          status?: string
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          automation_revision?: number
          created_at?: string
          ends_at?: string
          external_id?: string | null
          id?: string
          lead_id?: string | null
          listing_id?: string | null
          metadata?: Json
          notes?: string | null
          organization_id?: string
          source_system?: string
          starts_at?: string
          status?: string
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_agent_external_id: string | null
          automation_revision: number
          created_at: string
          email: string | null
          external_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          lead_type: string
          metadata: Json
          organization_id: string
          phone: string | null
          source_system: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_agent_external_id?: string | null
          automation_revision?: number
          created_at?: string
          email?: string | null
          external_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_type?: string
          metadata?: Json
          organization_id: string
          phone?: string | null
          source_system?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_agent_external_id?: string | null
          automation_revision?: number
          created_at?: string
          email?: string | null
          external_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_type?: string
          metadata?: Json
          organization_id?: string
          phone?: string | null
          source_system?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          automation_revision: number
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          country_code: string | null
          created_at: string
          external_id: string | null
          id: string
          listing_type: string
          listing_url: string | null
          metadata: Json
          organization_id: string
          postal_code: string | null
          price: number | null
          property_type: string | null
          source_system: string
          state_region: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          automation_revision?: number
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          listing_type?: string
          listing_url?: string | null
          metadata?: Json
          organization_id: string
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          source_system?: string
          state_region?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          automation_revision?: number
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          listing_type?: string
          listing_url?: string | null
          metadata?: Json
          organization_id?: string
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          source_system?: string
          state_region?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
        "workflow_automation",
        "system_integrations",
        "agentic_operations",
        "notifications",
        "business_insights",
        "modular_industry_workflows",
        "system_data_synchronization",
        "custom_business_solutions",
      ],
      organization_onboarding_status: [
        "draft",
        "in_progress",
        "submitted",
        "in_review",
        "ready",
        "launched",
        "paused",
      ],
      organization_onboarding_step_status: [
        "not_started",
        "in_progress",
        "complete",
        "blocked",
        "skipped",
      ],
      run_status: ["success", "error", "partial"],
    },
  },
  real_estate: {
    Enums: {},
  },
} as const
