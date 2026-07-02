import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const ingestRunSchema = z.object({
  client_id: z.string().uuid(),
  workflow_name: z.string().min(1),
  n8n_workflow_id: z.string().min(1),
  status: z.string().min(1),
  ran_at: z.string().datetime().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  records_processed: z.number().int().nonnegative().optional(),
  records_failed: z.number().int().nonnegative().optional(),
  error_message: z.string().optional(),
  workflow_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

serve(async (req) => {
  // 1. Shared-secret check
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (webhookSecret) {
    const headerSecret = req.headers.get("X-Webhook-Secret");
    if (!headerSecret || headerSecret !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // 2. Parse and validate the payload
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = ingestRunSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 3. Insert with explicit column list
  const { error } = await supabase
    .from("automation_runs")
    .insert({
      client_id: parsed.data.client_id,
      workflow_name: parsed.data.workflow_name,
      n8n_workflow_id: parsed.data.n8n_workflow_id,
      status: parsed.data.status,
      ran_at: parsed.data.ran_at ?? new Date().toISOString(),
      duration_ms: parsed.data.duration_ms ?? null,
      records_processed: parsed.data.records_processed ?? 0,
      records_failed: parsed.data.records_failed ?? 0,
      error_message: parsed.data.error_message ?? null,
      workflow_id: parsed.data.workflow_id ?? null,
      metadata: parsed.data.metadata ?? null,
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});