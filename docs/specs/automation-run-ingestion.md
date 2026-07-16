# Feature spec: Automation run ingestion

## Purpose

Record n8n workflow outcomes in Supabase through one trusted ingestion boundary.

## Boundary

`POST /functions/v1/ingest-run` is public at the HTTP layer but protected by `X-Webhook-Secret`. The function validates the payload and calls the service-role-only `ingest_workflow_run` RPC.

## Required payload

```json
{
  "event_id": "stable-source-event-id",
  "client_id": "uuid",
  "feature_type": "workflow_automation",
  "workflow_name": "Lead follow-up",
  "status": "success"
}
```

Optional fields include `workflow_id`, `n8n_workflow_id`, `ran_at`, `duration_ms`, record counts, error details, metadata, workflow steps, and entity references.

## Data contract

- `workflow_runs` is canonical.
- `event_id` is the idempotency key.
- `workflow_steps` stores step detail.
- `workflow_run_entities` and `audit_log` store affected objects.
- `automation_runs` is updated only as a temporary compatibility projection.
- `organization_id` is derived from `client_id`; mismatches are rejected.

## Failure behavior

- Non-POST requests return `405`.
- Missing or invalid secrets return `401`.
- Invalid JSON or schema returns `400`.
- Missing server configuration returns `500` without exposing secrets.
- Database/RPC failure returns `500` and the transaction rolls back.
- Reusing an `event_id` updates the existing run and replaces its child details.

## Acceptance criteria

- Valid events create one canonical workflow run.
- Duplicate events do not create duplicates.
- Cross-organization client/workflow combinations are rejected.
- Malformed payloads are rejected before database writes.
- Lint, tests, build, and staging tenant-isolation checks pass.
