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
          metadata: Json | null
          n8n_workflow_id: string
          ran_at: string
          records_failed: number
          records_processed: number
          status: "success" | "error" | "partial"
          workflow_id: string | null
          workflow_name: string
        }
        Insert: {
          client_id: string
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
          metadata?: Json | null
          n8n_workflow_id: string
          ran_at?: string
          records_failed?: number
          records_processed?: number
          status?: "success" | "error" | "partial"
          workflow_id?: string | null
          workflow_name: string
        }
        Update: {
          client_id?: string
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
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          id?: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_services: {
        Row: {
          client_id: string
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
      workflows: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          n8n_workflow_id: string
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          n8n_workflow_id: string
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
