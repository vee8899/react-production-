import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const serviceFeatureTypes = [
  "lead_follow_up",
  "listing_notifications",
  "client_communication",
  "crm_sync",
  "appointment_scheduling",
  "data_pipeline",
] as const;

const inviteSchema = z.object({
  company_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  plan: z.string().trim().min(1).max(80).default("starter"),
  vertical_key: z.string().trim().min(1).max(60).default("general"),
  feature_keys: z.array(z.string().trim().regex(/^[a-z0-9_]+(?:\.[a-z0-9_]+)*$/)).max(30).optional().default([]),
  services: z.array(z.object({
    feature_type: z.enum(serviceFeatureTypes),
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
    console.error("inviteError");
    return json({ error: "Unable to invite this client" }, 400);
  }

  const legacyFeatureKeys = parsed.data.services.map((service) => service.feature_type);
  const featureKeys = [...new Set([...parsed.data.feature_keys, ...legacyFeatureKeys])];
  const { data: provisioned, error: provisionError } = await supabase.rpc("provision_client_workspace", {
    p_company_name: parsed.data.company_name,
    p_email: parsed.data.email,
    p_plan: parsed.data.plan,
    p_user_id: invite.user.id,
    p_vertical_key: parsed.data.vertical_key,
    p_feature_keys: featureKeys,
    p_services: parsed.data.services,
  }).single();

  if (provisionError || !provisioned) {
    await supabase.auth.admin.deleteUser(invite.user.id);
    console.error("Unable to provision client workspace", provisionError);
    return json({ error: "Unable to provision client workspace" }, 500);
  }

  return json({ ...provisioned, user_id: invite.user.id, invited: true }, 201);
});
