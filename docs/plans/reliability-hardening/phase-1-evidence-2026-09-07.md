# Phase 1 evidence — 2026-09-07

This report retains the initial blocked session below. The later [resumed verification](#resumed-verification-2026-09-07) records successful local Postgres execution; current status is in the [phase tracker](README.md#phase-tracker).

Owner: Codex. Environment: Windows, Node.js `v24.16.0`, Supabase CLI `2.116.0`, Docker client `28.1.1` / Desktop `4.41.2`; no running database server. Starting commit: `10bb39e369c9039c56d7a229b4ee872cf48fc120`, initially clean working tree. Result is uncommitted implementation plus authored/generated documentation. Migration: `20260907000001_ingestion_ownership_guard.sql`, **not applied**.

## Implemented changes

- Forward RPC migration retains global event uniqueness and uses conditional upserts to protect canonical organization and compatibility client/organization ownership. Compatibility is checked before child replacement. The whole RPC rolls back on SQLSTATE `P4091`.
- The HTTP handler maps that signal to generic `409` / `event_id_conflict`; payload and successful response remain unchanged. Its extracted handler is tested with real Request/Response and exactly Zod 3.23.8; only environment and RPC are injected. Timer cleanup prevents completed requests retaining timeout timers.
- `db:test` chains the existing pgTAP RLS suite and the new Node/Postgres ingestion suite. The latter contains row-invariance assertions and lock-observed concurrency cases using independent sessions. These tests have **not executed against Postgres** in this session.
- Staging acceptance now requires two clients in different organizations, verifies a valid second-tenant event, and asserts collision status/body and stable replay run ID. No staging request was made.

## Recorded checks

Command results are from this task's tool output on 2026-09-07, against the uncommitted state based on the starting SHA above.

| Command | Exit / result |
| --- | --- |
| `npm.cmd run lint` | 0, passed |
| `npm.cmd run test -- --run` | 0, 125 tests across 27 files passed |
| `npm.cmd run test -- --run src/test/ingestRunHandler.test.ts src/test/securityContracts.test.ts` | 0, 25 tests across 2 files passed |
| `npm.cmd run test -- --run src/test/ingestRunHandler.test.ts` (final recheck) | 0, 13 tests passed, including conflict logging assertion |
| `npm.cmd run build` | 0, TypeScript and Vite build passed |
| `npm.cmd run db:check` | 0, inventory found 25 migrations; no target configured; no live database checks |
| `npm.cmd run db:test` | 1, local Postgres connection refused at `127.0.0.1:54322`; pgTAP assertions did not run and the chained ingestion suite was not reached |
| `npm.cmd run db:test:ingestion` | 1, `ECONNREFUSED` at `127.0.0.1:54322`; no fixtures created or assertions executed |
| `npm.cmd run refresh-ai` | 0, 292 files scanned/indexed; generated changes reviewed |

The full 125-test suite ran before the final conflict-log assertion was added; the final targeted handler recheck is recorded in the handoff. An initial compiler failure resolving the Deno Zod URL was fixed by mapping it to the same pinned npm package for TypeScript/Vitest; the subsequent build passed. The deployed Deno import remains unchanged.

HTTP tests exercise 200 success, 409 conflict with no private database details, 401 missing/invalid secret, 400 invalid JSON/schema, 405 non-POST, 500 configuration/unrelated database/transport failures, and 504 timeout. These are handler tests with an injected RPC, not deployed Edge Function or database integration results.

## Database blocker and operations attempted

Docker was stopped. Starting Docker Desktop failed. The backend startup log reports an inaccessible zero-byte `dockerInference` socket under Docker's local `run` directory and exits while initializing the inference manager. A reversible rename attempt on that exact socket also failed with “The file cannot be accessed by the system”; it did not change the file. No Docker factory reset, data deletion, configuration replacement, or database reset was performed.

Database setup and migration application were **not completed**. Commands to run after Docker is repaired, on a confirmed disposable local instance, are:

```powershell
npx.cmd --yes supabase start
npx.cmd --yes supabase migration up --local
npm.cmd run db:test
```

These are next actions, not successful commands from this session. Recheck the current working tree/revision and record applied migration versions, pgTAP output, row-invariance assertions, and observed concurrent outcomes before advancing Phase 1. If any regression fails, fix it and rerun relevant checks.

## Explicitly missing evidence

- Real Postgres migration execution, RLS assertions, RPC privilege assertions, ownership rejection, row invariance, and concurrency results.
- Staging dry-run and acceptance: no staging environment or operator credentials were identified. `db:dry-run` targets the linked project and was not run against an unknown environment.
- Deployed Edge Function tests, staging n8n acceptance, production changes, and live GitHub evidence.

Phase 1 is **blocked on local database verification**, not verified locally. Phase 2 remains unstarted. See the [tracker](README.md#phase-tracker) and [handoff](phase-1-ingestion-safety.md#handoff-2026-09-07).

## Resumed verification 2026-09-07

Owner: Codex. Resumed from clean commit `4ecf25b4cedde52a231f73b4c7b951b9be98d486`, which includes the preceding implementation. Docker was already running when this session resumed. Environment: Node.js `v24.16.0`, Docker engine `28.1.1` / Desktop `4.41.2`, PostgreSQL `17.6` in local container `supabase_db_iutycpnqlzxovffctjyz`, exposed at `127.0.0.1:54322`. No hosted project was targeted.

### Setup and migration evidence

Read-only Docker/psql inspection found the existing local database healthy, with zero client rows and 22 migrations applied through `20260720000001`. No start or reset was needed. `npx.cmd --yes supabase db push --local --dry-run` exited 0 and listed exactly the two September demo migrations and the Phase 1 ownership guard.

Before applying the guard, `npm.cmd run db:test:ingestion` exited 1 at the first cross-tenant collision: `Missing expected rejection: Expected SQLSTATE P4091`. Valid creation/replay passed first. This demonstrates that the regression test detects the pre-fix ownership behavior; it was an intentional negative test, not a final-suite failure.

`npx.cmd --yes supabase migration up --local` exited 0 and applied:

- `20260901000001_refresh_northstar_demo_examples.sql`
- `20260901000002_seed_northstar_30_day_workload.sql`
- `20260907000001_ingestion_ownership_guard.sql`

The two demo migrations skip their data changes without a provisioned demo account. Subsequent psql inspection confirmed 25 applied migrations, with latest version `20260907000001`. No migration contents or production grants were changed during verification.

### Runtime test correction and final results

The first post-migration `db:test` run passed all 17 pgTAP assertions and the first eight ingestion groups, then failed the concurrent legacy fixture with `42501: permission denied for table automation_runs`. That fixture simulated a direct historical write using `service_role`, which correctly has no direct INSERT grant. The test now uses `SET LOCAL ROLE postgres` for that fixture transaction only. All ingestion RPC calls still execute as `service_role`; transaction completion restores the fixture session's original role. The only executable source change from the resumed commit is this four-line test correction.

| Check | Final result |
| --- | --- |
| `npm.cmd run db:test` | Exit 0: 17 pgTAP assertions and all 9 ingestion groups passed; ingestion report timestamp `2026-09-07T05:17:51.794Z` |
| `npm.cmd run lint` | Exit 0, including recheck after the fixture correction |
| `npm.cmd run test -- --run` | Exit 0: 125 tests across 27 files, including 13 HTTP handler tests |
| `npm.cmd run build` | Exit 0, including recheck after the fixture correction |
| `npm.cmd run db:check` | Exit 0: 25-migration inventory; live application was independently verified with psql |

The full Vitest suite ran on the resumed commit; the subsequent source change only corrects the standalone database test fixture, which the successful `db:test` run exercised. Final lint/build cover that correction. These results apply to commit `4ecf25b4cedde52a231f73b4c7b951b9be98d486` plus the uncommitted fixture correction and documentation/generated-index updates.

### Proven database behavior

All nine ingestion groups passed on real Postgres:

1. Valid creation and same-owner replay retain the run ID and replace children completely.
2. Cross-tenant and same-organization/different-client collisions reject without changing any of the five record sets.
3. Independent compatibility client/org mismatches roll back canonical changes and preserve children/audit.
4. A legacy-only collision rolls back the new canonical row; the original owner can replay.
5. A late child failure rolls back canonical/projection changes, replacements, and new audit writes.
6. Cross-tenant client/workflow pairing remains rejected.
7. Two independent connections contend for the same event; both tenant winner orderings pass. The test observes blocking via `pg_blocking_pids`; the loser receives `P4091` and leaves winner data consistent.
8. Concurrent same-owner replay retains one run and one complete child replacement.
9. Concurrent privileged legacy insertion cannot be overwritten; rejected ingestion leaves the legacy row unchanged and no canonical, child, or audit residue.

The 17 pgTAP checks passed for both authenticated users, anonymous access, RLS write rejection, and RPC privileges. The HTTP handler tests passed for 200, generic 409, 401, 400, 405, 500, and 504 behavior; they use an injected RPC and are not deployed Edge Function integration tests.

Cleanup was checked separately with psql after the passing suite: clients, organizations, canonical runs, compatibility runs, steps, entity references, and audit rows all had count zero; no ingestion-test or Alice/Bob auth users remained.

All Phase 1 local acceptance criteria now have supporting evidence. Staging dry-run, staging/n8n acceptance, and deployed Edge Function checks remain **Not run** because no staging target or credentials were identified. No hosted migration or function deployment occurred. Phase 2 remains unstarted.
