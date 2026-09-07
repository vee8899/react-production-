# Supabase-only demo automation

Status: implementation in progress; not accepted or published.

The approved delivery uses hosted development project `iutycpnqlzxovffctjyz`
and one explicitly configured Northstar Realty Demo organization. Supabase is
the authoritative store. Queue creation identifies work for review in the
Supabase dashboard; it does not send messages or complete business actions.
The existing portal remains a run and audit viewer.

## Required delivery

- Preserve and back up the eight existing intake, queue, snapshot, and reporting
  workflow IDs before editing them.
- Authenticate intake separately from outbound `X-Webhook-Secret` ingestion.
- Bind tenant and workflow identity in trusted database configuration and use
  a dedicated execution role with access only to required functions.
- Commit business changes and a stable run-report outbox entry atomically.
- Persist deduplicated operational tasks, audited review transitions, listing
  checkpoints, and one daily report per organization/type/UTC date.
- Batch at 100 records, serialize overlapping work, preserve completed tasks,
  and cancel obsolete pending appointment reminders.
- Retry transient reporting failures with bounded backoff; quarantine permanent
  rejection. Preserve failures when Supabase cannot record them.
- Test locally and through real n8n-to-hosted-Supabase executions, publish shared
  dependencies first, smoke test, and observe a scheduled cycle.

Email, external CRM/calendar providers, AI, document generation, and a new
approval screen are deferred. Their packages remain incomplete and inactive.

## Preflight, 2026-09-07

- CLI project inventory confirms the linked target is `ACTIVE_HEALTHY`.
- Hosted SQL Editor lookup found one Northstar client matching
  `demo@northstar.example`.
- n8n credential `Postgres account` (`9NYei4dh7z08Xyf4`) fails with connection
  refused at `127.0.0.1:5432`. This is not a hosted database connection.
- Manual-only diagnostic workflow `ZZIQaSRqfc74lkSi`, execution `3`, records
  that failure. It is not a business workflow and must remain unpublished.
- Hosted `ingest-run` version 12 is active with `verify_jwt=true`, which differs
  from the repository's intentional header-secret boundary.
- Hosted migration verification and credential correction remain outstanding.

These observations are preflight evidence, not hosted acceptance. No business
workflow has been updated or published by this preflight.
