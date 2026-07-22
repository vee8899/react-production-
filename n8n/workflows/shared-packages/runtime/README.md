# Shared package runtime

Provider-specific workflows call these inactive sub-workflows with a sanitized execution envelope:

```json
{
  "event_id": "client-id:package:source-event",
  "client_id": "client UUID",
  "workflow_name": "Configured workflow name",
  "feature_type": "workflow_automation",
  "records_processed": 1,
  "records_failed": 0,
  "workflow_steps": [],
  "entity_refs": [],
  "error_message": null
}
```

The terminal reporter selects `success`, `partial`, or `error`. Partial means both counters are greater than zero. Failure reporting is retried three times and emits one sanitized operator alert after retries are exhausted.
