/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260714000002_platform_core_and_vertical_modules.sql", "utf8");
const rls = readFileSync("supabase/migrations/20260711000001_client_data_rls.sql", "utf8");
const ingest = readFileSync("supabase/functions/ingest-run/index.ts", "utf8");
const invite = readFileSync("supabase/functions/invite-client/index.ts", "utf8");

describe("database and edge-function security contracts", () => {
  it("keeps ingestion service-role-only and idempotent by event", () => {
    expect(sql).toMatch(/revoke all on function public\.ingest_workflow_run[\s\S]*from public, anon, authenticated;/i);
    expect(sql).toMatch(/grant execute on function public\.ingest_workflow_run[\s\S]*to service_role;/i);
    expect(sql).toMatch(/on conflict \(event_id\) do update/i);
    expect(ingest).toContain('req.headers.get("X-Webhook-Secret")');
    expect(ingest).toContain('return json({ error: "Unauthorized" }, 401)');
    expect(ingest).toContain('new Error("Ingestion timed out")');
    expect(ingest).toMatch(/Ingestion timed out[\s\S]*\? 504 : 500/);
  });

  it("requires shared secrets and cleans up partially provisioned invites", () => {
    expect(invite).toContain('req.headers.get("X-Admin-Invite-Secret")');
    expect(invite).toContain('return json({ error: "Unauthorized" }, 401)');
    expect(invite).toContain("supabase.auth.admin.deleteUser(invite.user.id)");
  });

  it("enables tenant isolation and scopes legacy client data to auth.uid", () => {
    for (const table of ["clients", "automation_runs", "analytics_snapshots", "workflows"]) {
      expect(rls).toMatch(new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    }
    expect(rls).toMatch(/select auth\.uid\(\)\) = user_id/i);
    expect(rls).toMatch(/client\.user_id = \(select auth\.uid\(\)\)/i);
  });
});
