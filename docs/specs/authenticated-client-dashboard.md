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

## Acceptance criteria

- A client sees only its own organization data.
- Runs show feature, workflow, status, time, records, and duration.
- Service visibility matches the client’s provisioned services.
- A failed query produces a recoverable UI state.
- The dashboard uses canonical `workflow_runs` data.

## Known implementation gaps and evidence

As inspected on 2026-09-05, the metrics hook can return zero metrics after query failures, and the statistics/demo consumers do not distinguish all loading and refresh-error states. The recoverable-error requirement above remains valid; do not rewrite it to justify the bug. [Reliability phase 2](../plans/reliability-hardening/phase-2-application-reliability.md) owns the approved correction, including snapshot fallback only after a successful empty canonical query.

The current main dashboard composes statistics, an activity chart, subscribed services, execution history, and audit trail. The real-estate schema is available elsewhere in the portal; this specification does not establish that a dedicated real-estate metrics panel is mounted on the main dashboard.

Record the tested revision, environment, scenarios, and command outcomes when verifying these criteria. Mocked component labels and a passing build alone do not establish database isolation or complete error handling.
