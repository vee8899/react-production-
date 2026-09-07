import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import pg from "pg";

// This suite commits synthetic fixtures so independent sessions can see them.
// Never allow it to target a hosted database. Cleanup runs even after assertion failure.
const connectionString = process.env.LOCAL_INGEST_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const target = new URL(connectionString);
assert(["127.0.0.1", "localhost", "[::1]"].includes(target.hostname), "Ingestion tests require a disposable loopback Postgres database");
assert(["postgres:", "postgresql:"].includes(target.protocol), "Expected a Postgres URL");
const connect = async () => {
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 5000, statement_timeout: 15000 });
  await client.connect();
  return client;
};
const control = await connect();
const sessions: pg.Client[] = [];
const prefix = `ingestion-test-${randomUUID()}`;
const tenants = Array.from({ length: 3 }, (_, index) => ({
  user: randomUUID(), client: randomUUID(), org: randomUUID(), workflow: randomUUID(), index,
}));
// A second client in the first organization proves client ownership independently.
tenants[2].org = tenants[0].org;
type Tenant = typeof tenants[number];
const entity = randomUUID();
const eventIds: string[] = [];
const event = (name: string) => { const id = `${prefix}-${name}`; eventIds.push(id); return id; };
const checks: string[] = [];
const pass = (label: string) => { checks.push(label); console.log(`PASS ${label}`); };

const ingest = async (db: pg.Client, id: string, tenant: Tenant, marker = "initial", refs?: unknown[]) => {
  const result = await db.query<{ id: string }>(`select public.ingest_workflow_run(
    $1, $2, null, 'custom_workflow', $3, $3, 'success', $4,
    '2026-09-07T00:00:00Z', '2026-09-07T00:00:01Z', 1000, 0, 3, 0,
    null, $5::jsonb, $6::jsonb, $7::jsonb, $5::jsonb) as id`, [
    id, tenant.client, marker, tenant.workflow, JSON.stringify({ marker }),
    JSON.stringify([{ step_key: marker, outputs: { marker } }]),
    JSON.stringify(refs ?? [{ entity_type: "test_entity", entity_id: entity, metadata: { marker } }]),
  ]);
  return result.rows[0].id;
};

const snapshot = async (id: string) => {
  const { rows } = await control.query(`select
    (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]') from public.workflow_runs r where event_id = $1) as canonical,
    (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]') from public.automation_runs r where event_id = $1) as compatibility,
    (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]') from public.workflow_steps r where workflow_run_id in (select id from public.workflow_runs where event_id = $1)) as steps,
    (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]') from public.workflow_run_entities r where workflow_run_id in (select id from public.workflow_runs where event_id = $1)) as entities,
    (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]') from public.audit_log r where request_id = $1) as audit`, [id]);
  return rows[0];
};
const consistent = async (id: string, tenant: Tenant, marker: string, audits: number) => {
  const state = await snapshot(id);
  for (const name of ["canonical", "compatibility", "steps", "entities"]) {
    assert.equal(state[name].length, 1, `${name}: expected exactly one row for ${marker}`);
    assert.equal(state[name][0].organization_id, tenant.org, `${name}: wrong tenant owner`);
  }
  assert.equal(state.canonical[0].workflow_id, tenant.workflow);
  assert.equal(state.compatibility[0].client_id, tenant.client);
  assert.equal(state.compatibility[0].workflow_id, tenant.workflow);
  assert.equal(state.compatibility[0].workflow_name, marker);
  for (const name of ["compatibility", "steps", "entities"]) {
    assert.equal(state[name][0].workflow_run_id, state.canonical[0].id, `${name}: wrong run link`);
  }
  assert.deepEqual(state.canonical[0].outputs, { marker });
  assert.deepEqual(state.compatibility[0].metadata, { marker });
  assert.equal(state.steps[0].step_key, marker);
  assert.deepEqual(state.steps[0].outputs, { marker });
  assert.deepEqual(state.entities[0].metadata, { marker });
  assert.equal(state.audit.length, audits, "Audit history must include successful calls only");
  for (const row of state.audit) assert.equal(row.organization_id, tenant.org, "Audit owner must match the winner");
  assert(state.audit.some((row: { after_state: { marker: string } }) => row.after_state.marker === marker), "Audit must contain the winning payload");
  return state;
};
const rejectsUnchanged = async (id: string, action: () => Promise<unknown>, code = "P4091") => {
  const before = await snapshot(id);
  await assert.rejects(action, (error: unknown) => error instanceof pg.DatabaseError && error.code === code,
    `Expected SQLSTATE ${code}`);
  assert.deepEqual(await snapshot(id), before, "Rejected ingestion changed canonical, compatibility, child, or audit rows");
};
const legacy = async (db: pg.Client, id: string, tenant: Tenant) => db.query(`insert into public.automation_runs
  (event_id, client_id, organization_id, workflow_id, n8n_workflow_id, workflow_name)
  values ($1, $2, $3, $4, 'legacy', 'legacy')`, [id, tenant.client, tenant.org, tenant.workflow]);

