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
- `event_id` is the globally unique idempotency key. Replay may update its original organization only; an existing compatibility record must also match the incoming client and organization.
- `workflow_steps` stores step detail.
- `workflow_run_entities` and `audit_log` store affected objects.
- `automation_runs` is updated only as a temporary compatibility projection.
- `organization_id` is derived from `client_id`; mismatches are rejected.

## Failure behavior

- Non-POST requests return `405`.
- Missing or invalid secrets return `401`.
- Invalid JSON or schema returns `400`.
- Missing server configuration returns `500` without exposing secrets.
- An event ownership collision returns `409` with exactly `{ "error": "Event ID conflict", "code": "event_id_conflict" }`. It must not expose another tenant's identifiers or records. The database signals this with SQLSTATE `P4091`; the handler logs the incoming event ID for operator review, without logging the conflicting record.
- Other database/RPC failures return `500` and the transaction rolls back. The existing ingestion timeout returns `504`.
- Same-owner replay retains the canonical run ID and replaces steps and entity references transactionally. Successful entity ingestion appends audit history as before.
- Canonical ownership is guarded by a conditional upsert that locks the event row. The compatibility upsert independently checks client and organization before child replacement. Concurrent ingestion serializes on these writes: a different owner is rejected; a same-owner replay completes after the preceding write.
- Rejection leaves canonical, compatibility, step, entity, and audit records unchanged. Historical compatibility ownership inconsistencies are rejected for separate operator review, never silently repaired by replay.

## Acceptance criteria

- Valid events create one canonical workflow run.
- Duplicate events do not create duplicates.
- Cross-organization client/workflow combinations are rejected.
- Reusing another tenant's event is rejected even with an otherwise valid client/workflow pair.
- Compatibility client and organization mismatches independently reject and roll back the whole transaction, including a newly inserted canonical row.
- Two independent concurrent sessions produce one owner and one conflict, or complete same-owner replay without partial child replacement.
- Malformed payloads are rejected before database writes.
- Lint, tests, build, and staging tenant-isolation checks pass.

This ownership-preserving replay contract implements the approved [Phase 1 decision](../plans/reliability-hardening/phase-1-ingestion-safety.md). Local and staging evidence are tracked separately there. Apply migration `20260907000001` before deploying the updated handler; retain the guard if the handler is rolled back.
