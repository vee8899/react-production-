# Domain glossary

These authored definitions describe the terms used in specifications. Verify actual constraints in migrations when changing ownership or identifiers.

- **Organization:** the primary scope for platform data and membership-based access.
- **Client:** a portal account record associated with a Supabase user and, once provisioned, an organization. A client record and an organization are distinct identities.
- **Workflow:** a configured automation associated with a client and organization.
- **Run:** an execution outcome in canonical `workflow_runs`; `event_id` is the global idempotency key. Ownership-conflict hardening remains planned in [phase 1](../plans/reliability-hardening/phase-1-ingestion-safety.md).
- **Compatibility projection:** `automation_runs`, maintained for older consumers alongside canonical run data.
- **Feature key/type:** the automation category used by ingestion and the UI service catalog; validate allowed values at their API/database boundaries.
- **Edge Function:** a server-side HTTP handler. Its caller authorization depends on the endpoint; being an Edge Function is not itself an access policy.

See the [canonical workflow-run contract](canonical-workflow-runs.md) for the intended data flow and invariants.
