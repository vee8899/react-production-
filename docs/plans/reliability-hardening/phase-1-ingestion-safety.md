# Phase 1: ingestion safety

Current status, owner, and verification evidence are maintained only in the [phase tracker](README.md#phase-tracker). Dated handoffs below are historical session records.

[Phase overview and tracker](README.md) | [Next: application reliability](phase-2-application-reliability.md)

## Outcome and prerequisites

An event replay may update its original owner's run, but may never transfer an existing event to another tenant or overwrite an incompatible client projection. Rejected ingestion must leave all records unchanged, including under concurrent requests.

Read the [ingestion specification](../../specs/automation-run-ingestion.md), [canonical run contract](../../architecture/canonical-workflow-runs.md), [database ADR](../../adrs/database.md), [migration runbook](../../runbooks/database-migrations.md), and [RLS testing runbook](../../runbooks/rls-testing.md).

Required tools are Node.js 24, installed npm dependencies, Docker, the Supabase CLI, and a disposable local Supabase database with the migration chain applied. Real Postgres execution is required; source-text assertions are insufficient. Staging execution additionally requires an explicitly identified staging environment and its operator credentials. No preceding implementation phase is required.

## Implementation checklist

- [x] Capture the starting revision and working-tree state; inspect the current RPC, constraints, policies, and compatibility projection.
- [x] Add a new forward migration replacing the ingestion RPC. Do not edit previously applied migrations or remove global event-ID uniqueness.
- [x] Guard the canonical upsert with existing organization ownership and reject a conflicting event. Use database locking or an atomic conditional write, not an unlocked check followed by a write.
- [x] Validate the existing compatibility record's client and organization before updating it. Reject mismatches in the same transaction.
- [x] Reject before replacing child details; ensure exceptions roll back canonical changes, compatibility changes, steps, entity references, and audit writes together.
- [x] Preserve same-owner replay, the existing run ID, and transactional replacement of child details.
- [x] Map the database ownership-conflict signal to HTTP `409` and stable response code `event_id_conflict` in the Edge Function.
- [x] Add executable database regression tests and HTTP handler/error-mapping tests, including a reproducible concurrency command (`npm.cmd run db:test:ingestion`). Real Postgres and concurrency execution passed; see the verification handoff.
- [x] Update authored documents, then refresh and review generated knowledge after implementation.

Entry points: [ownership-guard migration](../../../supabase/migrations/20260907000001_ingestion_ownership_guard.sql), [ingest-run handler](../../../supabase/functions/ingest-run/index.ts), [database tests](../../../supabase/tests/database/rls_isolation.sql), [current source-contract tests](../../../src/test/securityContracts.test.ts), and [staging ingestion acceptance](../../../scripts/staging-ingest-acceptance.ts). Source-contract tests may remain supplementary, but must not substitute for executing the new behavior.

## Contracts and decisions

Keep the request payload, global `event_id`, successful response shape, service-role-only RPC permissions, and webhook-secret authentication. The new public failure contract is HTTP `409` with `code: "event_id_conflict"` and a generic error message; it must not disclose another tenant's identifiers or records. Other failure classes retain their existing behavior.

Derive organization ownership from the incoming client as today. Validate both canonical ownership and any existing compatibility ownership. Do not silently repair historical ownership inconsistencies as part of replay; reject and record them for a separate data review. Do not change event keys to per-tenant uniqueness or retire the legacy table in this phase.

During a later authorized rollout, apply the ownership-guard migration before deploying the updated Edge Function. The old handler may return its generic database error while the new guard is present; the database must already prevent corruption. Rolling back the function must not remove the database guard. Correct database defects with a forward migration rather than restoring unsafe ownership behavior.

## Acceptance checklist

- [x] A valid event creates one canonical run and the matching compatibility record and children.
- [x] Same-owner replay returns the same run ID, creates no duplicate run, and replaces the expected child details.
- [x] Reusing an event ID for a different tenant is rejected even when the incoming client and workflow otherwise form a valid pair.
- [x] A compatibility record with a mismatched client or organization causes rejection and full rollback.
- [x] Two independent concurrent database connections submit the same event ID for different tenants: exactly one owner wins, the other receives the conflict, and the stored run and all associated data remain consistent with the winner.
- [x] Concurrent same-owner replay retains one run without partial or duplicated child replacement.
- [x] Compare canonical, compatibility, step, entity, and audit records before and after rejected requests to prove they remain unchanged.
- [x] HTTP tests execute the handler and verify the conflict response, existing success response, invalid secret handling, and generic non-conflict failures.
- [x] Existing two-user and anonymous RLS checks pass, and browser roles cannot execute the ingestion RPC.
- [x] Local lint, unit/handler tests, build, and actual database tests pass for the recorded revision.

Run from the repository root after local database setup:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
npm.cmd run db:check
npm.cmd run db:test
```

`db:check` checks the migration inventory and environment inputs; it is not live database proof. `db:test` requires a running local database. Record the setup and migration-application commands used for that disposable database, plus the new concurrency and handler-test commands if they are not included in the existing suite. Do not label a proposed test command as available until it is implemented.

Before applying a migration to a linked staging project, confirm the target using the [environment guidance](../../environments.md) and review `npm.cmd run db:dry-run`; that script uses the linked project and must not be run against an unknown target. Later staging acceptance uses `npm.cmd run acceptance:ingest:staging` with the documented staging variables and added collision assertions.

Evidence must identify the revision, migration version, environment, test reports, row-invariance assertions, concurrent results, and HTTP statuses. Keep fixture identifiers synthetic and reports sanitized.

**Exit condition:** every local acceptance item passes, including executable Postgres and concurrency tests. An unavailable database or missing concurrency evidence blocks local verification. Staging remains separately tracked and does not imply deployment.

## Documentation updates

- [x] Update the ingestion specification with ownership-preserving replay and the `409` failure contract.
- [x] Update the canonical run contract and database ADR with the canonical/compatibility ownership invariant and concurrency guarantee.
- [x] Update migration and RLS runbooks with executable commands, migration-before-function order, and evidence requirements.
- [x] Update staging acceptance guidance for conflict checks without claiming they have already run.
- [x] Run `npm.cmd run refresh-ai` after the implementation changes and inspect the generated diff.

## Session handoff

Append the [shared handoff template](README.md) after each implementation session.

Initial handoff, 2026-09-05:

- Owner: unassigned. Implementation status: Not started.
- Completed work: phase design only; no migration or handler changes.
- Remaining work: all implementation and acceptance checklists above.
- Commands/results and evidence: see the separate review baseline in the overview; no phase acceptance evidence exists.
- Skipped checks: all phase checks, because implementation has not started. No runtime failure has been established in this documentation task.
- Decisions: preserve global event IDs; reject ownership collisions; preserve valid same-owner replay.
- Staging verification: Not run. Follow-up owner: next phase implementer.
- Exact next action: capture `git rev-parse HEAD` and `git status --short`, inspect both run-table ownership paths, and establish the disposable local database before writing the regression tests and forward migration.

### Handoff 2026-09-07

- Date / owner: 2026-09-07 / Codex.
- Phase / local status: Phase 1; Blocked on executable local database verification. Implementation is present; database behavior and concurrency are not yet verified.
- Starting commit SHA: `10bb39e369c9039c56d7a229b4ee872cf48fc120`; clean working tree.
- Result / working-tree state: uncommitted changes. New files are migration `20260907000001_ingestion_ownership_guard.sql`, `supabase/functions/ingest-run/handler.ts`, `src/test/ingestRunHandler.test.ts`, `scripts/test-ingestion-database.ts`, and the [evidence report](phase-1-evidence-2026-09-07.md). Modified implementation/configuration files: `supabase/functions/ingest-run/index.ts`, `supabase/tests/database/rls_isolation.sql`, `scripts/staging-ingest-acceptance.ts`, `src/test/securityContracts.test.ts`, `package.json`, `package-lock.json`, `tsconfig.app.json`, and `vitest.config.ts`. Authored changes: root README, ingestion spec, canonical contract, database ADR, migration/RLS/staging runbooks, and this phase's tracker/guide. Generated changes: five `docs/knowledge-base/` pages and six `outputs/repo-index/` JSON files.
- Completed work: atomic canonical and compatibility ownership guards; generic HTTP 409 mapping; 13 executable handler tests; a local multi-connection ingestion regression suite; expanded two-user/anonymous RLS and RPC privilege assertions; staging collision assertions; authored documentation and generated knowledge refresh.
- Remaining work: repair Docker startup, establish the disposable local Supabase database, apply the migration chain, and run all database acceptance checks. Fix any runtime failures before marking Phase 1 verified locally. Phase 2 has not started.
- Commands/results: lint exit 0; full Vitest exit 0 (125 tests / 27 files); final targeted handler recheck exit 0 (13 tests); final TypeScript/Vite build exit 0; `db:check` exit 0 (25 migrations, inventory only); `refresh-ai` exit 0 (292 files scanned/indexed). Generated diffs were reviewed; source scanner losing the inline `supabase.rpc` text match after dependency extraction is expected and does not imply the endpoint was removed.
- Database commands: `db:test` and `db:test:ingestion` both exit 1 because local Postgres at `127.0.0.1:54322` refuses connections. No fixtures, pgTAP assertions, row-invariance assertions, or concurrency cases executed. No migration was applied.
- Evidence / timestamps: [sanitized report dated 2026-09-07](phase-1-evidence-2026-09-07.md), plus command outputs in this task. Evidence is for the uncommitted state based on the starting SHA, not a new commit or deployment.
- Skipped checks: linked staging dry-run and staging acceptance, because no staging target/credentials were identified. Deployed Edge Function and n8n acceptance were not run. No production or live GitHub operation was performed.
- Failure / blocker: Docker Desktop crashes while initializing its inference manager because its `dockerInference` socket cannot be accessed. Starting Docker and a reversible rename of the exact stale socket failed; no factory reset or data removal was attempted.
- Documentation decisions: implement the previously approved ownership-preserving replay contract; global event IDs and webhook-secret/service-role boundaries remain. Successful replay still appends audit history. Update compatibility `workflow_id` along with the accepted canonical replay so both records point to the same validated workflow. RPC signature/table schema remain unchanged. Test dependencies pin the same Zod 3.23.8 used by Deno; pg is development-only.
- Staging verification / live GitHub evidence: Not run / Not applicable.
- Follow-up owner: next Phase 1 implementer, with host operator assistance for Docker repair.
- Exact next action: restore a healthy Docker engine without resetting existing data, then on a confirmed disposable local instance run `npx.cmd --yes supabase start`, `npx.cmd --yes supabase migration up --local`, and `npm.cmd run db:test`. Record applied versions, all assertions, and observed concurrent outcomes before updating the tracker.


### Verification handoff 2026-09-07

- Date / owner: 2026-09-07 / Codex.
- Phase / local status: Phase 1; Verified locally. Docker/Postgres blocker is resolved.
- Starting commit SHA: `4ecf25b4cedde52a231f73b4c7b951b9be98d486`; clean working tree, including the previously committed Phase 1 implementation.
- Result / working-tree state: uncommitted four-line fixture correction in `scripts/test-ingestion-database.ts`, updated RLS runbook and Phase 1 tracker/guide/evidence, plus generated repository-index changes. No application or migration changes.
- Completed work: verified the regression fails before the guard, previewed/applied the three pending migrations locally, passed 17 pgTAP assertions and all 9 ingestion groups on Postgres 17.6, and confirmed complete fixture cleanup. Both tenant winner orderings, concurrent same-owner replay, and privileged legacy insertion were exercised with observed connection blocking.
- Commands/results: local dry-run and migration application exit 0; final `db:test` exit 0; lint, 125 unit/handler tests, build, and `db:check` exit 0. Lint/build were rechecked after the fixture correction. See [resumed evidence](phase-1-evidence-2026-09-07.md#resumed-verification-2026-09-07) for commands, environments, before/after results, and timestamp.
- Failure corrected: the legacy-write fixture initially used service_role for a direct INSERT without a grant. It now uses transaction-local postgres privileges for the historical fixture only; all ingestion calls remain service-role calls. No production grants were broadened.
- Remaining work: none for local Phase 1 acceptance. Staging verification remains separate; Phase 2 has not started.
- Skipped checks: linked staging dry-run, staging/n8n acceptance, deployed Edge Function integration, and live GitHub operations; no staging target/credentials were identified and no hosted rollout was requested.
- Documentation decisions: retain the earlier blocked session as history; update the tracker and local acceptance evidence. Clarify the privileged fixture setup in the RLS runbook.
- Staging verification / live GitHub evidence: Not run / Not applicable.
- Follow-up owner: next phase implementer; staging operator for a separately authorized rollout.
- Exact next action: Phase 2 may begin when requested, using its phase document. For a later authorized staging rollout, confirm the target, apply the ownership migration before deploying the handler, and run staging acceptance.
