# Workflow Source

Export each tested n8n workflow JSON into this directory after it passes client acceptance. Never export credentials, API keys, webhook secrets, or client data.

## First Workflow Contract: Lead Follow-up

1. Receive a lead from the agreed source.
2. Validate required contact data and create a stable event ID from the source record.
3. Deduplicate against the agreed CRM or client data source.
4. Create or update the CRM record.
5. Send the approved email follow-up.
6. Send a success event to `ingest-run` with `feature_type: "lead_follow_up"`.
7. On any failure, notify the operator and send an error event with the same `event_id`.

The event request must use `POST`, include the `X-Webhook-Secret` header, and include `event_id`, `client_id`, `feature_type`, `workflow_name`, and `status`. The live client workflow determines the remaining fields and the exact source, CRM, and email nodes.
