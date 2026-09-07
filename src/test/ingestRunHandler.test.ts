// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createIngestHandler } from "../../supabase/functions/ingest-run/handler";

const payload = {
  event_id: "handler-test-event",
  client_id: "20000000-0000-4000-8000-000000000001",
  feature_type: "custom_workflow",
  workflow_name: "Handler test",
  status: "success",
};
const request = (body: unknown = payload, secret: string | null = "test-secret") => new Request("http://localhost/ingest-run", {
  method: "POST",
  headers: secret === null ? {} : { "X-Webhook-Secret": secret },
  body: typeof body === "string" ? body : JSON.stringify(body),
});
const setup = (result = { data: "run-id" as unknown, error: null as unknown }) => {
  const rpc = vi.fn().mockResolvedValue(result);
  const env: Record<string, string> = { WEBHOOK_SECRET: "test-secret", SUPABASE_URL: "http://localhost", SUPABASE_SERVICE_ROLE_KEY: "test-key" };
  return { rpc, env, handler: createIngestHandler({ env: (key) => env[key], rpc }) };
};
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("ingest-run HTTP handler", () => {
  it("preserves the success response and maps validated defaults to the RPC", async () => {
    const { handler, rpc } = setup();
    const response = await handler(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, run_id: "run-id" });
    expect(rpc).toHaveBeenCalledWith("http://localhost", "test-key", expect.objectContaining({
      p_event_id: payload.event_id, p_client_id: payload.client_id,
      p_records_processed: 0, p_steps: [], p_entity_refs: [], p_organization_id: null,
    }));
  });

  it("returns only a generic 409 for the database ownership signal", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { handler } = setup({ data: null, error: { code: "P4091", message: "private organization", details: "private client", hint: "private event" } });
    const response = await handler(request());
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Event ID conflict", code: "event_id_conflict" });
    expect(warning).toHaveBeenCalledWith("Ingestion event ownership conflict", { event_id: payload.event_id });
  });

  it.each([null, "wrong-secret"])("rejects secret %s before calling the database", async (secret) => {
    const { handler, rpc } = setup();
    const response = await handler(request(payload, secret));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each(["invalid-json", { ...payload, client_id: "invalid" }])("rejects malformed input before writing", async (body) => {
    const { handler, rpc } = setup();
    expect((await handler(request(body))).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each(["WEBHOOK_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])("fails closed without %s", async (key) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { handler, rpc, env } = setup();
    delete env[key];
    expect((await handler(request())).status).toBe(500);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("keeps unrelated database failures generic", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { handler } = setup({ data: null, error: { code: "23503", message: "private foreign key detail" } });
    const response = await handler(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to ingest automation run" });
  });

  it("keeps rejected RPC promises generic", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { handler, rpc } = setup();
    rpc.mockRejectedValue(new Error("private connection detail"));
    expect((await handler(request())).status).toBe(500);
  });

  it("preserves the 10-second timeout response and clears its timer", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { handler, rpc } = setup();
    rpc.mockImplementation(() => new Promise(() => {}));
    const pending = handler(request());
    await vi.advanceTimersByTimeAsync(10_000);
    const response = await pending;
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ error: "Ingestion timed out" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects non-POST requests", async () => {
    const { handler, rpc } = setup();
    const response = await handler(new Request("http://localhost/ingest-run"));
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(rpc).not.toHaveBeenCalled();
  });
});
