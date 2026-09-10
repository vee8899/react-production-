# Feature spec: Authenticated client dashboard

Status: required behavior. The criteria below define expectations, not a claim that all paths have passed runtime verification.

## Purpose

Give an authenticated client a clear view of subscribed services, workflow activity, run outcomes, and business metrics.

## Data sources

- `clients` identifies the authenticated client and organization.
- `client_services` controls service visibility.
- `workflows` contains configured automations.
- `workflow_runs` is the canonical execution source.
- `analytics_snapshots` provides aggregate historical metrics.
- Real-estate metrics are read from the `real_estate` schema.

## Security rules

- The user must have an authenticated Supabase session.
- Queries are scoped by `organization_id` and enforced by RLS.
- The dashboard never reads `automation_runs` as its normal path.
- Secrets and service-role credentials never enter browser code.

## Required states

- Loading state.
- Empty state when no workflows or runs exist.
- Error state that does not expose database or secret details.
- Paused or disconnected service state.
- Successful workflow activity state.
- Failed and partially completed run state.

Statistics, the demo workflow summary, and the canonical activity chart distinguish initial loading from successful empty results. An initial failure shows a generic error and a retry button without invented zero activity. A failed background refresh keeps the cached result for the same organization and time window, shows "Couldn't refresh", and offers retry; a successful recovery removes that notice. Changing the selected window starts or reads that window's own query, without displaying another window's data as current.

Metrics query `workflow_runs` first and propagate failures. Only a successful empty canonical result permits `analytics_snapshots` fallback. Snapshot failures also propagate; zero metrics require two successful empty queries. Snapshot calculations, metric definitions, polling intervals, and window lengths remain unchanged. The chart always uses canonical runs and labels a successful empty result as no workflow activity.

## Acceptance criteria

- A client sees only its own organization data.
- Runs show feature, workflow, status, time, records, and duration.
- Service visibility matches the client’s provisioned services.
- A failed query produces a recoverable UI state.
- The dashboard uses canonical `workflow_runs` data.

## Implementation and evidence

The approved [Phase 2 contract](../plans/reliability-hardening/phase-2-application-reliability.md) corrects the previously observed query-failure and loading-state gaps. [Local evidence dated 2026-09-10](../plans/reliability-hardening/phase-2-evidence-2026-09-10.md) covers real hooks and rendered consumers with controlled query responses. Live browser, deployed endpoint, and staging verification remain separate.

The current main dashboard composes statistics, an activity chart, subscribed services, execution history, and audit trail. The real-estate schema is available elsewhere in the portal; this specification does not establish that a dedicated real-estate metrics panel is mounted on the main dashboard.

Record the tested revision, environment, scenarios, and command outcomes when verifying these criteria. Mocked component labels and a passing build alone do not establish database isolation or complete error handling.
