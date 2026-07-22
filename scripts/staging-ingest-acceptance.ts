type Json = Record<string, unknown>;

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is required.`);
  return value;
};

const functionsUrl = (process.env.STAGING_SUPABASE_FUNCTIONS_URL || required("STAGING_SUPABASE_URL")).replace(/\/$/, "");
const webhookSecret = required("STAGING_WEBHOOK_SECRET");
const clientId = required("STAGING_CLIENT_ID");
const organizationId = process.env.STAGING_ORGANIZATION_ID;
const releaseSha = process.env.RELEASE_SHA || "local";
const eventId = process.env.STAGING_INGEST_EVENT_ID || `staging-acceptance-${releaseSha}-${Date.now()}`;
const endpoint = `${functionsUrl}/functions/v1/ingest-run`;
const alertRouteEndpoint = `${functionsUrl}/functions/v1/configure-alert-route`;

const postIngest = async (body: Json, secret = webhookSecret) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Secret": secret,
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

const basePayload = {
  event_id: eventId,
  client_id: clientId,
  organization_id: organizationId,
  feature_type: "custom_workflow",
  workflow_name: "Staging acceptance ingest",
  n8n_workflow_id: "staging-acceptance",
  status: "success",
  records_processed: 3,
  records_failed: 0,
  workflow_steps: [
    { step_key: "acceptance", step_name: "Acceptance test", status: "success" },
  ],
  metadata: { acceptance: true, release_sha: releaseSha },
};

const assertStatus = (label: string, actual: number, expected: number) => {
  if (actual !== expected) {
    throw new Error(`${label} expected HTTP ${expected}, got HTTP ${actual}.`);
  }
};

const configureAlertRoute = async () => {
  const integrationId = process.env.STAGING_ALERT_INTEGRATION_ID;
  if (!integrationId || !organizationId) return { skipped: true, reason: "STAGING_ALERT_INTEGRATION_ID or STAGING_ORGANIZATION_ID not configured" };
  const response = await fetch(alertRouteEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${required("STAGING_USER_ACCESS_TOKEN")}` }, body: JSON.stringify({ organization_id: organizationId, integration_id: integrationId, event_type: "workflow_failure", enabled: true, n8n_credential_reference: process.env.STAGING_N8N_CREDENTIAL_REFERENCE }) });
  const data = await response.json();
  assertStatus("configure alert route", response.status, 200);
  return { skipped: false, data };
};

const first = await postIngest(basePayload);
assertStatus("valid event", first.status, 200);

const duplicate = await postIngest(basePayload);
assertStatus("duplicate event", duplicate.status, 200);

const unauthorized = await postIngest({ ...basePayload, event_id: `${eventId}-unauthorized` }, "invalid-secret");
assertStatus("invalid secret", unauthorized.status, 401);

const missingOrganization = await postIngest({
  ...basePayload,
  event_id: `${eventId}-missing-org`,
  client_id: "00000000-0000-0000-0000-000000000000",
  organization_id: undefined,
});
if (![400, 500].includes(missingOrganization.status)) {
  throw new Error(`missing organization expected bounded failure, got HTTP ${missingOrganization.status}.`);
}

const alertRoute = await configureAlertRoute();

console.log(JSON.stringify({
  ok: true,
  endpoint,
  event_id: eventId,
  valid: first,
  duplicate,
  invalid_secret: unauthorized,
  missing_organization: missingOrganization,
  alert_route: alertRoute,
  timestamp: new Date().toISOString(),
}, null, 2));
