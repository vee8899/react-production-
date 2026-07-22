import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const json = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const schema = z.object({
  organization_id: z.string().uuid(),
  integration_id: z.string().uuid(),
  event_type: z.string().trim().min(1).max(80).default("workflow_failure"),
  enabled: z.boolean().default(true),
  fallback_integration_id: z.string().uuid().nullable().optional(),
  n8n_credential_reference: z.string().trim().min(1).max(160).optional(),
});

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Service is not configured" }, 500);
  const admin = createClient(url, serviceKey);
  const token = auth.slice("Bearer ".length);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);
  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: "Validation failed" }, 400);
  const input = parsed.data;
  const { data: member } = await admin.from("organization_members").select("id").eq("organization_id", input.organization_id).eq("user_id", userData.user.id).maybeSingle();
  if (!member) return json({ error: "Forbidden" }, 403);
  const { data: integration } = await admin.from("integrations").select("id, organization_id, provider, name, status, connection_health, configuration").eq("id", input.integration_id).eq("organization_id", input.organization_id).maybeSingle();
  if (!integration) return json({ error: "Integration not found" }, 404);
  if (input.fallback_integration_id) {
    const { data: fallback } = await admin.from("integrations").select("id").eq("id", input.fallback_integration_id).eq("organization_id", input.organization_id).maybeSingle();
    if (!fallback) return json({ error: "Fallback integration not found" }, 400);
  }
  const configuration = typeof integration.configuration === "object" && integration.configuration ? integration.configuration : {};
  const nextConfiguration = { ...configuration, alert_route: { event_type: input.event_type, enabled: input.enabled, fallback_integration_id: input.fallback_integration_id ?? null, n8n_credential_reference: input.n8n_credential_reference ?? null, last_verified_at: null, verification_status: "pending" } };
  const { error } = await admin.from("integrations").update({ configuration: nextConfiguration, updated_at: new Date().toISOString() }).eq("id", integration.id).eq("organization_id", input.organization_id);
  if (error) return json({ error: "Failed to configure alert route" }, 500);
  return json({ ok: true, integration_id: integration.id, provider: integration.provider, name: integration.name, alert_route: nextConfiguration.alert_route }, 200);
});
