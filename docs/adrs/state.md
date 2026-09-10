# ADR: Client state and server cache

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

Session identity, cached database data, and temporary UI choices have different lifetimes.

## Current decision

- Zustand holds auth session and loading state.
- React Query owns server requests and cache state. Hooks include relevant client or organization identifiers in query keys and filter database reads where implemented.
- Component state owns transient inputs such as selected date windows, menu visibility, and active demo actions.
- Bootstrap configures a 60-second query stale time, one retry, and no refetch on window focus; individual hooks can override query behavior.
- Phase 2 uses React Query's existing data/error/fetching/refetch state for statistics, the demo summary, and activity chart. Initial failures show retry; background failures retain same-key cached data with a visible refresh notice. Successful retries clear the notice. Organization and window query keys prevent a new window from borrowing another window's result.
- Demo mutations restore transient button state in finally, and query invalidations request thrown errors so a successful event followed by a failed refresh receives a distinct message.

## Rationale and alternatives

This keeps database response lifecycles out of the auth store while avoiding a global store for every input. Putting all responses in Zustand would require custom invalidation and loading/error management. Separate layers require deliberate cache keys and mutation invalidation; keys themselves do not enforce tenancy. The current sign-out hook does not explicitly clear the QueryClient cache.

## Verification and references

Inspect [bootstrap](../../src/main.tsx), [auth store](../../src/store/authStore.ts), [client hook](../../src/hooks/useClient.ts), and [demo mutations](../../src/pages/DemoPage.tsx). The [Phase 2 evidence](../plans/reliability-hardening/phase-2-evidence-2026-09-10.md) records the 2026-09-10 state-ADR review and behavior checks.
