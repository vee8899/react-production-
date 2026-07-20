# Runbook: installing dependencies

Use this runbook when setting up the project or when `package.json` changes.

## Procedure

Install the Node dependencies from the lockfile when you want a reproducible
environment:

```powershell
npm.cmd ci
```

Use `npm.cmd install` only when intentionally updating dependencies and the
lockfile:

```powershell
npm.cmd install
```

If npm cannot write to the user-level cache on Windows, use the repo-local
cache:

```powershell
npm.cmd install --cache .npm-cache
```

## Browser E2E dependency

Staging browser tests use Playwright through `@playwright/test`. Install the
package only when intentionally changing dependencies:

```powershell
npm.cmd install -D @playwright/test --cache .npm-cache
```

Install the browser runtime before running E2E tests on a new machine or CI
runner:

```powershell
npx playwright install chromium
```

If the browser install is handled by the CI image or platform, record that in
the release evidence instead of reinstalling it during every run.

## Dependency audit

Run both audits before a release:

```powershell
npm.cmd audit --omit=dev
npm.cmd audit
```

## Verification

Confirm the command exits successfully and inspect generated artifacts for
unexpected changes:

```powershell
git status --short
git diff -- package.json package-lock.json
```

## Related
See `AGENT.md`, `README.md`, `docs/runbooks/testing.md`, and
`knowledge-base/architecture.md`.
