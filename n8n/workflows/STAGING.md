# Staging-safe n8n workflows

These workflows are provider-neutral building blocks. They do not contain credentials, tenant IDs, client records, or provider-specific nodes.

## Environment

Configure these values in the n8n environment or an equivalent secret manager; never place them in workflow JSON:

- `SUPABASE_INGEST_URL`: the full `/functions/v1/ingest-run` URL.
- `WEBHOOK_SECRET`: the same secret configured for the Supabase Edge Function.

The imported workflows are inactive by default. Import them into a staging n8n instance, configure the environment, and test before activation.

## Workflows

- `real-estate-lead-event-webhook.json`: validates an inbound event, derives a stable idempotency key from `client_id` and the source identifier, and records a successful run.
- `real-estate-run-success.json`: reusable success reporting sub-workflow.
- `real-estate-run-failure.json`: reusable failure reporting sub-workflow.

Call the success/failure sub-workflows from provider-specific workflows after those workflows have been reviewed. Use `n8n/workflows/examples/lead-event.json` as a sanitized request example.

## Staging checklist

1. Import the three JSON files without editing their structure.
2. Configure `SUPABASE_INGEST_URL` and `WEBHOOK_SECRET` outside the workflow JSON.
3. Send a valid example request and confirm a `workflow_runs` row is created.
4. Repeat the same `source_event_id` and confirm no duplicate run is created.
5. Send requests missing `client_id`, `workflow_name`, `feature_type`, or the source identifier and confirm a failure response.
6. Verify unauthorized requests are rejected by Supabase.
7. Verify the dashboard, workflow activity, run details, and audit trail show the result.
8. Keep the workflows inactive until staging acceptance passes.
