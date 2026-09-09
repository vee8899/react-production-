# Hosted n8n demo test evidence — 2026-09-09/10

These are real manual executions in n8n Cloud against development project `iutycpnqlzxovffctjyz`. This is not a production activation record. Base repository revision for the final checks: `cf52e73`; the expression-format fixes and this evidence were subsequently added.

## Workflow results

| Workflow | Successful execution(s) | Verified behavior |
| --- | --- | --- |
| Real Estate - Lead Intake | 19, 191 | Lead saved; authenticated reporter delivered its canonical run. 191 invokes the webhook path through MCP. |
| Real Estate - Listing Intake | 21, 43 | Listing saved, including zero values; webhook path exercised through MCP. |
| Real Estate - Appointment Intake | 23, 177, 183, 187 | Appointment saved; two reschedules update the same entity. |
| Platform - Lead Follow-up Queue | 25, 35, 62, 64 | Two initial tasks; subsequent and overlapping polls add zero duplicates. |
| Platform - Appointment Reminder Queue | 27, 37, 179, 181, 185, 189 | Deduplication, completed-task preservation, and rescheduled reminders. |
| Platform - Listing Notification Queue | 29, 39, 70 | Durable checkpoint; 102 changed rows scanned as 100 + 2; 101 active fixture tasks created. |
| Platform - Daily Data Pipeline Snapshot | 31, 41 | Same daily report ID on rerun, with entity/task counts. |
| Platform - Event Intake & Run Logging | 18, 49, child executions | HTTP 200 and delivered outbox receipts with originating workflow identity. |
| Platform - Run Reporting Recovery | 33, 50, 73, 174 | Earlier transport failure recovered; synthetic failure reported; pagination reports drained as 100 + 1. |
| Platform - Supabase Shared Failure Handler | 48 | Manual synthetic failure saved via the same database function as Error Trigger; recovery 50 delivered it. |

All ten workflows remain unpublished. All workflow nodes were enabled in the final draft inventory. Manual acceptance inputs were restored after negative tests. The preflight workflow was restored to its original pending-report count query.

## Negative tests and fixes

- 52 / 54 / 56: malformed lead, negative listing price, and invalid appointment ordering each return HTTP 400 from the database and terminate the execution as an error after reporting the validation failure.
- 58 / 60: caller-supplied organization override and unowned appointment reference each return HTTP 400.
- 10: real HTTP 500 reporting outage attempted three times and left the business result pending; recovery 33 later delivered it.
- 12 / 14 / 16: real HTTP 401 failures were quarantined without endless retries.
- 66 exposed the missing entity-type validation bug: intake accepted a malformed reference, then HTTP ingestion rejected it with 400 and the report was quarantined.
- Forward migration `20260909000001_automation_event_reference_validation.sql` was applied through the hosted SQL Editor in a transaction and registered in `supabase_migrations.schema_migrations`.
- Retest 176 returns HTTP 400 at `Accept demo event`, before creating an outbox report. Its n8n execution intentionally errors; the generic final StopAndError message is not the primary validation response.
- New manual test entries initially failed expression parsing (45, 46). Separating adjacent closing braces fixed them; reruns 48 and 49 pass. Repository SDK definitions now include the working expressions.
- Enabling the previously disabled lead webhook in its unpublished draft allowed test 191.
- Regenerated schema types exposed the PostgreSQL inet type as unknown. The consent reader now narrows it to string or null; the application build passes.

## Database verification

The read-only SQL in `n8n/workflows/supabase-demo/acceptance/final-checks.sql` returned:

| Check | Result |
| --- | ---: |
| Completed synthetic reminder | 1 |
| Cancelled obsolete synthetic reminder | 1 |
| Current pending synthetic reminder | 1 |
| Task status audit transitions | 2 |
| Delivered reports | 133 |
| Pending or leased reports | 0 |
| Delivered reports missing a canonical workflow run | 0 |
| Originating workflow identity mismatches | 0 |
| Quarantined reports represented by successful canonical runs | 0 |
| Pagination listings preserving price, bedrooms, bathrooms = 0 | 101 |

These counts are a point-in-time observation before the final lead webhook test 191. That test added one further successful run. The completed reminder was not reopened by polling; changing its appointment time created a new task. Rescheduling again cancelled the obsolete pending task and left the completed task intact.

## Local verification

- `npm.cmd run lint`: pass.
- `npm.cmd run test -- --run`: 125 tests in 27 files pass.
- `npm.cmd run build`: pass after generated-type adaptation.
- `npm.cmd run db:test:automation`: seven groups pass, including empty datasets, tenant boundaries, null/missing event references, 206-row pagination, audited task transitions, outbox leasing/recovery, and completed-task preservation.
- Earlier local ingestion run: nine ownership/concurrency groups pass.
- Earlier local pgTAP run: 17 assertions pass.
- Migration inventory: 27 files; hosted migration ledger updated through the forward validation migration.
- `npm.cmd run refresh-ai`: pass after the repository walker was changed to skip non-regular files. Its first attempt hit EISDIR on a directory link; it now completes without traversing that link.
- A fresh CLI migration dry run was not completed: linked database commands previously timed out at the hosted pooler. The forward migration was reviewed, exercised locally, applied transactionally through the authorized hosted SQL Editor, and verified by the hosted negative retest instead.

## Limits and release gates

Manual execution exercises real Supabase operations. It does not prove production scheduling or automatic Error Trigger dispatch. No workflow was published and no scheduled cycle was observed.

MCP webhook invocation does not establish external HTTP authentication enforcement. Before publication, test missing/wrong/correct inbound headers through actual HTTP listeners for every intake. Missing/wrong outbound credentials were tested against the real ingest-run endpoint.

Canonical runs and audit rows were checked in the database used by the portal. A fresh authenticated portal-browser walkthrough remains outstanding. Empty-dataset behavior and a reference to an existing entity in a second tenant were covered locally; the hosted negative reference test used an unowned UUID.

Synthetic records were retained for reproducibility. Pagination fixtures use `source_system = n8n_acceptance_pagination`, external IDs 1–101; ordinary fixtures use `n8n_acceptance`. They are demo data, not business actions. Intentionally quarantined legacy test reports remain for operator review. Do not requeue the invalid-reference event; replaying its invalid payload cannot succeed.

The production release must link the published failure handler, verify external webhook authentication, verify portal visibility, and observe the scheduled cycle. The suite is manually tested, not fully release-accepted.
