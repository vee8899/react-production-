# Database

> Generated reference. Source of truth remains the SQL migrations and implementation.

- `src/hooks/useAnalytics.ts` — `analytics_snapshots`
- `src/hooks/useClient.ts` — `clients`
- `src/hooks/useClientServices.ts` — `client_services`
- `src/hooks/useRuns.ts` — `workflow_runs`, `workflows`
- `src/hooks/useWorkflows.ts` — `workflows`, `workflow_runs`
- `supabase/functions/ingest-run/index.ts` — `workflow_runs`, `workflow_steps`, `workflow_run_entities`, `automation_runs` compatibility projection
- `supabase/functions/invite-client/index.ts` — transactional workspace provisioning and `client_services`
- `supabase/migrations/20260716000001_canonical_workflow_runs.sql` — canonical run backfill and tenant validation
- `supabase/migrations/20260716000002_atomic_client_provisioning.sql` — transactional workspace and service provisioning

`workflow_runs` is the canonical execution source. `automation_runs` remains only as a temporary compatibility projection. Verify schema semantics in the SQL migrations before changing client isolation or automation ingestion. Use the Supabase/database MCP or `npm.cmd run db:dry-run` only against local or staging; production is outside the default MCP boundary.
