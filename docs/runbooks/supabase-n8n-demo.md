# Supabase-only n8n demo operations

Target: development project `iutycpnqlzxovffctjyz`, Northstar organization
`72fca9a0-6b41-4f8b-a385-ddb678456ed5`. This runbook does not authorize processing
other tenants. Deployment IDs and state are in
[`deployment.json`](../../n8n/workflows/supabase-demo/deployment.json).
See [hosted test evidence](../evidence/2026-09-10-supabase-n8n-tests.md) before release.

## Connection requirements

- `Postgres account` uses the hosted IPv4-compatible session pooler and the restricted
  `n8n_demo_executor` login. Its password is separate from the Supabase account password.
  The role is database configuration, not an Edge Function secret.
- Outbound `Header Auth account`: header `X-Webhook-Secret`; value equals the hosted
  Edge Function secret `WEBHOOK_SECRET` (singular).
- Inbound `Header Auth account 2`: separate `X-Intake-Secret`. Do not reuse the outbound secret.
- `ingest-run` uses its header-secret contract with JWT verification disabled.
  Never put either secret in workflow JSON, client-side environment settings, logs, or Git.
- The demo database credential was configured with SSL Require and certificate verification
  bypassed after a certificate-chain error. Encryption alone does not verify server identity;
  configure a trusted CA before treating this connection as production-ready.

## Manual checks and publication

Use `Manual acceptance` in each workflow to call its real database functions.
These runs create synthetic demo entities and reports. The failure-handler entry simulates
the Error Trigger payload; production automatic dispatch must be verified separately.
The preflight workflow checks pending report count and must remain unpublished.

Inspect the database result and the reporter's `Acknowledge report` node. Intake returns
the result captured at commit time, so `report_status: pending` in that result may precede
a successful delivered receipt. HTTP 200 with `ok` and a run ID, followed by a delivered
outbox acknowledgment, verifies reporting. Do not infer success from a green HTTP node alone.

Before publication, verify absent/wrong/correct inbound headers through actual HTTP test
listeners; MCP webhook invocations are not proof of external authentication. Verify the
portal as a demo client. Publish shared dependencies first, link the separate failure
handler in workflow settings, then publish intake/scheduled workflows. Keep unrelated
experiments inactive. Observe the next 15-minute cycle; daily snapshots run at 02:00 UTC.

## Operator review

Review `public.operational_tasks` in the Supabase dashboard. Use `pending`,
`acknowledged`, `completed`, or `cancelled`, and add a resolution note. Status changes
produce `audit_log` entries. Entity identity and deduplication fields are immutable.
Queue tasks mean work was identified, not that a message was sent or an appointment action
was performed. No email, calendar, CRM, model, or document integration is included.

Completed tasks stay completed. A meaningful source revision can produce a new task;
an appointment reschedule cancels obsolete pending reminders and creates a reminder for
the new start time. The listing checkpoint tracks revisions across downtime.

## Reporting failures

Inspect `public.run_report_outbox` and the n8n execution. Transport errors, 429, and 5xx
receive three attempts with short bounded backoff; pending receipts become eligible again
after 15 minutes. Recovery claims at most 100 reports per cycle and sends them individually.
The shared failure handler only writes the outbox; recovery delivers it to avoid recursive
reporting failures.

Permanent rejections such as 400/401/409 are quarantined. Correct the root cause and inspect
the event and payload before an operator requeues a specific report. Do not blindly retry
invalid-reference events or identity conflicts. Stable event IDs protect committed business
changes during replay. If Supabase is unavailable, keep the failed n8n execution for recovery.

## Rollback and retained fixtures

Unpublish affected workflows and restore their saved versions from n8n history or
[`backups`](../../n8n/workflows/supabase-demo/backups). Keep the ownership guard,
stored tasks, reports, and audit history. Do not remove migrations to roll back workflow logic.
Sanitized tested graphs are in [`validated`](../../n8n/workflows/supabase-demo/validated).

Acceptance fixtures use `n8n_acceptance` and `n8n_acceptance_pagination`; pagination external
IDs are 1–101. They remain in the demo database for inspection. Before any cleanup, identify
exact fixture IDs and preserve the evidence; never delete an organization to clear test data.
