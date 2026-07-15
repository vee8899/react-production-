# Canonical workflow run contract

## Decision

`public.workflow_runs` is the canonical run table.

`public.automation_runs` is a temporary compatibility projection for older dashboard consumers and historical integrations. New application code and integrations must read and write through `public.ingest_workflow_run` and `workflow_runs`.

## Why

- `workflow_runs` is organization-scoped and matches the platform tenancy model.
- It supports child records for `workflow_steps` and `workflow_run_entities`.
- It captures retries, outputs, start/finish times, and correlation data.
- It gives n8n one transactional ingestion boundary.
- It avoids making the product-facing dashboard depend on a legacy client-only table.

## Data flow

```text
n8n
  -> ingest-run Edge Function
      -> ingest_workflow_run() [service role only]
          -> workflow_runs       canonical record
          -> workflow_steps      step detail
          -> workflow_run_entities and audit_log
          -> automation_runs     compatibility projection
```

## Invariants

1. `event_id` is the idempotency key across both run tables.
2. The database derives `organization_id` from `client_id` and rejects mismatches.
3. A supplied `workflow_id` must belong to the supplied client and organization.
4. n8n never writes directly to either table.
5. Frontend reads use `workflow_runs`; compatibility reads are not part of the normal product path.
6. Reprocessing an event replaces its step and entity details transactionally.

## Migration and retirement

The canonical migration backfills legacy rows into `workflow_runs` and links their `workflow_run_id`. The ingest function continues to mirror new records into `automation_runs` until external consumers have migrated.

Before removing `automation_runs`:

- verify no repository or external workflow reads it;
- verify all historical rows have a non-null `workflow_run_id`;
- verify staging and production dashboards use `workflow_runs` only;
- remove the compatibility projection from `ingest_workflow_run`;
- remove the legacy table in a separately reviewed migration.

## n8n contract

n8n calls `POST /functions/v1/ingest-run` with `X-Webhook-Secret` and sends `event_id`, `client_id`, `feature_type`, `workflow_name`, and `status`. Secrets remain in n8n credentials or variables and are never exported in workflow JSON.
