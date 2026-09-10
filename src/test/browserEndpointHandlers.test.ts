// @vitest-environment node
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/supabase";
import { createDemoEventHandler } from "../../supabase/functions/demo-event/handler";
import { createAlertRouteHandler } from "../../supabase/functions/configure-alert-route/handler";

const organizationId = "10000000-0000-4000-8000-000000000001";
const otherOrganizationId = "10000000-0000-4000-8000-000000000002";
const integrationId = "20000000-0000-4000-8000-000000000001";
const otherIntegrationId = "20000000-0000-4000-8000-000000000002";
const endpoints = [
  { name: "demo-event", factory: createDemoEventHandler, payload: { event: "new_lead" } },
  { name: "configure-alert-route", factory: createAlertRouteHandler, payload: { organization_id: organizationId, integration_id: integrationId } },
];

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const expectCors = (response: Response) => {
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
  expect(response.headers.get("Access-Control-Allow-Headers")).toBe("authorization, apikey, content-type, x-client-info");
  expect(response.headers.has("Access-Control-Allow-Credentials")).toBe(false);
};

function setup(endpoint: typeof endpoints[number]) {
  const requests: { url: URL; method: string; body: Record<string, unknown> | null }[] = [];
  const state = { invalidAuth: false, userId: "demo-user", failPath: "", failMethod: "" };
  const transport = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    const body = request.method === "POST" || request.method === "PATCH" ? await request.json() as Record<string, unknown> : null;
    requests.push({ url, method: request.method, body });
    if (url.pathname === "/auth/v1/user") return state.invalidAuth ? json({ message: "Invalid token" }, 401) : json({ id: state.userId });
    if (url.pathname.endsWith(state.failPath) && state.failPath && request.method === state.failMethod) return json({ message: "Private database detail" }, 500);
    const table = url.pathname.split("/").pop();
    if (table === "clients") return state.userId === "demo-user"
      ? json({ id: "demo-client", organization_id: organizationId, organizations: { name: "Northstar Realty Demo", vertical_key: "real_estate" } })
      : json({ message: "No demo client" }, 406);
    if (table === "organization_members") return json(url.searchParams.get("organization_id") === `eq.${organizationId}` ? [{ id: "membership" }] : []);
    if (table === "integrations") {
      if (request.method === "PATCH") return new Response(null, { status: 204 });
      return json(url.searchParams.get("id") === `eq.${integrationId}` && url.searchParams.get("organization_id") === `eq.${organizationId}`
        ? [{ id: integrationId, organization_id: organizationId, provider: "slack", name: "Demo alerts", configuration: { retained: true } }] : []);
    }
    if (table === "leads" || table === "appointments" || table === "listings") return request.method === "PATCH"
      ? new Response(null, { status: 204 }) : json({ id: "entity-id" });
    if (table === "workflows") return json({ id: "workflow-id", n8n_workflow_id: "demo-workflow" });
    if (table === "ingest_workflow_run") return json("run-id");
    throw new Error(`Unexpected test request: ${request.method} ${url.pathname}`);
  });
  const env = vi.fn((key: string) => ({ SUPABASE_URL: "https://supabase.test", SUPABASE_ANON_KEY: "anon-test-key", SUPABASE_SERVICE_ROLE_KEY: "service-test-key" })[key]);
  const clientFactory = vi.fn((url: string, key: string) => createClient<Database>(url, key, {
    global: { fetch: transport }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }));
  const handler = endpoint.factory({ env, createClient: clientFactory });
  const request = (payload: unknown = endpoint.payload, authorization: string | null = "Bearer test-token", method = "POST") => new Request(`https://functions.test/${endpoint.name}`, {
    method,
    headers: { Origin: "https://portal.test", ...(authorization === null ? {} : { Authorization: authorization }) },
    ...(method === "POST" ? { body: typeof payload === "string" ? payload : JSON.stringify(payload) } : {}),
  });
  const writes = () => requests.filter((entry) => entry.method === "POST" || entry.method === "PATCH");
  return { handler, request, requests, writes, state, env, clientFactory, transport };
}

