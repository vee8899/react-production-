type Json = Record<string, unknown>;

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is required.`);
  return value;
};

const functionsUrl = (process.env.STAGING_SUPABASE_FUNCTIONS_URL || required("STAGING_SUPABASE_URL")).replace(/\/$/, "");
const adminInviteSecret = required("STAGING_ADMIN_INVITE_SECRET");
const email = required("STAGING_INVITE_EMAIL");
const companyName = process.env.STAGING_INVITE_COMPANY || `Staging Acceptance ${Date.now()}`;
const endpoint = `${functionsUrl}/functions/v1/invite-client`;

const postInvite = async (body: Json, secret = adminInviteSecret) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Invite-Secret": secret,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text);
  } catch {
    // Keep plain text for unexpected non-JSON failures.
  }

  return { status: response.status, data };
};

const payload = {
  company_name: companyName,
  email,
  plan: "staging-acceptance",
  vertical_key: "real_estate",
  feature_keys: ["workflow_automation", "system_integrations"],
  services: [
    { feature_type: "workflow_automation", status: "onboarding" },
    { feature_type: "system_integrations", status: "onboarding" },
  ],
};

const invite = await postInvite(payload);
if (invite.status !== 201) {
  throw new Error(`invite-client expected HTTP 201, got HTTP ${invite.status}.`);
}

const unauthorized = await postInvite({ ...payload, email: `unauthorized-${email}` }, "invalid-secret");
if (unauthorized.status !== 401) {
  throw new Error(`invite-client invalid secret expected HTTP 401, got HTTP ${unauthorized.status}.`);
}

console.log(JSON.stringify({
  ok: true,
  endpoint,
  invite,
  invalid_secret: unauthorized,
  email_delivery_verification: {
    recipient: email,
    required_manual_check: "Confirm the Supabase invite email arrived, its link targets /accept-invite, and accepting it reaches /dashboard.",
  },
  timestamp: new Date().toISOString(),
}, null, 2));
