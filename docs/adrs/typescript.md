# ADR: TypeScript project boundaries

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

Browser code, repository scripts, and the coding-agent library have different runtime types and module-resolution needs.

## Current decision

- Keep three compiler projects: the application uses DOM/Vite types and bundler resolution; node/scripts and agents use Node types and Node module resolution.
- The root build references all three projects and performs type checking before Vite creates browser assets. Compiler output is disabled; build-info caches live under node_modules.
- Saved configurations currently do not enable strict mode. Enabling it is approved future work in [reliability phase 2](../plans/reliability-hardening/phase-2-application-reliability.md), not a completed decision in this revision.

## Rationale and alternatives

Separate projects avoid giving browser modules accidental Node globals. The cost is maintaining multiple configurations and checking their combined build. A single broad configuration would be simpler to edit but blur runtime boundaries. The app's generated database types improve query typing without proving deployed schema compatibility.

## Verification and references

Inspect [root compiler configuration](../../tsconfig.json), [app](../../tsconfig.app.json), [node/scripts](../../tsconfig.node.json), [agents](../../tsconfig.agents.json), and [type-checking runbook](../runbooks/type-checking.md). These projects do not cover Deno Edge Function execution.
