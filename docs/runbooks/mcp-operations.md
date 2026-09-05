# Runbook: MCP operations

The canonical environment and tool policy is [MCP operations](../mcp-operations.md). This page is a navigation entry point, not a second policy.

Before a database or browser operation, identify the local/staging target and the scope already authorized in the task. Use the [migration procedure](database-migrations.md) for SQL work and the [staging acceptance procedure](staging-acceptance.md) for browser/endpoint evidence.

Record the actual query, inspected resource, or browser scenario and its outcome. A tool connection alone does not prove schema state, tenant isolation, or a working UI. If target identity or permissions cannot be established, stop that operation and record the missing prerequisite. Never copy credentials into evidence.
