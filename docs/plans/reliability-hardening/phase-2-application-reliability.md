# Phase 2: application reliability

Current status, owner, and verification evidence are maintained only in the [phase tracker](README.md#phase-tracker). Dated handoffs below are historical session records.

[Phase overview and tracker](README.md) | [Previous: ingestion safety](phase-1-ingestion-safety.md) | [Next: release safeguards](phase-3-release-safeguards.md)

## Outcome and prerequisites

Dashboard users can distinguish loading, no activity, failed requests, and stale results. Browser-called Edge Functions support preflight without weakening authentication. All three TypeScript projects enforce strict mode in their saved configurations.

Begin after phase 1 is verified locally. Read its handoff and reuse its executable endpoint-testing approach. Required tools are Node.js 24, installed npm dependencies, and the runtime/harness recorded in phase 1 for handler tests. Local browser checks require a browser and configured local test environment; live staging requires staging credentials and a dedicated demo tenant.

Read the [dashboard specification](../../specs/authenticated-client-dashboard.md), [demo runbook](../../runbooks/demo-workspace.md), [testing runbook](../../runbooks/testing.md), and the TypeScript, authentication, state, and API ADRs linked below.

## Implementation checklist

- [ ] Make the canonical metrics query throw on failure. Attempt snapshot fallback only after a successful response containing no canonical rows.
- [ ] Throw snapshot-query failures; return zero metrics only when both queries successfully return no rows.
- [ ] Expose loading, empty, failed, retry, and stale-data states in dashboard statistics, the demo summary, and the activity chart.
- [ ] Retain existing data after a failed background refresh and show a visible "Couldn't refresh" notice and retry action. Clear the notice after successful recovery.
- [ ] Add a shared CORS helper to the two browser endpoints, handling preflight before authentication and adding headers to every response path.
- [ ] Keep endpoint authentication and tenant checks intact; keep webhook/operator-only endpoints outside this CORS change.
- [ ] Use `finally` to restore demo controls after success, expected errors, and unexpected request or invalidation failures; display a useful error message.
- [ ] Enable `strict: true` in the app, node/scripts, and agents compiler projects without weakening types or suppressing errors.
- [ ] Add behavior tests and executable endpoint tests; replace reliance on mocked child-component text where it does not prove the changed behavior.
- [ ] Update authored documents and refresh generated knowledge after implementation.

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

- [ ] Canonical metrics data is displayed without requesting snapshots.
- [ ] A canonical-query failure becomes an error and does not request snapshots or show zero activity.
- [ ] Successful empty canonical data uses successful snapshot data; two empty successful responses produce genuine zero metrics.
- [ ] A failed snapshot query becomes an error instead of empty metrics.
- [ ] Statistics, demo summary, and chart correctly show initial loading, failure, and retry recovery.
- [ ] Cached data survives a failed refresh with a visible stale-data notice; recovery removes the notice.
- [ ] Changing the time window does not present data from another window as the current result.
- [ ] Both endpoints answer unauthenticated preflight without invoking auth or mutation dependencies.
- [ ] Executable handler tests verify CORS headers on success, invalid authentication, validation errors, forbidden tenant access, unsupported methods, and server failures.
- [ ] Authentication and tenant checks still reject unauthorized operations despite permissive origins.
- [ ] Demo controls become usable again after handler errors, thrown requests, and failed query invalidations.
- [ ] All three saved compiler configurations enforce strict mode; full lint, behavior/endpoint tests, and build pass.

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

- [ ] Update the dashboard specification with the loading, fallback, error, retry, and stale-data behavior.
- [ ] Update the demo runbook and [API ADR](../../adrs/api.md) with browser CORS and retained authorization boundaries.
- [ ] Update the [TypeScript ADR](../../adrs/typescript.md) from its documented non-strict baseline to the newly implemented strict configuration and record its verification.
- [ ] Review the rewritten [authentication ADR](../../adrs/authentication.md) and [state ADR](../../adrs/state.md) against the phase changes; update any changed claims and record the review. Their current maintenance rationale was documented in the separate documentation-semantics pass.
- [ ] Update testing guidance with executable handler-test commands, then run `npm.cmd run refresh-ai` and review the generated diff.

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
