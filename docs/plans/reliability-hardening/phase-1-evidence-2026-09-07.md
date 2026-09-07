# Phase 1 evidence — 2026-09-07

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
