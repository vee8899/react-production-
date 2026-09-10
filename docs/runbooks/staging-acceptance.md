# Runbook: staging acceptance

Use this runbook to close the launch blockers that require a real staging
environment. Never point these commands at production.

## Dependencies

From the repository root:

```powershell
npm.cmd ci
npx playwright install chromium
```

Use `npm.cmd install --cache .npm-cache` only when intentionally updating
dependencies on a Windows machine where the user-level npm cache is not
writable.

## Browser E2E

Required environment variables:

```powershell
$env:STAGING_APP_URL = "https://staging.example.com"
$env:STAGING_TEST_EMAIL = "test-user@example.com"
$env:STAGING_TEST_PASSWORD = "test-user-password"
```

Run:

```powershell
npm.cmd run test:e2e:staging
```

Record the staging URL, commit SHA, Playwright report path, screenshot or trace
for any failure, account used, and timestamp.

The demo event test additionally needs `STAGING_DEMO_EMAIL` and `STAGING_DEMO_PASSWORD` for the seeded `Northstar Realty Demo` tenant with legal consent already completed. Deploy the updated `demo-event` handler before running it. It creates one synthetic lead/run, checks the browser POST and CORS response, and verifies the processed message and restored controls. Without those credentials it is skipped, not passed. See [demo workspace setup](demo-workspace.md). Also verify configure-alert-route from an authenticated browser against dedicated integrations when accepting that endpoint's hosted deployment; local handler tests do not establish gateway behavior.

## Invite and email delivery

Required environment variables:

```powershell
$env:STAGING_SUPABASE_URL = "https://your-staging-project.supabase.co"
$env:STAGING_ADMIN_INVITE_SECRET = "secret-from-staging-secret-store"
$env:STAGING_INVITE_EMAIL = "test-recipient@example.com"
```

Run:

```powershell
npm.cmd run acceptance:invite:staging
```

Then confirm the invite email arrived in the real inbox, the link targets
`/accept-invite`, accepting the invite sets a password, and the account reaches
`/dashboard`.

## Edge Functions and n8n ingestion

Required environment variables:

```powershell
$env:STAGING_SUPABASE_URL = "https://your-staging-project.supabase.co"
$env:STAGING_WEBHOOK_SECRET = "secret-from-staging-secret-store"
$env:STAGING_CLIENT_ID = "staging-client-uuid"
$env:STAGING_ORGANIZATION_ID = "staging-organization-uuid"
$env:STAGING_OTHER_CLIENT_ID = "second-staging-client-uuid"
$env:STAGING_OTHER_ORGANIZATION_ID = "second-staging-organization-uuid"
$env:RELEASE_SHA = (git rev-parse HEAD).Trim()
```

Run this from the approved n8n or operator environment:

```powershell
npm.cmd run acceptance:ingest:staging
```

Use two valid clients from different organizations. Apply migration `20260907000001` before deploying the updated `ingest-run` function. The script first proves that each client can ingest, then reuses the first client's event ID for the second client and requires the generic `409` / `event_id_conflict` response. Duplicate replay must return the original `run_id`.

The HTTP script does not by itself prove database row invariance. With approved staging database access, compare canonical, compatibility, step, entity, and audit rows before and after the rejected collision. Also review any historical compatibility ownership conflicts separately; do not repair them through replay. Local multi-connection execution is covered by `npm.cmd run db:test` and must be recorded independently.

Record the event ID, `run_id`, duplicate replay result, second-client valid event, collision response, row-invariance evidence, invalid-secret result,
Edge Function request IDs, dashboard metrics confirmation, audit/activity
confirmation, and timestamp.

These are acceptance instructions, not a claim that staging has passed. Current status is maintained in the [phase tracker](../plans/reliability-hardening/README.md#phase-tracker).

## Related

See [`production-launch-checklist.md`](production-launch-checklist.md),
[`deployment.md`](deployment.md), and [`environments.md`](../environments.md).
