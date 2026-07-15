# Feature spec: Authenticated client dashboard

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
