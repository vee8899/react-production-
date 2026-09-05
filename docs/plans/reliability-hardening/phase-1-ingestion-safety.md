# Phase 1: ingestion safety

Current status, owner, and verification evidence are maintained only in the [phase tracker](README.md#phase-tracker). Dated handoffs below are historical session records.

[Phase overview and tracker](README.md) | [Next: application reliability](phase-2-application-reliability.md)

## Outcome and prerequisites

An event replay may update its original owner's run, but may never transfer an existing event to another tenant or overwrite an incompatible client projection. Rejected ingestion must leave all records unchanged, including under concurrent requests.

Read the [ingestion specification](../../specs/automation-run-ingestion.md), [canonical run contract](../../architecture/canonical-workflow-runs.md), [database ADR](../../adrs/database.md), [migration runbook](../../runbooks/database-migrations.md), and [RLS testing runbook](../../runbooks/rls-testing.md).

Required tools are Node.js 24, installed npm dependencies, Docker, the Supabase CLI, and a disposable local Supabase database with the migration chain applied. Real Postgres execution is required; source-text assertions are insufficient. Staging execution additionally requires an explicitly identified staging environment and its operator credentials. No preceding implementation phase is required.

## Implementation checklist

- [ ] Capture the starting revision and working-tree state; inspect the current RPC, constraints, policies, and compatibility projection.
- [ ] Add a new forward migration replacing the ingestion RPC. Do not edit previously applied migrations or remove global event-ID uniqueness.
- [ ] Guard the canonical upsert with existing organization ownership and reject a conflicting event. Use database locking or an atomic conditional write, not an unlocked check followed by a write.
- [ ] Validate the existing compatibility record's client and organization before updating it. Reject mismatches in the same transaction.
- [ ] Reject before replacing child details; ensure exceptions roll back canonical changes, compatibility changes, steps, entity references, and audit writes together.
- [ ] Preserve same-owner replay, the existing run ID, and transactional replacement of child details.
- [ ] Map the database ownership-conflict signal to HTTP `409` and stable response code `event_id_conflict` in the Edge Function.
- [ ] Add executable database regression tests and HTTP handler/error-mapping tests. Establish a reproducible concurrent-request test against the disposable local database and record its command.
- [ ] Update authored documents, then refresh and review generated knowledge after implementation.

Entry points: [latest canonical ingestion migration](../../../supabase/migrations/20260716000001_canonical_workflow_runs.sql), [ingest-run handler](../../../supabase/functions/ingest-run/index.ts), [database tests](../../../supabase/tests/database/rls_isolation.sql), [current source-contract tests](../../../src/test/securityContracts.test.ts), and [staging ingestion acceptance](../../../scripts/staging-ingest-acceptance.ts). Source-contract tests may remain supplementary, but must not substitute for executing the new behavior.

## Contracts and decisions

Keep the request payload, global `event_id`, successful response shape, service-role-only RPC permissions, and webhook-secret authentication. The new public failure contract is HTTP `409` with `code: "event_id_conflict"` and a generic error message; it must not disclose another tenant's identifiers or records. Other failure classes retain their existing behavior.

Derive organization ownership from the incoming client as today. Validate both canonical ownership and any existing compatibility ownership. Do not silently repair historical ownership inconsistencies as part of replay; reject and record them for a separate data review. Do not change event keys to per-tenant uniqueness or retire the legacy table in this phase.

During a later authorized rollout, apply the ownership-guard migration before deploying the updated Edge Function. The old handler may return its generic database error while the new guard is present; the database must already prevent corruption. Rolling back the function must not remove the database guard. Correct database defects with a forward migration rather than restoring unsafe ownership behavior.

## Acceptance checklist

- [ ] A valid event creates one canonical run and the matching compatibility record and children.
- [ ] Same-owner replay returns the same run ID, creates no duplicate run, and replaces the expected child details.
- [ ] Reusing an event ID for a different tenant is rejected even when the incoming client and workflow otherwise form a valid pair.
- [ ] A compatibility record with a mismatched client or organization causes rejection and full rollback.
- [ ] Two independent concurrent database connections submit the same event ID for different tenants: exactly one owner wins, the other receives the conflict, and the stored run and all associated data remain consistent with the winner.
- [ ] Concurrent same-owner replay retains one run without partial or duplicated child replacement.
- [ ] Compare canonical, compatibility, step, entity, and audit records before and after rejected requests to prove they remain unchanged.
- [ ] HTTP tests execute the handler and verify the conflict response, existing success response, invalid secret handling, and generic non-conflict failures.
- [ ] Existing two-user and anonymous RLS checks pass, and browser roles cannot execute the ingestion RPC.
- [ ] Local lint, unit/handler tests, build, and actual database tests pass for the recorded revision.

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

- [ ] Update the ingestion specification with ownership-preserving replay and the `409` failure contract.
- [ ] Update the canonical run contract and database ADR with the canonical/compatibility ownership invariant and concurrency guarantee.
- [ ] Update migration and RLS runbooks with executable commands, migration-before-function order, and evidence requirements.
- [ ] Update staging acceptance guidance for conflict checks without claiming they have already run.
- [ ] Run `npm.cmd run refresh-ai` after the implementation changes and inspect the generated diff.

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
