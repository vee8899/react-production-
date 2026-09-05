# Runbook: production build

## Prerequisites and command

Use Node.js 24, installed dependencies, and public Vite environment values for the intended build. Never supply server secrets as Vite values. Run from the repository root:

```powershell
npm.cmd run build
```

The script first type-checks the three referenced compiler projects, then runs Vite.

## Expected result and failure handling

Success is exit code zero with Vite's asset summary and output in dist. A compiler failure means bundling did not complete; a bundler failure means the artifact must not be promoted. Fix the first reported failure and rebuild.

To inspect the built application locally:

```powershell
npm.cmd run preview
```

Open the printed URL and exercise relevant public/protected routes using the intended local or staging backend. Stop the preview with Ctrl+C. This command serves existing build output; it does not rebuild it.

A build is neither deployment nor database verification. Record the revision, public target configuration names, command results, and browser checks without secrets. Follow the [release checklist](release-checklist.md) for promotion.
