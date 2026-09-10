# ADR: TypeScript project boundaries

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

Browser code, repository scripts, and the coding-agent library have different runtime types and module-resolution needs.

## Current decision

- Keep three compiler projects: the application uses DOM/Vite types and bundler resolution; node/scripts and agents use Node types and Node module resolution.
- The root build references all three projects and performs type checking before Vite creates browser assets. Compiler output is disabled; build-info caches live under node_modules.
- All three saved configurations enable `strict: true`, implementing the approved [reliability Phase 2 decision](../plans/reliability-hardening/phase-2-application-reliability.md). Diagnostics must be resolved without disabling checks or adding suppressions.

## Rationale and alternatives

Separate projects avoid giving browser modules accidental Node globals. The cost is maintaining multiple configurations and checking their combined build. A single broad configuration would be simpler to edit but blur runtime boundaries. The app's generated database types improve query typing without proving deployed schema compatibility.

## Verification and references

Inspect [root compiler configuration](../../tsconfig.json), [app](../../tsconfig.app.json), [node/scripts](../../tsconfig.node.json), [agents](../../tsconfig.agents.json), and [type-checking runbook](../runbooks/type-checking.md). The app compiler also follows handler imports from tests, resolving remote Zod and Supabase type imports to installed dependencies. This does not type-check Deno entrypoints or prove Deno execution.

Strict build and explicit compiler evidence are recorded in the [Phase 2 report](../plans/reliability-hardening/phase-2-evidence-2026-09-10.md). Typing the demo handler exposed a schema-type mismatch: successful ingestion passes SQL NULL for `p_error_message`, which migration `20260907000001` permits. That argument is now typed `string | null`; the handler's run status is a success/error union. No runtime schema change or compiler suppression was needed.
