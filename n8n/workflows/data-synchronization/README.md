# CRM / spreadsheet / portal synchronization

This workflow standardizes manual data-entry replacement without choosing a specific CRM, spreadsheet, or portal provider.

## Input contract

- `client_id`: tenant client UUID
- `source_event_id`: stable source batch/event identifier
- `workflow_name`: configured workflow name
- `source_system`: `crm`, `spreadsheet`, or `portal`
- `records`: array of records, each with `external_id`, `entity_type`, and `fields`
- `field_map`: approved source-to-destination field mapping

Each record is deduplicated by `source_system:external_id`. Provider-specific adapters receive only normalized records and are configured through `DATA_SYNC_PROVIDER_URL` and `DATA_SYNC_PROVIDER_TOKEN` outside Git.

The workflow reports processed and failed counts, failed external IDs, step details, and real-estate entity references to `ingest-run`. Mixed results use `partial`.
