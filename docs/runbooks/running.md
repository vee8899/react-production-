# Runbook: running the app

Use the [local-development procedure](local-development.md) for environment setup, startup, routes to check, and common failures. This page keeps the old entry point without duplicating that procedure.

From the repository root with dependencies and public environment values configured:

```powershell
npm.cmd run dev
```

Success means Vite prints a local URL and stays running while the browser loads the requested page. This is a long-running server, not a command expected to exit successfully immediately. Stop it with Ctrl+C. Use the printed URL if the default port is occupied.

A working dev server does not prove the production build, database policies, or deployed environment. Use the [testing runbook](testing.md) for verification.
