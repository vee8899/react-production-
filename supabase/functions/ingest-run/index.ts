import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const featureTypes = [
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

  // Insert with an explicit column list.
  const { error } = await supabase
    .from("automation_runs")
    .upsert({
      event_id: parsed.data.event_id,
      client_id: parsed.data.client_id,
      feature_type: parsed.data.feature_type,
      workflow_name: parsed.data.workflow_name,
      n8n_workflow_id: parsed.data.n8n_workflow_id ?? parsed.data.workflow_name,
      status: parsed.data.status,
      ran_at: parsed.data.ran_at ?? new Date().toISOString(),
      duration_ms: parsed.data.duration_ms ?? null,
      records_processed: parsed.data.records_processed,
      records_failed: parsed.data.records_failed,
      error_message: parsed.data.error_message ?? null,
      workflow_id: parsed.data.workflow_id ?? null,
      metadata: parsed.data.metadata ?? null,
    }, {
      onConflict: "event_id",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("Failed to ingest automation run", error);
    return json({ error: "Failed to ingest automation run" }, 500);
  }

  return json({ ok: true }, 200);
});
