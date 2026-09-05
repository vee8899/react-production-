# Feature spec: workflow activity

Status: required behavior, documented against the current implementation on 2026-09-05. Acceptance criteria below are expectations; this document is not a record that live staging or RLS checks passed.

## Purpose and routes

An authenticated client can inspect recent execution outcomes and open one run's diagnostic detail.

- /activity lists runs with a default 30-day window and selectable 7-, 30-, and 90-day windows.
- /activity/:runId opens one run without applying the list's date filter.
- Both routes use authentication and consent gates. Anonymous visitors go to /login; consent requirements follow the existing legal gate.

## Data and presentation

Read canonical workflow_runs scoped to the client's organization. The list requests at most 100 results, ordered by started_at descending, and refreshes every 30 seconds. This is a bounded recent list, not a paginated archive.

Each row links to its run and displays the service label, workflow name, status, processed-record count, and relative execution time. Workflow naming falls back to the feature key when no workflow name is available.

Detail displays workflow/service identity, status, start/finish time, duration, retries, processed/failed records, event/correlation references, execution steps, and affected-record summaries. Missing timing or correlation values are labeled as not recorded. Missing step/entity detail has an explicit empty message.

Business-object history belongs to Audit Trail. This view does not retry workflows or perform repairs; it supplies a reference the client can share with an operator.

## Access and failure behavior

- Require the run's organization to match the authenticated client's organization in addition to RLS enforcement.
- Render loading separately from empty results. Request errors provide a refresh instruction rather than pretending the run succeeded or no activity exists.
- A missing or inaccessible run displays the same not-found outcome; do not reveal another organization's run metadata.
- Diagnostic messages must not expose credentials. Current redaction handles bearer strings and common key/token/password assignments; it is not a complete arbitrary-secret sanitizer. Keep secrets out of ingested diagnostics at the source.

## Acceptance criteria

- Anonymous list/detail navigation redirects to login; incomplete consent follows the legal gate.
- Given runs inside and outside the selected window, only eligible organization-scoped rows appear, newest first, up to the documented bound.
- Changing a date window changes the request and displayed results.
- Selecting a row opens that run; the back link returns to /activity.
- Detail correctly distinguishes success, partial, and error, including unavailable timestamps, absent steps, and empty entity summaries.
- Query failure and successful empty results render different messages.
- A second tenant and an anonymous role cannot read the run or its child records; verify this at the database boundary, not only with mocked UI.
- Known credential-assignment patterns are redacted in both run and step messages.

## Implementation and verification references

See [activity page](../../src/pages/RecentActivityPage.tsx), [list hook](../../src/hooks/useRuns.ts), [detail hook](../../src/hooks/useRunDetails.ts), [detail component](../../src/components/dashboard/RunDetail.tsx), and [RLS testing](../runbooks/rls-testing.md).

Existing regression tests include [run queries](../../src/test/useRuns.test.tsx), [detail queries](../../src/test/useRunDetails.test.tsx), and [feed rendering](../../src/test/RunsFeed.test.tsx). Their presence does not establish that every scenario above is covered. Capture dated command results and gaps when executing acceptance.
