# ADR: Database ownership and workflow runs

## Context

Supabase stores authentication, tenant data, workflow configuration, workflow execution history, service subscriptions, and vertical records. The repository previously contained both `automation_runs` and `workflow_runs`, which created a risk of inconsistent reads and writes.

## Decision

- `public.workflow_runs` is the canonical workflow execution table.
- `public.workflow_steps` stores step-level execution detail.
- `public.workflow_run_entities` and `public.audit_log` store affected business objects and audit history.
- `public.automation_runs` is a temporary compatibility projection only.
- n8n writes through `ingest-run` and `ingest_workflow_run`; it never writes tables directly.
- The database derives organization ownership from `client_id` and rejects mismatches.
- Frontend code reads `workflow_runs` and organization-scoped tables.

## Rationale

`workflow_runs` matches the organization tenancy model and supports retries, outputs, steps, entity references, and correlation data. A single ingestion RPC keeps these records consistent and makes `event_id` idempotency transactional.

## Migration policy

Legacy rows are backfilled into `workflow_runs`. New ingestion temporarily mirrors records into `automation_runs` for external compatibility. The legacy table may be removed only after all external consumers have migrated and staging confirms that no compatibility reads remain.

## Consequences

- Schema migrations must preserve organization ownership and RLS.
- New UI or integration code must not introduce `automation_runs` reads.
- Generated Supabase types must be refreshed after schema changes.
- Database changes require `npm.cmd run db:check` and a staging dry run before deployment.

## Related

- `docs/architecture/canonical-workflow-runs.md`
- `docs/architecture/platform-core-and-vertical-modules.md`
- `supabase/migrations/20260716000001_canonical_workflow_runs.sql`
