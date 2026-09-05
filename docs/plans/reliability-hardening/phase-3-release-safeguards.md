# Phase 3: release safeguards

Current status, owner, and verification evidence are maintained only in the [phase tracker](README.md#phase-tracker). Dated handoffs below are historical session records.

[Phase overview and tracker](README.md) | [Previous: application reliability](phase-2-application-reliability.md)

## Outcome and prerequisites

Every automatic container publication from `main` depends on successful application, database, and endpoint verification of the same commit. Staging acceptance remains an explicit manual workflow with durable, sanitized results.

Begin after phases 1 and 2 are verified locally. Their executable database, concurrency, and endpoint tests must have recorded commands before they can become CI requirements. Required tools are Node.js 24, installed npm dependencies, Docker, and the Supabase CLI. GitHub execution additionally needs repository workflow access and the existing production environment configuration. Staging runs need a configured staging environment, synthetic fixtures, Chromium, and staging-only credentials.

Read the [release checklist](../../runbooks/release-checklist.md), [deployment runbook](../../runbooks/deployment.md), [staging acceptance runbook](../../runbooks/staging-acceptance.md), [environment guidance](../../environments.md), and [production launch checklist](../../runbooks/production-launch-checklist.md).

## Implementation checklist

- [ ] Extend PR and `main` CI to start an isolated local Supabase database, apply the migration chain, and execute the RLS, ingestion, and concurrency checks from phase 1.
- [ ] Run executable Edge Function tests from phases 1 and 2 alongside application lint, tests, and build. Use bounded job timeouts, record runtime versions, and clean up local services on failure as well as success.
- [ ] Keep PR verification independent of staging and production secrets; use disposable local fixture credentials only.
- [ ] Convert container publishing into a reusable workflow invoked only after successful verification jobs, on a push to `main`, for the exact tested commit.
- [ ] Remove the independent push/manual publishing triggers so there is no verification bypass.
- [ ] Prevent an older workflow finishing later from moving `latest` backward. Combine serialized publication with a current-`main` revision check immediately before promotion; serialization alone is not evidence of ordering safety.
- [ ] Preserve the image repository, SHA and `latest` tags, build arguments, production environment settings, and required scoped package permissions.
- [ ] Add a manually dispatched staging acceptance workflow with an explicit target revision and configured staging URLs. Record the application and function revisions actually deployed there rather than assuming that checkout selects the deployed system.
- [ ] Fail clearly when required staging configuration is missing; do not report required tests as passed when they skipped.
- [ ] Upload sanitized reports and results even after failure; prevent logs and artifacts from containing secrets or raw authenticated browser storage.
- [ ] Validate the workflow graph and failure paths, update authored runbooks, and refresh generated knowledge after implementation.

Entry points: [application CI](../../../.github/workflows/ci.yml), [container workflow](../../../.github/workflows/docker.yml), [Dockerfile](../../../Dockerfile), [database tests](../../../supabase/tests/database/rls_isolation.sql), [staging browser tests](../../../e2e/staging-smoke.spec.ts), [Playwright configuration](../../../playwright.config.ts), and [ingestion acceptance script](../../../scripts/staging-ingest-acceptance.ts).

## Contracts and decisions

Preserve automatic publishing after verified pushes to `main`; staging acceptance is not a new automatic publication gate. PR events and failed/cancelled verification must never publish. All verification and image building must reference the same SHA. Keep `ghcr.io/vee8899/automation-platform:latest` and the existing commit-SHA tag convention. Respect existing production environment protections; do not create or relax repository settings in this phase.

The manual staging workflow covers browser and ingestion acceptance. Required existing inputs include `STAGING_APP_URL`, `STAGING_TEST_EMAIL`, `STAGING_TEST_PASSWORD`, `STAGING_SUPABASE_URL`, `STAGING_WEBHOOK_SECRET`, and `STAGING_CLIENT_ID`. Use an explicit `STAGING_ORGANIZATION_ID` and a second synthetic client/organization for the cross-tenant assertions developed in phase 1. Record those additional input names in the workflow and staging runbook together. Browser demo coverage needs the dedicated demo account established in phase 2.

If alert-route acceptance is included in the recorded staging suite, require its existing integration and user-token variables rather than silently skipping that check. Use environment secrets for credentials and environment variables for public configuration; documentation records names only. Serialize staging runs that share fixtures.

Keep the existing invitation endpoint acceptance and inbox confirmation operator-run. The manual staging workflow must not send invitation emails implicitly. Invitation evidence uses the [invite acceptance script](../../../scripts/staging-invite-acceptance.ts) and the existing runbook when explicitly initiated by an operator.

Publishing an image is not production deployment. Do not apply remote migrations, deploy functions, configure secrets, or provision environments automatically as part of this phase. A missing staging environment blocks staging evidence, not local workflow validation; record the distinction.

## Acceptance checklist

- [ ] On a PR, application, real database, concurrency, and endpoint checks execute without production credentials, and no publish job is eligible.
- [ ] A deliberately failing application check prevents publication.
- [ ] A deliberately failing database or endpoint check prevents publication.
- [ ] A cancelled or skipped required verification job cannot result in publication.
- [ ] A successful push to `main` makes publication eligible only for the verified SHA and preserves its SHA tag and existing build settings.
- [ ] Overlapping old/new `main` runs cannot regress `latest`; demonstrate the older-run scenario, not just a concurrency declaration.
- [ ] No independent workflow trigger or alternate job bypasses verification.
- [ ] The manually triggered staging workflow rejects missing required credentials, fixtures, or target metadata instead of silently skipping required acceptance.
- [ ] Reports are retained on success and failure, identify the tested/deployed revisions, and exclude credentials and sensitive browser state.
- [ ] Invite delivery remains an explicit operator action and its inbox check is not represented as automated proof.
- [ ] Local workflow validation and all verification commands wired into the workflow pass; live GitHub and staging outcomes are recorded separately.

Run the existing verification commands from the repository root with the disposable local database available:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
npm.cmd run db:check
npm.cmd run db:test
```

Also execute the handler and concurrency commands recorded by phases 1 and 2. Validate YAML and workflow semantics, including job dependencies, event conditions, permissions, and SHA propagation. Record the workflow validator/version and exact command introduced for this purpose; the repository currently has no dedicated workflow-validation npm script. Do not claim that ordinary ESLint validates GitHub Actions semantics.

Once staging prerequisites and deployed revisions have been verified, the manual workflow runs the existing commands and their phase-specific expanded assertions:

```powershell
npm.cmd run test:e2e:staging
npm.cmd run acceptance:ingest:staging
```

Record evidence in two groups: local validation/rehearsal of every publishing eligibility case, and actual GitHub run URLs/image digests or staging reports when available. Local validation alone cannot prove that an image was published or that hosted environment protections work.

**Exit condition:** workflow validation demonstrates the eligibility and failure behavior above, including same-commit gating and protection against an older `latest`, and all commands it wires into verification pass locally. Set local status to Verified locally only with that evidence. Live GitHub and staging statuses remain Not run or Blocked until their own checks run; they do not inherit the local result.

## Documentation updates

- [ ] Update the release checklist, deployment runbook, and [deployment ADR](../../adrs/deployment.md) with the dependency chain, same-SHA requirement, tag ordering protection, and distinction between publication and deployment.
- [ ] Update staging acceptance guidance with workflow dispatch, required variable names, deployed-revision checks, fixture isolation, and report locations.
- [ ] Update the root [README](../../../README.md) CI description and testing/RLS guidance to match actual commands and jobs.
- [ ] Record current evidence separately from historical launch-checklist results; do not mark old launch blockers resolved merely because workflows now exist.
- [ ] Run `npm.cmd run refresh-ai` after implementation and review the generated diff.

## Session handoff

Append the [shared handoff template](README.md) after each implementation session.

Initial handoff, 2026-09-05:

- Owner: unassigned. Implementation status: Not started.
- Completed work: phase design only; no workflow or publishing changes.
- Remaining work: all implementation and acceptance checklists above.
- Commands/results and evidence: no phase workflow, GitHub, publication, or staging acceptance evidence exists.
- Skipped checks: all phase checks, because implementation has not started.
- Dependencies: verified phases 1 and 2, including reproducible database, concurrency, and handler-test commands.
- Decisions: keep automatic publishing from `main`; require same-commit verification; keep staging manually triggered.
- Staging verification / live GitHub evidence: Not run / Not run. Follow-up owner: next phase implementer; environment and release operations owner remains unassigned.
- Exact next action: read both verified phase handoffs, capture the current revision, and map their executable test commands into a CI dependency graph before changing publishing triggers.
