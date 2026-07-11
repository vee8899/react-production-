import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const inviteSchema = z.object({
  company_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  plan: z.string().trim().min(1).max(80).default("starter"),
  services: z.array(z.object({
    feature_type: z.enum([
      "lead_follow_up",
      "listing_notifications",
      "client_communication",
      "crm_sync",
      "appointment_scheduling",
      "data_pipeline",
    ]),
    status: z.enum(["onboarding", "active", "paused", "cancelled"]).default("onboarding"),
  })).max(6).optional().default([]),
});

const getInviteRedirectUrl = (rawSiteUrl: string, rawInviteRedirectUrl?: string) => {
  try {
    const url = new URL(rawInviteRedirectUrl || rawSiteUrl);
    if (!rawInviteRedirectUrl) {
      url.pathname = "/accept-invite";
    }
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
  }

  const inviteSecret = Deno.env.get("ADMIN_INVITE_SECRET");
  if (!inviteSecret) {
    console.error("ADMIN_INVITE_SECRET is not configured");
    return json({ error: "Invite service is not configured" }, 500);
  }

  if (req.headers.get("X-Admin-Invite-Secret") !== inviteSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "Validation failed" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = Deno.env.get("SITE_URL");
  const inviteRedirectUrl = Deno.env.get("INVITE_REDIRECT_URL");
  if (!supabaseUrl || !serviceRoleKey || !siteUrl) {
    console.error("Supabase invite configuration is incomplete");
    return json({ error: "Invite service is not configured" }, 500);
  }

  const redirectTo = getInviteRedirectUrl(siteUrl, inviteRedirectUrl);
  if (!redirectTo) {
    console.error("Invite redirect URL is not valid");
    return json({ error: "Invite service is not configured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { company_name: parsed.data.company_name, plan: parsed.data.plan },
      redirectTo,
    }
  );

  if (inviteError || !invite.user) {
    return json({ error: "Unable to invite this client" }, 400);
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      company_name: parsed.data.company_name,
      email: parsed.data.email,
      plan: parsed.data.plan,
      user_id: invite.user.id,
    })
    .select("id")
    .single();

  if (clientError || !client) {
    await supabase.auth.admin.deleteUser(invite.user.id);
    console.error("Unable to create client record", clientError);
    return json({ error: "Unable to create client record" }, 500);
  }

  if (parsed.data.services.length > 0) {
    const { error: servicesError } = await supabase
      .from("client_services")
      .insert(parsed.data.services.map((service) => ({ ...service, client_id: client.id })));

    if (servicesError) {
      await supabase.auth.admin.deleteUser(invite.user.id);
      console.error("Unable to create client services", servicesError);
      return json({ error: "Unable to create client services" }, 500);
    }
  }

  return json({ client_id: client.id, user_id: invite.user.id, invited: true }, 201);
});
