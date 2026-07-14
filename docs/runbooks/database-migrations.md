# Runbook: database migrations

## Procedure
Run npm.cmd run db:check, then npm.cmd run db:dry-run against local or staging before applying a reviewed migration through the Supabase MCP or CLI.

## Verification
Confirm the command exits successfully and inspect generated artifacts for unexpected changes.

## Related
See `AGENT.md`, `README.md`, and `knowledge/architecture.md`.
