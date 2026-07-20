# Runbook: testing

## Run the test suite

Run the suite once from the repository root:

```powershell
npm.cmd run test -- --run
```

Vitest and Testing Library tests live under `src/test/`. The test setup is in `src/test/setup.ts`.

## Choose the right test coverage

- Update or add a unit test for domain logic in `src/lib/` or `src/utils/`.
- Update or add a component test when rendered states, navigation, forms, or user interaction changes.
- Include loading, empty, error, unauthenticated, and successful states when the feature has them.
- For tenancy-sensitive behavior, test that one client cannot see another client’s records. UI tests alone are not enough; review the RLS migration as well.
- For ingestion changes, cover valid, malformed, unauthorized, duplicate, and cross-organization events.

## Full verification

The normal pull-request checks are:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

Run the build even when tests pass. It catches TypeScript and production-bundling errors that a test environment may not expose.

## Staging browser E2E

Browser E2E tests are intentionally separate from Vitest. Vitest excludes
`e2e/`, and Playwright owns that directory.

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

For a new machine or CI runner, install the Chromium runtime first:

```powershell
npx playwright install chromium
```

The HTML report is written to `outputs/playwright-report`.

## Staging acceptance scripts

Use these scripts to exercise the staging Edge Functions and ingestion
contract.

Invite flow:

```powershell
$env:STAGING_SUPABASE_URL = "https://your-staging-project.supabase.co"
$env:STAGING_ADMIN_INVITE_SECRET = "secret-from-staging-secret-store"
$env:STAGING_INVITE_EMAIL = "test-recipient@example.com"
npm.cmd run acceptance:invite:staging
```

Ingestion flow:

```powershell
$env:STAGING_SUPABASE_URL = "https://your-staging-project.supabase.co"
$env:STAGING_WEBHOOK_SECRET = "secret-from-staging-secret-store"
$env:STAGING_CLIENT_ID = "staging-client-uuid"
$env:STAGING_ORGANIZATION_ID = "staging-organization-uuid"
$env:RELEASE_SHA = (git rev-parse HEAD).Trim()
npm.cmd run acceptance:ingest:staging
```

Optional overrides:

```powershell
$env:STAGING_SUPABASE_FUNCTIONS_URL = "https://your-functions-host"
$env:STAGING_INGEST_EVENT_ID = "stable-event-id-for-retry"
$env:STAGING_INVITE_COMPANY = "Staging Acceptance Company"
```

The scripts fail before making requests if required staging variables are
missing. They print JSON evidence on success; save that output with the release
record.

## When a test fails

1. Read the first meaningful assertion failure, not only the final summary.
2. Re-run the smallest relevant test file while iterating.
3. Check whether the failure is caused by stale test data, a missing environment variable, timing, or an actual behavior change.
4. Do not weaken an assertion simply to make the suite green. Update the test when the product behavior intentionally changed and document the reason.

## Related

See [`local-development.md`](local-development.md), [`docs/mcp-operations.md`](../mcp-operations.md), and [`AGENT.md`](../../AGENT.md).