describe.each(endpoints)("$name executable browser handler", (endpoint) => {
  it("answers unauthenticated preflight before reading configuration or creating clients", async () => {
    const { handler, request, env, clientFactory, transport } = setup(endpoint);
    const response = await handler(request(undefined, null, "OPTIONS"));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expectCors(response);
    expect(env).not.toHaveBeenCalled();
    expect(clientFactory).not.toHaveBeenCalled();
    expect(transport).not.toHaveBeenCalled();
  });

  it.each(["GET", "PUT", "DELETE"])("rejects %s with CORS before dependencies", async (method) => {
    const { handler, request, clientFactory } = setup(endpoint);
    const response = await handler(request(undefined, null, method));
    expect(response.status).toBe(405);
    expectCors(response);
    expect(response.headers.get("Allow")).toBe("POST, OPTIONS");
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it.each([null, "Basic test-token", "Bearer "])("rejects missing or malformed authorization (%s)", async (authorization) => {
    const { handler, request, writes } = setup(endpoint);
    const response = await handler(request(undefined, authorization));
    expect(response.status).toBe(401);
    expectCors(response);
    expect(writes()).toEqual([]);
  });

  it("rejects an invalid bearer token before database access", async () => {
    const { handler, request, requests, state } = setup(endpoint);
    state.invalidAuth = true;
    const response = await handler(request());
    expect(response.status).toBe(401);
    expectCors(response);
    expect(requests.map((entry) => entry.url.pathname)).toEqual(["/auth/v1/user"]);
  });

  it.each(["invalid-json", {}])("rejects malformed input with CORS and no mutations (%s)", async (payload) => {
    const { handler, request, writes } = setup(endpoint);
    const response = await handler(request(payload));
    expect(response.status).toBe(400);
    expectCors(response);
    expect(writes()).toEqual([]);
  });

  it("keeps success responses browser-readable and scopes writes to the authorized organization", async () => {
    const { handler, request, requests, writes } = setup(endpoint);
    const response = await handler(request());
    expect(response.status).toBe(200);
    expectCors(response);
    expect(await response.json()).toMatchObject({ ok: true });
    if (endpoint.name === "demo-event") {
      const clientQuery = requests.find((entry) => entry.url.pathname.endsWith("/clients"))!;
      expect(clientQuery.url.searchParams.get("user_id")).toBe("eq.demo-user");
      expect(clientQuery.url.searchParams.get("organizations.name")).toBe("eq.Northstar Realty Demo");
      expect(writes()[0].body?.organization_id).toBe(organizationId);
      expect(writes()[1].body).toMatchObject({ p_client_id: "demo-client", p_organization_id: organizationId });
    } else {
      expect(requests.find((entry) => entry.url.pathname.endsWith("/organization_members"))?.url.searchParams.get("user_id")).toBe("eq.demo-user");
      expect(writes()).toHaveLength(1);
      expect(writes()[0].url.searchParams.get("organization_id")).toBe(`eq.${organizationId}`);
      expect(writes()[0].body?.configuration).toMatchObject({ retained: true, alert_route: { enabled: true, event_type: "workflow_failure" } });
    }
  });

  it("rejects another tenant before any mutation", async () => {
    const { handler, request, writes, state } = setup(endpoint);
    state.userId = "other-user";
    const response = await handler(request(endpoint.name === "demo-event" ? { event: "new_lead", organization_id: organizationId }
      : { organization_id: otherOrganizationId, integration_id: integrationId }));
    expect(response.status).toBe(403);
    expectCors(response);
    expect(writes()).toEqual([]);
  });

  it("returns generic server errors with CORS for missing configuration and thrown dependencies", async () => {
    const missing = setup(endpoint);
    missing.env.mockReturnValue(undefined);
    const response = await missing.handler(missing.request());
    expect(response.status).toBe(500);
    expectCors(response);
    expect(missing.clientFactory).not.toHaveBeenCalled();
    const thrown = setup(endpoint);
    thrown.clientFactory.mockImplementation(() => { throw new Error("Private dependency detail"); });
    const failure = await thrown.handler(thrown.request());
    expect(failure.status).toBe(500);
    expectCors(failure);
    expect(await failure.text()).not.toContain("Private");
  });

  it("returns CORS and a generic error when the privileged write fails", async () => {
    const { handler, request, state } = setup(endpoint);
    state.failPath = endpoint.name === "demo-event" ? "/ingest_workflow_run" : "/integrations";
    state.failMethod = endpoint.name === "demo-event" ? "POST" : "PATCH";
    const response = await handler(request());
    expect(response.status).toBe(500);
    expectCors(response);
    expect(await response.text()).not.toContain("Private");
  });
});

it.each(["new_lead", "listing_change", "appointment_booked", "workflow_failure"])("executes the demo %s flow with CORS", async (event) => {
  const { handler, request, writes } = setup(endpoints[0]);
  const response = await handler(request({ event, organization_id: otherOrganizationId }));
  expect(response.status).toBe(200);
  expectCors(response);
  expect(await response.json()).toEqual({ ok: true, event, run_id: "run-id" });
  expect(writes().at(-1)?.body).toMatchObject({ p_organization_id: organizationId, p_status: event === "workflow_failure" ? "error" : "success" });
});

it.each([
  { event: "new_lead", path: "/leads", method: "POST" },
  { event: "appointment_booked", path: "/appointments", method: "POST" },
  { event: "listing_change", path: "/listings", method: "GET" },
  { event: "listing_change", path: "/listings", method: "PATCH" },
  { event: "workflow_failure", path: "/listings", method: "GET" },
  { event: "new_lead", path: "/workflows", method: "GET" },
])("returns CORS and no ingestion after $event fails at $method $path", async ({ event, path, method }) => {
  const { handler, request, state, writes } = setup(endpoints[0]);
  state.failPath = path;
  state.failMethod = method;
  const response = await handler(request({ event }));
  expect(response.status).toBe(500);
  expectCors(response);
  expect(await response.text()).not.toContain("Private");
  expect(writes().some((entry) => entry.url.pathname.endsWith("/ingest_workflow_run"))).toBe(false);
});

it.each([
  { payload: { organization_id: organizationId, integration_id: otherIntegrationId }, status: 404 },
  { payload: { organization_id: organizationId, integration_id: integrationId, fallback_integration_id: otherIntegrationId }, status: 400 },
])("rejects a foreign primary or fallback integration with $status and no write", async ({ payload, status }) => {
  const { handler, request, writes } = setup(endpoints[1]);
  const response = await handler(request(payload));
  expect(response.status).toBe(status);
  expectCors(response);
  expect(writes()).toEqual([]);
});