const waitUntilBlocked = async (blockedPid: number, blockerPid: number) => {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const { rows } = await control.query("select $2::int = any(pg_blocking_pids($1::int)) as blocked", [blockedPid, blockerPid]);
    if (rows[0].blocked) return;
    await delay(20);
  }
  assert.fail("Concurrent request never waited on the first connection's lock; overlap was not proven");
};

try {
  await control.query("begin");
  for (const tenant of tenants) {
    await control.query("insert into auth.users (id, aud, role, email) values ($1, 'authenticated', 'authenticated', $2)", [tenant.user, `${prefix}-${tenant.index}@example.test`]);
    if (tenant.index < 2) await control.query("insert into public.organizations (id, name, slug) values ($1, 'Ingestion test', $2)", [tenant.org, `${prefix}-${tenant.index}`]);
    await control.query("insert into public.clients (id, user_id, organization_id, company_name, email) values ($1, $2, $3, 'Ingestion test', $4)", [tenant.client, tenant.user, tenant.org, `${prefix}-${tenant.index}@example.test`]);
    await control.query("insert into public.workflows (id, client_id, organization_id, name, n8n_workflow_id) values ($1, $2, $3, 'Ingestion test', $4)", [tenant.workflow, tenant.client, tenant.org, prefix]);
  }
  await control.query("commit");
  for (let index = 0; index < 2; index++) {
    const db = await connect();
    sessions.push(db);
    await db.query("set role service_role");
  }
  const [first, second] = sessions;
  const [alice, bob, sameOrg] = tenants;
  const firstPid = (await first.query("select pg_backend_pid() as pid")).rows[0].pid;
  const secondPid = (await second.query("select pg_backend_pid() as pid")).rows[0].pid;

  const replay = event("replay");
  const runId = await ingest(first, replay, alice);
  await consistent(replay, alice, "initial", 1);
  assert.equal(await ingest(first, replay, alice, "replacement"), runId, "Same-owner replay changed the run ID");
  await consistent(replay, alice, "replacement", 2);
  pass("valid create and same-owner replay replace children and retain the run ID");

  await rejectsUnchanged(replay, () => ingest(second, replay, bob, "cross-tenant"));
  await rejectsUnchanged(replay, () => ingest(second, replay, sameOrg, "different-client"));
  pass("cross-tenant and same-organization different-client collisions preserve all five record sets");

  for (const field of ["client_id", "organization_id"] as const) {
    const id = event(`historical-${field}`);
    await ingest(first, id, alice);
    // Simulate historical inconsistency; the RPC must reject, never repair it.
    await control.query(`update public.automation_runs set ${field} = $2 where event_id = $1`, [id, field === "client_id" ? bob.client : bob.org]);
    await rejectsUnchanged(id, () => ingest(first, id, alice, "must-rollback"));
  }
  pass("independent compatibility client/org mismatches roll back canonical changes and preserve children/audit");

  const legacyOnly = event("legacy-only");
  await legacy(control, legacyOnly, bob);
  await rejectsUnchanged(legacyOnly, () => ingest(first, legacyOnly, alice));
  assert.equal((await snapshot(legacyOnly)).canonical.length, 0, "Rejected legacy collision left a new canonical run");
  await ingest(second, legacyOnly, bob, "legacy-owner");
  await consistent(legacyOnly, bob, "legacy-owner", 1);
  pass("legacy-only collision rolls back a new canonical row; original owner can replay");

  await rejectsUnchanged(replay, () => ingest(first, replay, alice, "invalid-child", [
    { entity_type: "test_entity", entity_id: randomUUID() }, { entity_type: "test_entity" },
  ]), "22023");
  pass("late child failure rolls back canonical/projection updates, replacements, and new audit writes");

  await rejectsUnchanged(replay, () => ingest(first, replay, { ...alice, workflow: bob.workflow }), "23503");
  pass("cross-tenant client/workflow pairing remains rejected");

  // Hold transaction 1 open, prove transaction 2 is blocked, then release it.
  // Running both ownership orderings avoids only exercising one fixture as winner.
  for (const winner of [alice, bob]) {
    const loser = winner === alice ? bob : alice;
    const id = event(`race-${winner.index}`);
    await first.query("begin");
    await ingest(first, id, winner, "winner");
    const pending = ingest(second, id, loser, "loser").then(
      () => ({ code: "unexpected-success" }),
      (error: pg.DatabaseError) => ({ code: error.code }),
    );
    await waitUntilBlocked(secondPid, firstPid);
    await first.query("commit");
    const before = await consistent(id, winner, "winner", 1);
    assert.equal((await pending).code, "P4091", "Concurrent loser did not receive the ownership conflict");
    assert.deepEqual(await snapshot(id), before, "Concurrent loser changed the winner's data");
  }
  pass("two independent sessions: either tenant can win; blocked loser receives P4091 with consistent winner data");

  const same = event("same-owner-race");
  await first.query("begin");
  const concurrentId = await ingest(first, same, alice, "first");
  const pendingReplay = ingest(second, same, alice, "second").then(
    (id) => ({ id, error: null }), (error: unknown) => ({ id: null, error }),
  );
  await waitUntilBlocked(secondPid, firstPid);
  await first.query("commit");
  const replayResult = await pendingReplay;
  assert.equal(replayResult.error, null, "Concurrent same-owner replay failed");
  assert.equal(replayResult.id, concurrentId);
  await consistent(same, alice, "second", 2);
  pass("concurrent same-owner replay keeps one run and one complete child replacement");

  const legacyRace = event("legacy-race");
  await first.query("begin");
  await legacy(first, legacyRace, bob);
  const originalLegacy = (await first.query("select to_jsonb(r) as row from public.automation_runs r where event_id = $1", [legacyRace])).rows[0].row;
  const pendingLegacy = ingest(second, legacyRace, alice).then(
    () => ({ code: "unexpected-success" }), (error: pg.DatabaseError) => ({ code: error.code }),
  );
  await waitUntilBlocked(secondPid, firstPid);
  await first.query("commit");
  assert.equal((await pendingLegacy).code, "P4091");
  const legacyState = await snapshot(legacyRace);
  assert.deepEqual(legacyState.compatibility, [originalLegacy], "Rejected concurrent ingestion changed the legacy winner");
  for (const key of ["canonical", "steps", "entities", "audit"]) assert.equal(legacyState[key].length, 0);
  pass("concurrent legacy insert cannot be overwritten and rejected canonical insert rolls back");

  console.log(JSON.stringify({ ok: true, checks: checks.length, environment: "disposable local Postgres", timestamp: new Date().toISOString() }));
} finally {
  // End open transactions before cleanup, including when a lock assertion fails.
  await Promise.all(sessions.map(async (db) => { await db.query("rollback"); await db.end(); }));
  await control.query("rollback");
  await control.query("begin");
  await control.query("delete from public.audit_log where request_id = any($1::text[])", [eventIds]);
  await control.query("delete from public.automation_runs where event_id = any($1::text[])", [eventIds]);
  await control.query("delete from public.workflow_runs where event_id = any($1::text[])", [eventIds]);
  await control.query("delete from auth.users where id = any($1::uuid[])", [tenants.map((t) => t.user)]);
  await control.query("delete from public.organizations where id = any($1::uuid[])", [tenants.slice(0, 2).map((t) => t.org)]);
  await control.query("commit");
  await control.end();
}
