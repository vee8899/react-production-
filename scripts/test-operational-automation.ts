import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const connectionString = process.env.LOCAL_INGEST_DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(connectionString).hostname), 'Local database only');
const control = new pg.Client({ connectionString, statement_timeout: 15000 });
await control.connect();
const executionTarget = new URL(connectionString);
executionTarget.username = 'n8n_demo_executor';
executionTarget.password = randomUUID();
const db = new pg.Client({ connectionString: executionTarget.toString(), statement_timeout: 15000 });
const other = new pg.Client({ connectionString: executionTarget.toString(), statement_timeout: 15000 });
const org = randomUUID(), foreignOrg = randomUUID(), user = randomUUID(), client = randomUUID();
const prefix = `operational-test-${randomUUID()}`;
const operations = ['lead_intake', 'listing_intake', 'appointment_intake', 'lead_queue', 'listing_queue', 'appointment_queue', 'daily_snapshot', 'event_intake', 'recovery', 'failure'];
const event = (key: string) => `${prefix}:${key}`;
const invoke = async (sql: string, params: unknown[] = [], session = db) => (await session.query(sql, params)).rows[0]?.result;
const intake = (op: string, key: string, body: unknown) => invoke('select automation.intake($1,$2,$3::jsonb) result', [op, event(key), JSON.stringify(body)]);
const poll = (op: string, key: string, cursor: string | null = null, session = db) => invoke('select automation.poll($1,$2,$3) result', [op, event(key), cursor], session);
const checks: string[] = [];
const pass = (name: string) => { checks.push(name); console.log(`PASS ${name}`); };
try {
  assert.equal((await control.query('select count(*)::int n from automation.configuration')).rows[0].n, 0, 'Refuse to overwrite existing suite configuration');
  await control.query('begin');
  await control.query("insert into auth.users(id,email) values($1,$2)", [user, `${prefix}@example.test`]);
  await control.query("insert into public.organizations(id,name,slug) values($1,'Automation test',$3),($2,'Other test',$4)", [org, foreignOrg, prefix, `${prefix}-other`]);
  await control.query("insert into public.clients(id,user_id,organization_id,email,company_name) values($1,$2,$3,$4,'Automation test')", [client, user, org, `${prefix}@example.test`]);
  await control.query('insert into automation.configuration(organization_id,client_id,enabled) values($1,$2,true)', [org, client]);
  for (const op of operations) {
    const id = randomUUID();
    await control.query('insert into public.workflows(id,organization_id,client_id,name,n8n_workflow_id) values($1,$2,$3,$4,$5)', [id, org, client, op, `${prefix}-${op}`]);
    await control.query("insert into automation.workflow_bindings values($1,$2,$3,'workflow_automation',$1)", [op, id, `${prefix}-${op}`]);
  }
  await control.query('commit');
  assert.equal((await control.query("select rolcanlogin from pg_roles where rolname='n8n_demo_executor'")).rows[0].rolcanlogin, false, 'Refuse to replace existing login');
  // This random UUID is generated locally, contains no SQL metacharacters, and
  // never leaves the process. Test the actual login boundary, not SET ROLE.
  await control.query(`alter role n8n_demo_executor login password '${executionTarget.password}'`);
  await db.connect();
  await other.connect();
  await assert.rejects(db.query('select * from public.clients'), /permission denied/);
  await assert.rejects(db.query('select * from automation.configuration'), /permission denied/);
  await assert.rejects(control.query("select automation.snapshot('untrusted')"), /not configured/);
  pass('dedicated login cannot read tables; privileged caller cannot bypass configured login binding');

  const empty = await invoke('select automation.snapshot($1) result', [event('empty')]);
  assert(Object.values(empty.counts).every(n => n === 0));
  const leadBody = { source_system: 'acceptance', external_id: 'lead', email: 'demo@example.test' };
  const lead = await intake('lead_intake', 'lead', leadBody);
  assert.equal(lead.http_status, 200);
  assert.equal((await intake('lead_intake', 'lead', leadBody)).entity_id, lead.entity_id);
  assert.equal((await intake('lead_intake', 'lead', { ...leadBody, phone: 'changed' })).http_status, 409);
  assert.equal((await intake('lead_intake', 'tenant', { ...leadBody, organization_id: foreignOrg })).http_status, 400);
  assert.equal((await intake('lead_intake', 'protected', { ...leadBody, created_at: '2020-01-01' })).http_status, 400);
  assert.equal((await intake('lead_intake', 'bad', {})).http_status, 400);
  assert.equal((await intake('lead_intake', 'malformed', [])).http_status, 400);
  const listing = await intake('listing_intake', 'listing', { source_system: 'acceptance', external_id: 'listing', address_line1: 'Demo', status: 'active', price: 0, bedrooms: 0, bathrooms: 0 });
  assert.equal(listing.http_status, 200);
  const stored = (await control.query('select price,bedrooms,bathrooms from real_estate.listings where id=$1', [listing.entity_id])).rows[0];
  assert.equal(Number(stored.price), 0); assert.equal(stored.bedrooms, 0); assert.equal(Number(stored.bathrooms), 0);
  pass('intake validates payloads, preserves zeros, rejects tenant overrides, and deduplicates events');

  const foreignLead = randomUUID();
  await control.query('insert into real_estate.leads(id,organization_id) values($1,$2)', [foreignLead, foreignOrg]);
  const start = new Date(Date.now() + 3600000).toISOString(), end = new Date(Date.now() + 7200000).toISOString();
  const apptBody = { source_system: 'acceptance', external_id: 'appointment', title: 'Demo', starts_at: start, ends_at: end, lead_id: lead.entity_id, listing_id: listing.entity_id };
  assert.equal((await intake('appointment_intake', 'cross-reference', { ...apptBody, lead_id: foreignLead })).http_status, 400);
  assert.equal((await intake('appointment_intake', 'bad-time', { ...apptBody, ends_at: start })).http_status, 400);
  const appointment = await intake('appointment_intake', 'appointment', apptBody);
  assert.equal(appointment.http_status, 200);
  assert.equal((await poll('appointment_queue', 'reminder')).records_processed, 1);
  assert.equal((await poll('appointment_queue', 'reminder-again')).records_processed, 0);
  const moved = { ...apptBody, starts_at: new Date(Date.now() + 10800000).toISOString(), ends_at: new Date(Date.now() + 14400000).toISOString() };
  assert.equal((await intake('appointment_intake', 'reschedule', moved)).http_status, 200);
  assert.equal((await control.query("select count(*)::int n from public.operational_tasks where organization_id=$1 and review_status='cancelled'", [org])).rows[0].n, 1);
  assert.equal((await poll('appointment_queue', 'moved-reminder')).records_processed, 1);
  await control.query("update public.operational_tasks set review_status='completed' where organization_id=$1 and review_status='pending'", [org]);
  assert.equal((await poll('appointment_queue', 'completed-reminder')).records_processed, 0);
  assert((await control.query("select count(*)::int n from public.audit_log where organization_id=$1 and entity_type='operational_task'", [org])).rows[0].n >= 2);
  pass('cross-tenant appointments rejected; reschedules cancel pending reminders; completed work stays completed and transitions are audited');

  await control.query('begin');
  await control.query('alter table real_estate.leads disable trigger automation_lead_revision');
  await control.query("update real_estate.leads set updated_at=now()-interval '25 hours' where id=$1", [lead.entity_id]);
  await control.query('alter table real_estate.leads enable trigger automation_lead_revision');
  await control.query('commit');
  const overlap = await Promise.all([poll('lead_queue', 'overlap-a'), poll('lead_queue', 'overlap-b', null, other)]);
  assert.equal(overlap.reduce((sum, r) => sum + r.records_processed, 0), 1);
  const before = (await control.query('select automation_revision,updated_at from real_estate.leads where id=$1', [lead.entity_id])).rows[0];
  await intake('lead_intake', 'lead-noop', leadBody);
  const after = (await control.query('select automation_revision,updated_at from real_estate.leads where id=$1', [lead.entity_id])).rows[0];
  assert.deepEqual(after, before);
  assert.equal((await poll('lead_queue', 'lead-noop-poll')).records_processed, 0);
  pass('overlapping pollers create one task and no-op intake preserves meaningful revision');

  await control.query("insert into real_estate.listings(organization_id,status,source_system,external_id) select $1,'active','batch',g::text from generate_series(1,205) g", [org]);
  const batches = [];
  for (let i = 0; i < 3; i++) batches.push(await poll('listing_queue', `batch-${i}`));
  assert.deepEqual(batches.map(r => r.records_scanned), [100, 100, 6]);
  assert.equal((await poll('listing_queue', 'caught-up')).records_processed, 0);
  assert.equal((await poll('listing_queue', 'batch-0')).records_scanned, 100, 'Replay must return its committed result without advancing checkpoint');
  const fresh = await invoke('select automation.snapshot($1) result', [event('snapshot')]);
  assert.equal(fresh.counts.listings, 206);
  assert.equal(fresh.report_id, empty.report_id);
  pass('listing checkpoint processes more than 100 records without gaps; daily reruns update the same report including zero counts');

  const claimed = await invoke('select automation.claim_reports($1) result', [event('lead')]);
  assert.equal(claimed.payload.n8n_workflow_id, `${prefix}-lead_intake`);
  assert.equal(claimed.payload.entity_refs[0].entity_id, lead.entity_id);
  assert.equal(await invoke('select automation.claim_reports($1) result', [event('lead')], other), undefined);
  const pending = await invoke('select automation.finish_report($1,$2,503,false,3) result', [event('lead'), claimed.lease_token]);
  assert.equal(pending.report_status, 'pending');
  await control.query("update public.run_report_outbox set next_attempt_at=now() where event_id=$1", [event('lead')]);
  const retry = await invoke('select automation.claim_reports($1) result', [event('lead')]);
  assert.deepEqual(retry.payload, claimed.payload);
  await assert.rejects(invoke('select automation.finish_report($1,$2,200,true,1) result', [event('lead'), claimed.lease_token]), /stale/);
  assert.equal((await invoke('select automation.finish_report($1,$2,200,true,1) result', [event('lead'), retry.lease_token])).report_status, 'delivered');
  const rejected = await invoke('select automation.claim_reports($1) result', [event('bad')]);
  assert.equal((await invoke('select automation.finish_report($1,$2,401,false,1) result', [event('bad'), rejected.lease_token])).report_status, 'quarantined');
  assert.equal(await invoke('select automation.claim_reports($1) result', [event('bad')]), undefined);
  assert.equal((await intake('lead_intake', 'lead', leadBody)).entity_id, lead.entity_id);
  pass('outbox leases prevent overlapping sends, preserve origin and stable payload across recovery, reject stale acknowledgments and quarantine permanent errors');
  console.log(`${checks.length} operational automation test groups passed (local database only).`);
} finally {
  await control.query('alter role n8n_demo_executor nologin password null');
  await control.query('rollback');
  await control.query('delete from public.run_report_outbox where organization_id=$1', [org]);
  await control.query('delete from automation.workflow_bindings where n8n_workflow_id like $1', [`${prefix}%`]);
  await control.query('delete from automation.configuration where organization_id=$1', [org]);
  await control.query('delete from public.organizations where id=any($1::uuid[])', [[org, foreignOrg]]);
  await control.query('delete from auth.users where id=$1', [user]);
  await Promise.all([control.end(), db.end(), other.end()]);
}
