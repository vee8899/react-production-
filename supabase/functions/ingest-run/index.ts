import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const featureTypes = [
  "workflow_automation",
  "system_integrations",
  "agentic_operations",
  "notifications",
  "business_insights",
  "modular_industry_workflows",
  "system_data_synchronization",
  "custom_business_solutions",
  "lead_follow_up",
  "listing_notifications",
  "client_communication",
  "crm_sync",
  "document_generation",
  "appointment_scheduling",
  "data_pipeline",
  "custom_workflow",
] as const;

const runStatuses = ["success", "error", "partial"] as const;
const auditActions = ["created", "updated", "synced", "status_changed", "deleted"] as const;

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const ingestRunSchema = z.object({
  event_id: z.string().min(1),
  client_id: z.string().uuid(),
  feature_type: z.enum(featureTypes),
  workflow_name: z.string().min(1),
  n8n_workflow_id: z.string().min(1).optional(),
  status: z.enum(runStatuses),
  ran_at: z.string().datetime().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  records_processed: z.number().int().nonnegative().default(0),
  records_failed: z.number().int().nonnegative().default(0),
  error_message: z.string().nullable().optional(),
  workflow_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  entity_refs: z.array(z.object({
    vertical_key: z.string().trim().min(1).max(80).optional(),
    entity_type: z.string().trim().min(1).max(120),
    entity_id: z.string().uuid(),
    action: z.enum(auditActions).default("updated"),
    source_system: z.string().trim().min(1).max(80).optional(),
    external_id: z.string().trim().min(1).max(255).optional(),
    changed_fields: z.record(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional(),
  })).max(100).default([]),
  workflow_steps: z.array(z.object({
    step_key: z.string().trim().min(1).max(120),
    step_name: z.string().trim().min(1).max(200).optional(),
    status: z.enum(["pending", "running", "success", "error", "skipped"]).default("success"),
    attempt: z.number().int().positive().default(1),
    started_at: z.string().datetime().optional(),
    finished_at: z.string().datetime().optional(),
    duration_ms: z.number().int().nonnegative().optional(),
    outputs: z.record(z.unknown()).optional(),
    error_message: z.string().nullable().optional(),
  })).max(200).default([]),
  organization_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
  }

  // This external webhook intentionally bypasses Supabase JWT verification.
  // A configured shared secret is therefore mandatory.
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("WEBHOOK_SECRET is not configured");
    return json({ error: "Webhook is not configured" }, 500);
  }

  const headerSecret = req.headers.get("X-Webhook-Secret");
  if (!headerSecret || headerSecret !== webhookSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  // Parse and validate the payload.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = ingestRunSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      {
        error: "Validation failed",
        details: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase service credentials are not configured");
    return json({ error: "Webhook is not configured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const rpcResult = await Promise.race([
    supabase.rpc("ingest_workflow_run", {
      p_event_id: parsed.data.event_id,
      p_client_id: parsed.data.client_id,
      p_organization_id: parsed.data.organization_id ?? null,
      p_feature_key: parsed.data.feature_type,
      p_workflow_name: parsed.data.workflow_name,
      p_n8n_workflow_id: parsed.data.n8n_workflow_id ?? parsed.data.workflow_name,
      p_status: parsed.data.status,
      p_workflow_id: parsed.data.workflow_id ?? null,
      p_started_at: parsed.data.ran_at ?? new Date().toISOString(),
      p_finished_at: new Date().toISOString(),
      p_duration_ms: parsed.data.duration_ms ?? null,
      p_retries: 0,
      p_records_processed: parsed.data.records_processed,
      p_records_failed: parsed.data.records_failed,
      p_error_message: parsed.data.error_message ?? null,
      p_outputs: {},
      p_steps: parsed.data.workflow_steps,
      p_entity_refs: parsed.data.entity_refs,
      p_metadata: parsed.data.metadata ?? {},
    }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Ingestion timed out")), 10_000)),
  ]).catch((error: unknown) => ({ data: null, error }));

  const { data, error } = rpcResult;

  if (error) {
    console.error("Failed to ingest automation run", error);
    return json(
      { error: error instanceof Error && error.message === "Ingestion timed out" ? "Ingestion timed out" : "Failed to ingest automation run" },
      error instanceof Error && error.message === "Ingestion timed out" ? 504 : 500,
    );
  }

  return json({ ok: true, run_id: data }, 200);
});
