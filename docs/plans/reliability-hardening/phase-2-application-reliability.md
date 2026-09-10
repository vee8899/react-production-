# Phase 2: application reliability

Current status, owner, and verification evidence are maintained only in the [phase tracker](README.md#phase-tracker). Dated handoffs below are historical session records.

[Phase overview and tracker](README.md) | [Previous: ingestion safety](phase-1-ingestion-safety.md) | [Next: release safeguards](phase-3-release-safeguards.md)

## Outcome and prerequisites

Dashboard users can distinguish loading, no activity, failed requests, and stale results. Browser-called Edge Functions support preflight without weakening authentication. All three TypeScript projects enforce strict mode in their saved configurations.

Begin after phase 1 is verified locally. Read its handoff and reuse its executable endpoint-testing approach. Required tools are Node.js 24, installed npm dependencies, and the runtime/harness recorded in phase 1 for handler tests. Local browser checks require a browser and configured local test environment; live staging requires staging credentials and a dedicated demo tenant.

Read the [dashboard specification](../../specs/authenticated-client-dashboard.md), [demo runbook](../../runbooks/demo-workspace.md), [testing runbook](../../runbooks/testing.md), and the TypeScript, authentication, state, and API ADRs linked below.

## Implementation checklist

- [x] Make the canonical metrics query throw on failure. Attempt snapshot fallback only after a successful response containing no canonical rows.
- [x] Throw snapshot-query failures; return zero metrics only when both queries successfully return no rows.
- [x] Expose loading, empty, failed, retry, and stale-data states in dashboard statistics, the demo summary, and the activity chart.
- [x] Retain existing data after a failed background refresh and show a visible "Couldn't refresh" notice and retry action. Clear the notice after successful recovery.
- [x] Add a shared CORS helper to the two browser endpoints, handling preflight before authentication and adding headers to every response path.
- [x] Keep endpoint authentication and tenant checks intact; keep webhook/operator-only endpoints outside this CORS change.
- [x] Use `finally` to restore demo controls after success, expected errors, and unexpected request or invalidation failures; display a useful error message.
- [x] Enable `strict: true` in the app, node/scripts, and agents compiler projects without weakening types or suppressing errors.
- [x] Add behavior tests and executable endpoint tests; replace reliance on mocked child-component text where it does not prove the changed behavior.
- [x] Update authored documents and refresh generated knowledge after implementation.

Entry points: [metrics hook](../../../src/hooks/useDashboardMetrics.ts), [timeline hook](../../../src/hooks/useRunsTimeline.ts), [statistics](../../../src/components/dashboard/StatsRow.tsx), [activity chart](../../../src/components/dashboard/Sparkline.tsx), [demo page](../../../src/pages/DemoPage.tsx), [demo endpoint](../../../supabase/functions/demo-event/index.ts), and [alert-route endpoint](../../../supabase/functions/configure-alert-route/index.ts).

Compiler projects: [app](../../../tsconfig.app.json), [node/scripts](../../../tsconfig.node.json), and [agents](../../../tsconfig.agents.json). Existing test entry points include [metrics tests](../../../src/test/useDashboardMetrics.test.tsx) and [dashboard tests](../../../src/test/DashboardPage.test.tsx).

## Contracts and decisions

| Data condition | Intended presentation |
| --- | --- |
| Initial request pending, no cached data | Loading state; do not display invented zero activity |
| Successful query with data | Existing statistics/chart behavior |
| Canonical query succeeds empty | Metrics may use successful snapshot fallback; the chart retains its canonical source |
| Successful empty final result | Genuine zero/empty state |
| Initial query fails, no cached data | Visible error and retry action |
| Background refresh fails with cached data | Retain data, label it as unable to refresh, and offer retry |

Keep current metric definitions, snapshot calculations, polling intervals, and time windows. Do not introduce new health scoring, aggregate RPCs, or a chart redesign. Keep existing hook signatures and metric data types unless a minimal change is necessary to express these states; prefer React Query's existing error/loading/refetch state.

For `demo-event` and `configure-alert-route`, return HTTP `204` for `OPTIONS` before reading credentials. Allow `POST` and `OPTIONS`, with `authorization`, `apikey`, `content-type`, and `x-client-info` request headers. Use `Access-Control-Allow-Origin: *` without credentialed cookies. Include the CORS headers on both success and error responses; bearer authentication and organization/demo authorization remain required for actual operations. Do not add CORS to `ingest-run` or `invite-client` in this phase.

## Acceptance checklist

- [x] Canonical metrics data is displayed without requesting snapshots.
- [x] A canonical-query failure becomes an error and does not request snapshots or show zero activity.
- [x] Successful empty canonical data uses successful snapshot data; two empty successful responses produce genuine zero metrics.
- [x] A failed snapshot query becomes an error instead of empty metrics.
- [x] Statistics, demo summary, and chart correctly show initial loading, failure, and retry recovery.
- [x] Cached data survives a failed refresh with a visible stale-data notice; recovery removes the notice.
- [x] Changing the time window does not present data from another window as the current result.
- [x] Both endpoints answer unauthenticated preflight without invoking auth or mutation dependencies.
- [x] Executable handler tests verify CORS headers on success, invalid authentication, validation errors, forbidden tenant access, unsupported methods, and server failures.
- [x] Authentication and tenant checks still reject unauthorized operations despite permissive origins.
- [x] Demo controls become usable again after handler errors, thrown requests, and failed query invalidations.
- [x] All three saved compiler configurations enforce strict mode; full lint, behavior/endpoint tests, and build pass.

Run from the repository root:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
npm.cmd run agents:typecheck
```

The build already references all three compiler projects. Independently verify strict checking if needed with the existing local compiler:

```powershell
& .\node_modules\.bin\tsc.cmd -p tsconfig.app.json --strict --noEmit --incremental false --pretty false
& .\node_modules\.bin\tsc.cmd -p tsconfig.node.json --strict --noEmit --incremental false --pretty false
& .\node_modules\.bin\tsc.cmd -p tsconfig.agents.json --strict --noEmit --incremental false --pretty false
```

Record the endpoint-harness command established in phase 1 and the expanded test cases; these compiler commands do not type-check Deno Edge Functions. For later live browser verification, use `npm.cmd run test:e2e:staging` after configuring the [staging prerequisites](../../runbooks/staging-acceptance.md), and extend coverage to the demo event flow so a real browser exercises CORS. Keep staging status Not run until there is evidence from that environment.

Evidence must identify the tested revision, test report and scenario results, compiler results, and any browser observations. Test initial failures and refresh failures separately; a page test containing hard-coded mocked statistics is not proof of metrics correctness.

**Exit condition:** all behavior and endpoint acceptance tests, lint, strict type checking, and production build pass locally. Missing endpoint execution is a blocker. Live browser/staging evidence is recorded separately.

## Documentation updates

- [x] Update the dashboard specification with the loading, fallback, error, retry, and stale-data behavior.
- [x] Update the demo runbook and [API ADR](../../adrs/api.md) with browser CORS and retained authorization boundaries.
- [x] Update the [TypeScript ADR](../../adrs/typescript.md) from its documented non-strict baseline to the newly implemented strict configuration and record its verification.
- [x] Review the rewritten [authentication ADR](../../adrs/authentication.md) and [state ADR](../../adrs/state.md) against the phase changes; update any changed claims and record the review. Their current maintenance rationale was documented in the separate documentation-semantics pass.
- [x] Update testing guidance with executable handler-test commands, then run `npm.cmd run refresh-ai` and review the generated diff.

## Session handoff

Append the [shared handoff template](README.md) after each implementation session.

Initial handoff, 2026-09-05:

- Owner: unassigned. Implementation status: Not started.
- Completed work: phase design only; no application or compiler changes.
- Remaining work: all implementation and acceptance checklists above.
- Commands/results and evidence: the review's strict checks passed as a baseline; no phase acceptance evidence exists.
- Skipped checks: all phase checks, because implementation has not started.
- Dependencies: phase 1 must be verified locally and provide its endpoint-test harness and command.
- Decisions: preserve metric semantics and time windows; keep snapshot fallback only after successful empty canonical queries; preserve bearer authorization.
- Staging verification: Not run. Follow-up owner: next phase implementer.
- Exact next action: read the verified phase-1 handoff, capture the current revision and working tree, and add metrics failure/fallback regression tests before changing the hook and its consumers.

### Verification handoff 2026-09-10

- Date / owner: 2026-09-10 / Codex.
- Phase / local status: Phase 2; Verified locally. Current status is maintained in the overview tracker.
- Starting commit SHA: `9ff58b60e559a14a892635aa8d414a91b40e6492`; clean working tree.
- Result / working-tree state: uncommitted Phase 2 implementation, tests, configuration, authored documentation, and generated knowledge/index updates. The [evidence report](phase-2-evidence-2026-09-10.md) lists changed implementation and test files; no commit or deployment was performed.
- Completed work: query failure/fallback correction; initial, empty, retry, and cached-refresh states in all three consumers; finally-protected demo controls; shared CORS and executable browser handlers; strict mode in all three projects; regression/endpoint tests; staging demo browser test; authored documentation and generated refresh.
- Remaining work: none for local Phase 2 acceptance. Live browser and staging verification are separate and have not run.
- Commands/results/environment: Node 24.16.0 on Windows; lint, 181 tests across 29 files, build, agents:typecheck, and three independent strict compiler checks all exit 0. Both new metrics failure regressions failed before the hook fix and passed afterward. Full commands/scenarios are recorded in the evidence report.
- Evidence / timestamp: [sanitized report dated 2026-09-10](phase-2-evidence-2026-09-10.md), recorded at 06:15 UTC following compiler verification, with subsequent documentation-generation results recorded there.
- Skipped checks: live browser/staging (no configured staging variables or authenticated local browser session), Deno gateway/deployment (Node handler execution only), database/RLS/n8n acceptance (no changes to those boundaries), and live GitHub/publishing/production operations (outside local phase scope).
- Failures/blockers: none remain for local acceptance. Strict diagnostics during implementation were corrected before verification.
- Documentation decisions: implement the approved Phase 2 contract; correct the nullable ingestion argument type to match SQL; retain metric semantics and server authorization. API, TypeScript, authentication, and state ADRs were reviewed and updated without changing session or route behavior.
- Staging verification / live GitHub evidence: Not run / Not applicable.
- Follow-up owner: next Phase 3 implementer; staging operator for later hosted acceptance.
- Exact next action: Phase 3 may begin when requested. For separate staging acceptance, deploy the browser handlers to the confirmed staging target, prepare the dedicated demo account and integrations, and execute the staging browser checks.
