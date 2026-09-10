# Runbook: type checking

## Prerequisites and command

Use Node.js 24 and the installed repository dependencies. Run from the repository root:

```powershell
npm.cmd exec tsc -- -b --pretty false
```

The [root configuration](../../tsconfig.json) references the app, node/scripts, and agents projects. These projects use noEmit; TypeScript may update build-info caches under node_modules.

## Expected result and failure handling

Exit code zero with no diagnostics means the included projects pass their configured checks. On failure, fix the reported file/configuration and rerun this command; do not hide diagnostics by weakening compiler options.

Strict mode is enabled in all three saved configurations under the approved [Phase 2 decision](../plans/reliability-hardening/phase-2-application-reliability.md). A passing check does not execute tests or inspect deployed schema. Handler imports from tests are checked against installed Zod/Supabase types; Deno entrypoints and deployed Edge Function execution require separate verification. See the [TypeScript ADR](../adrs/typescript.md) and [testing procedure](testing.md).

Record the command, revision, and result. Run [production build](production-build.md) when browser bundling must also be verified.
