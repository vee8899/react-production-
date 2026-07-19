# Runbook: local development

Use this runbook for the normal browser-based development loop.

## Prerequisites

- Node.js 24 is recommended because CI uses Node.js 24.
- npm is available on the command line.
- `.env.local` exists in the repository root with the public Supabase values:

  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

For work that needs database or authentication behavior, use a local or staging Supabase project. Do not point development tools at production unless the task explicitly requires it and the target has been confirmed.

## Start the app

From the repository root:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the URL printed by Vite. The expected default is `http://localhost:52124`.

## Check the main flows

For public-site work, check the landing page, navigation, contact action, and login entry point.

For portal work, check login, protected-route redirects, dashboard loading, workflows, recent activity, and empty/error states. For invite-related work, use `/accept-invite` with a fresh test invite.

## Before finishing

Run the checks that match the change:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

If the change affects implementation structure, refresh generated knowledge and review the diff:

```powershell
npm.cmd run refresh-ai
```

The refresh command may update `knowledge/` and `index/`. It must not replace authored files under `docs/`.

## Common problems

- If the app cannot connect to Supabase, check the variable names and restart Vite after changing `.env.local`.
- If a protected page redirects to login, confirm the test account has a valid session and the expected client/organization records.
- If the port is busy, use the URL Vite reports rather than assuming the default port.
- If the working tree contains unexpected generated files, inspect `git status` and the command output before deleting anything.

## Related

See [`README.md`](../../README.md), [`AGENT.md`](../../AGENT.md), [`testing.md`](testing.md), and [`debugging.md`](debugging.md).
