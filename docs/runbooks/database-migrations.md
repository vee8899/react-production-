# Runbook: database migrations

## Before changing SQL

1. Confirm the change belongs in a forward migration under `supabase/migrations/`.
2. Check whether the migration affects RLS, tenant ownership, `workflow_runs`, or compatibility data.
3. Update the relevant ADR or architecture document when the contract changes.

## Local checks

Prerequisites: Node.js 24 and installed npm dependencies for the inventory check; Docker, Supabase CLI, and a running disposable local database with migrations applied for executable database tests. Run commands from the repository root.

On a disposable local Supabase instance, start services and apply pending migrations without touching a linked remote project:

```powershell
npx.cmd --yes supabase start
npx.cmd --yes supabase migration up --local
```

Initial startup applies the migration chain; `migration up --local` brings an existing local instance forward. Confirm that this local instance is disposable before running tests that commit synthetic fixtures. Do not reset an existing database to set up these checks.

```powershell
npm.cmd run db:check
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
npm.cmd run db:test
```

`db:check` reads local migration files and validates environment inputs. Success means the expected inventory was found; it does not connect to Postgres, verify applied migrations, enforce RLS, or validate the CLI's linked target. `db:test` executes the local pgTAP suite and must report passing assertions. If the database is unavailable, record the test as blocked, not passed. See [RLS testing](rls-testing.md).

`db:test` also runs `db:test:ingestion` after pgTAP succeeds. This Node/Postgres suite uses two independent service-role sessions, proves lock overlap with `pg_blocking_pids`, and checks collision, rollback, and replay invariants across all five record sets. Its loopback URL and cleanup behavior are documented in [RLS testing](rls-testing.md). The HTTP handler tests run with `npm.cmd run test -- --run src/test/ingestRunHandler.test.ts` using the same Zod 3.23.8 validation version as the Edge Function.

## Staging procedure

1. Link the Supabase CLI or database MCP to staging only.
2. Run `npm.cmd run db:check`.
3. Run `npm.cmd run db:dry-run`.
4. Review destructive operations, backfills, constraints, and policy changes.
5. Apply the migration to staging.
6. Verify table inventory, RLS, indexes, RPC signatures, and canonical `workflow_runs` data.
7. Test tenant isolation with at least two accounts.
8. Deploy affected Edge Functions after the database migration succeeds.

`db:dry-run` invokes `supabase db push --dry-run` for the CLI's linked project. Confirm the link separately before invoking it; setting `SUPABASE_ENV` for `db:check` does not change the CLI target. Stop on an unexpected project, failed assertion, or unexplained destructive operation. Record the revision, environment, migration versions, dry-run output, and executable test results. A successful preview does not apply migrations or prove application behavior.

## Production procedure

Production requires an explicit review of the staging result. Apply the migration during a controlled window, capture the CLI output, and verify the application plus ingestion endpoint immediately afterward.

Never reset production, edit tables manually, or delete compatibility data as an untracked hotfix.

## Canonical run checks

- Existing `automation_runs` rows have corresponding `workflow_runs` rows.
- `automation_runs.workflow_run_id` is populated for migrated records.
- Duplicate `event_id` calls update one canonical run.
- A duplicate may not transfer canonical organization ownership or overwrite a compatibility record with a different client or organization. Such requests must return HTTP `409` / `event_id_conflict` after the handler update.
- Record the migration version, revision or uncommitted state, environment, row-invariance results, proven concurrent outcomes, and handler HTTP results. Source-contract checks alone are insufficient.
- A mismatched client and organization are rejected.
- Frontend reads continue to use `workflow_runs`.

For the ownership fix, apply `20260907000001_ingestion_ownership_guard.sql` before deploying `ingest-run`. The old handler may return `500` for protected collisions until updated. A handler rollback must retain the database guard. Fix database defects with a forward migration; never restore ownership-changing replay. The [phase tracker](../plans/reliability-hardening/README.md#phase-tracker) records actual local and staging evidence independently.

## Related

See `AGENT.md`, `README.md`, `docs/adrs/database.md`, and `docs/architecture/canonical-workflow-runs.md`.
