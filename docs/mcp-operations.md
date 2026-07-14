# MCP operations

This repository uses a lean, task-based MCP model.

## Tool ownership

- Supabase/database MCP: inspect schemas, policies, enums, functions, migration state, and safe diagnostics.
- Playwright/browser MCP: on-demand UI smoke tests for authentication, protected routes, dashboard state, and workflow activity.
- Filesystem and Git: use Codex workspace and Git capabilities; do not add duplicate MCP servers.
- Serena: deferred until repository size or refactoring complexity justifies semantic code navigation.

## Environments

MCP database access is limited to local development and a separate staging Supabase project. Production credentials must not appear in `.env.mcp`, MCP configuration committed to the repository, or agent prompts.

Copy `.env.mcp.example` to `.env.mcp` for local setup. The file is ignored by Git.

## Migration workflow

1. Edit a reviewed SQL migration under `supabase/migrations/`.
2. Run `npm.cmd run db:check`.
3. Run `npm.cmd run db:dry-run` against local or staging.
4. Apply the migration through the database MCP or Supabase CLI.
5. Re-run `npm.cmd run refresh-ai`.
6. Confirm `knowledge/database.md` and `index/database.json` reflect the schema.

Direct undocumented schema writes are not allowed. Production migrations, resets, destructive SQL, and rollback operations require explicit approval.

## Playwright smoke routes

Run browser checks on local or staging only:

- `/login`: valid login and invalid-login error state.
- `/accept-invite`: missing invite state, consent, password setup, and completion.
- `/dashboard`: unauthenticated redirect, authenticated loading, empty/error states, and feature metrics.
- `/workflows`: authenticated workflow list and run activity.

Playwright is an on-demand release and regression tool. Component-only changes should continue using Vitest.

## Git policy

Codex Git capabilities remain authoritative. Local commits may be automated when the task explicitly includes a commit. Pushes, pull requests, force pushes, and destructive history changes require explicit user direction.
