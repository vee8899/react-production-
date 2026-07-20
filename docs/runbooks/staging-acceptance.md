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
$env:RELEASE_SHA = (git rev-parse HEAD).Trim()
```

Run this from the approved n8n or operator environment:

```powershell
npm.cmd run acceptance:ingest:staging
```

Record the event ID, `run_id`, duplicate replay result, invalid-secret result,
Edge Function request IDs, dashboard metrics confirmation, audit/activity
confirmation, and timestamp.

## Related

See [`production-launch-checklist.md`](production-launch-checklist.md),
[`deployment.md`](deployment.md), and [`environments.md`](../environments.md).
