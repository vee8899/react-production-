# Runbook: RLS isolation tests

The executable database isolation tests live in
`supabase/tests/database/rls_isolation.sql`. They use Supabase's pgTAP runner
and exercise real policies with two users, two organizations, and an anonymous
role.

Prerequisites:

- Docker Desktop running
- Supabase CLI available through `npx`

Run from the repository root:

```powershell
npm.cmd run db:test
```

The test verifies that tenant users can read only their own organizations,
memberships, clients, workflows, and runs. It also verifies that cross-tenant
membership writes and anonymous workflow writes are rejected. Both Alice and
Bob execute read checks, and database privilege checks verify that anonymous
and authenticated roles cannot execute ingestion while `service_role` can.

The test runs in a transaction and rolls its fixtures back, so it does not
modify a persistent local database.

## Ingestion safety and concurrency

After pgTAP, `db:test` runs `scripts/test-ingestion-database.ts`. To run only this suite:

```powershell
npm.cmd run db:test:ingestion
```

Use the disposable local Supabase instance from the [migration runbook](database-migrations.md). The suite defaults to `postgresql://postgres:postgres@127.0.0.1:54322/postgres`; for a different local port or credentials, set `LOCAL_INGEST_DATABASE_URL` to its Postgres URL. Only loopback hosts are accepted. Never point a local tunnel at a hosted database for these tests. Keep credentials out of committed evidence.

Unlike the pgTAP RLS suite, ingestion tests commit uniquely named synthetic fixtures so two independent connections can see them. They remove their event, audit, user, and organization fixtures in `finally`. An interrupted process may leave fixtures named `ingestion-test-*`; review the exact test identifiers before cleaning those up on the disposable database.

The suite checks valid creation, same-owner replay, cross-tenant collisions with valid client/workflow pairs, a different client in the same organization, independently inconsistent compatibility client and organization, legacy-only records, and rollback after a late child failure. It compares canonical, compatibility, step, entity, and audit rows before/after rejection.

Concurrency checks hold the first transaction open and require `pg_blocking_pids` to prove that the second session is waiting on it before committing. Both tenant winner orderings, concurrent same-owner replay, and a concurrent legacy insert are covered. Statements have a 15-second timeout; absence of observed overlap fails the test. Successful calls retain audit history; rejected calls must add no audit records.

Record command exit codes, check output, environment, migration version, and tested revision or uncommitted state. A connection failure or unexecuted concurrency suite blocks verification. See the [Phase 1 handoff](../plans/reliability-hardening/phase-1-ingestion-safety.md#session-handoff) for current evidence.
