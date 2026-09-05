# Runbook: installing dependencies

## Prerequisites

Use Node.js 24 and npm from the repository root. The package manifest and lockfile are the dependency inputs; dependency changes should be intentional.

## Install

For a reproducible install from the lockfile:

```powershell
npm.cmd ci
```

For an intentional dependency/lockfile update:

```powershell
npm.cmd install
```

If npm's user cache is unavailable, keep the chosen install semantics and change only the cache location, for example:

```powershell
npm.cmd ci --cache .npm-cache
```

Do not use npm install merely to conceal a manifest/lockfile mismatch reported by npm ci. Resolve that mismatch deliberately.

## Browser runtime and audit

Playwright is already a dev dependency; installing the browser runtime is separate from updating its package:

```powershell
npx playwright install chromium
npm.cmd audit --omit=dev
npm.cmd audit
```

Audit results describe known advisories at execution time, not permanent security status. Record the date and review failures without automatically applying force upgrades.

## Expected result and failure handling

The chosen install must exit zero. For npm ci, package.json and package-lock.json should remain unchanged. For intentional updates, review their exact diff:

```powershell
git status --short
git diff -- package.json package-lock.json
```

On installation failure, inspect the reported registry, cache, engine, or lockfile error before retrying. An installed dependency tree does not prove the app builds or runs; use [testing](testing.md) and [production build](production-build.md). Record the revision, Node/npm versions, command, and result.
