/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260714000002_platform_core_and_vertical_modules.sql", "utf8");
const rls = readFileSync("supabase/migrations/20260711000001_client_data_rls.sql", "utf8");
const ingest = readFileSync("supabase/functions/ingest-run/index.ts", "utf8");
const invite = readFileSync("supabase/functions/invite-client/index.ts", "utf8");

describe("database and edge-function security contracts", () => {
  it("revokes public, anonymous, and authenticated execution of ingest_workflow_run", () => {
    expect(sql, "ingest_workflow_run must not be executable by browser-facing roles").toMatch(/revoke all on function public\.ingest_workflow_run[\s\S]*from public, anon, authenticated;/i);
  });

  it("grants ingest_workflow_run execution only to the service role", () => {
    expect(sql, "ingest_workflow_run must remain a trusted service-role boundary").toMatch(/grant execute on function public\.ingest_workflow_run[\s\S]*to service_role;/i);
  });

  it("upserts workflow events by stable event ID", () => {
    expect(sql, "replayed workflow events must update the existing event instead of creating a duplicate").toMatch(/on conflict \(event_id\) do update/i);
  });

  it("rejects ingestion requests without the webhook secret", () => {
    expect(ingest, "ingestion must read X-Webhook-Secret before accepting a request").toContain('req.headers.get("X-Webhook-Secret")');
    expect(ingest, "unauthenticated ingestion requests must receive HTTP 401").toContain('return json({ error: "Unauthorized" }, 401)');
  });

  it("returns HTTP 504 when ingestion reaches its timeout", () => {
    expect(ingest, "timed-out ingestion must be distinguishable from an internal server error").toMatch(/Ingestion timed out[\s\S]*\? 504 : 500/);
  });

  it("rejects invite requests without the administrator invite secret", () => {
    expect(invite, "invite provisioning must read X-Admin-Invite-Secret before accepting a request").toContain('req.headers.get("X-Admin-Invite-Secret")');
    expect(invite, "unauthenticated invite requests must receive HTTP 401").toContain('return json({ error: "Unauthorized" }, 401)');
  });

  it("removes a newly created user when invite provisioning fails", () => {
    expect(invite, "failed provisioning must not leave an orphaned auth user").toContain("supabase.auth.admin.deleteUser(invite.user.id)");
  });

  it.each(["clients", "automation_runs", "analytics_snapshots", "workflows"])("enables row-level security for legacy %s data", (table) => {
    expect(rls, `${table} must enforce tenant-scoped access through row-level security`).toMatch(new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  });

  it("scopes legacy client records to the authenticated user", () => {
    expect(rls, "legacy client access must compare user_id with auth.uid()").toMatch(/select auth\.uid\(\)\) = user_id/i);
    expect(rls, "legacy run access must be derived from the authenticated client's user ID").toMatch(/client\.user_id = \(select auth\.uid\(\)\)/i);
  });
});
