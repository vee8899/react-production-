# Shared workflow packages

These eight inactive templates correspond to the modular packages advertised on the homepage. They provide a common provider-neutral entrypoint and execution contract; provider adapters and client-specific rules are configured separately.

Each template requires `client_id`, `source_event_id`, and `workflow_name`. It derives an idempotent `event_id`, assigns the package feature key, and reports the accepted run to Supabase through `SUPABASE_INGEST_URL` using `WEBHOOK_SECRET`.

Templates:

- `workflow-automation.json`
- `system-integrations.json`
- `intelligent-operations.json`
- `notifications.json`
- `business-insights.json`
- `configurable-domain-modules.json`
- `system-data-synchronization.json`
- `granular-workflow-customization.json`

These are shared templates, not cross-tenant workflows. Each client must receive an isolated configured workflow record and provider credentials.

Provider-specific workflows should call the runtime reporters in `runtime/`. Use `record-partial.json` when both processed and failed counters are greater than zero, `record-failure.json` when no record completes or the workflow cannot continue, and `operator-alert.json` once after final retry exhaustion. The runtime envelopes intentionally omit raw provider payloads.
