import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const eventSchema = z.object({
  event: z.enum(["new_lead", "listing_change", "appointment_booked", "workflow_failure"]),
});

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: "Demo service is not configured" }, 500);

  const authClient = createClient(supabaseUrl, anonKey);
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Authentication required" }, 401);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "Unknown demo event" }, 400);

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, organization_id, organizations!inner(name, vertical_key)")
    .eq("user_id", authData.user.id)
    .eq("organizations.name", "Northstar Realty Demo")
    .single();

  if (clientError || !client) return json({ error: "Demo workspace required" }, 403);

  const event = parsed.data.event;
  let workflowKey = "demo-lead-follow-up";
  let featureKey = "workflow_automation";
  let workflowName = "New lead follow-up";
  let status = "success";
  let recordsProcessed = 1;
  let recordsFailed = 0;
  let errorMessage: string | null = null;
  let entityType = "lead";
  let entityId: string;

  if (event === "new_lead") {
    const { data: lead, error } = await supabase
      .schema("real_estate")
      .from("leads")
      .insert({
        organization_id: client.organization_id,
        lead_type: "inquiry",
        status: "new",
        first_name: "Taylor",
        last_name: "Brooks",
        email: `taylor.${crypto.randomUUID().slice(0, 8)}@example.test`,
        phone: "555-0199",
        source_system: "demo-website",
        external_id: `demo-event-${crypto.randomUUID()}`,
        metadata: { demo: true, trigger: "new_lead" },
      })
      .select("id")
      .single();
    if (error || !lead) return json({ error: "Unable to create demo lead" }, 500);
    entityId = lead.id;
  } else if (event === "listing_change") {
    workflowKey = "demo-listing-notifications";
    featureKey = "notifications";
    workflowName = "Listing status notification";
    entityType = "listing";
    const { data: listing, error } = await supabase
      .schema("real_estate")
      .from("listings")
      .select("id")
      .eq("organization_id", client.organization_id)
      .eq("external_id", "demo-listing-001")
      .single();
    if (error || !listing) return json({ error: "Demo listing not found" }, 500);
    const { error: updateError } = await supabase.schema("real_estate").from("listings").update({ status: "pending", updated_at: new Date().toISOString() }).eq("id", listing.id);
    if (updateError) return json({ error: "Unable to update demo listing" }, 500);
    entityId = listing.id;
  } else if (event === "appointment_booked") {
    workflowKey = "demo-appointment-scheduling";
    featureKey = "workflow_automation";
    workflowName = "Appointment confirmation";
    entityType = "appointment";
    const { data: appointment, error } = await supabase
      .schema("real_estate")
      .from("appointments")
      .insert({
        organization_id: client.organization_id,
        appointment_type: "property_tour",
        status: "scheduled",
        title: "Demo property tour",
        starts_at: new Date(Date.now() + 86400000).toISOString(),
        ends_at: new Date(Date.now() + 90000000).toISOString(),
        timezone: "America/Chicago",
        source_system: "demo-calendar",
        external_id: `demo-appointment-${crypto.randomUUID()}`,
        metadata: { demo: true, trigger: "appointment_booked" },
      })
      .select("id")
      .single();
    if (error || !appointment) return json({ error: "Unable to create demo appointment" }, 500);
    entityId = appointment.id;
  } else {
    workflowKey = "demo-listing-notifications";
    featureKey = "notifications";
    workflowName = "Listing status notification";
    status = "error";
    recordsProcessed = 0;
    recordsFailed = 1;
    entityType = "listing";
    errorMessage = "Demo notification provider needs attention";
    const { data: listing, error } = await supabase.schema("real_estate").from("listings").select("id").eq("organization_id", client.organization_id).eq("external_id", "demo-listing-001").single();
    if (error || !listing) return json({ error: "Demo listing not found" }, 500);
    entityId = listing.id;
  }

  const { data: workflow, error: workflowError } = await supabase.from("workflows").select("id, n8n_workflow_id").eq("client_id", client.id).eq("n8n_workflow_id", workflowKey).single();
  if (workflowError || !workflow) return json({ error: "Demo workflow not found" }, 500);

  const now = new Date().toISOString();
  const { data: runId, error: ingestError } = await supabase.rpc("ingest_workflow_run", {
    p_event_id: `demo-event-${crypto.randomUUID()}`,
    p_client_id: client.id,
    p_organization_id: client.organization_id,
    p_feature_key: featureKey,
    p_workflow_name: workflowName,
    p_n8n_workflow_id: workflow.n8n_workflow_id,
    p_status: status,
    p_workflow_id: workflow.id,
    p_started_at: now,
    p_finished_at: now,
    p_duration_ms: status === "error" ? 3840 : 1280,
    p_retries: status === "error" ? 1 : 0,
    p_records_processed: recordsProcessed,
    p_records_failed: recordsFailed,
    p_error_message: errorMessage,
    p_outputs: { demo: true },
    p_steps: status === "error"
      ? [{ step_key: "external_action", step_name: "External action", status: "error", error_message: errorMessage }]
      : [{ step_key: "receive_event", step_name: "Receive event", status: "success" }, { step_key: "complete_workflow", step_name: "Complete workflow", status: "success" }],
    p_entity_refs: [{ vertical_key: "real_estate", entity_type: entityType, entity_id: entityId, action: event === "listing_change" ? "status_changed" : "created", source_system: "demo" }],
    p_metadata: { demo: true, trigger: event },
  });

  if (ingestError) return json({ error: "Unable to record demo workflow run" }, 500);
  return json({ ok: true, event, run_id: runId }, 200);
});
