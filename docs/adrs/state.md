# ADR: Client state and server cache

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

Session identity, cached database data, and temporary UI choices have different lifetimes.

## Current decision

- Zustand holds auth session and loading state.
- React Query owns server requests and cache state. Hooks include relevant client or organization identifiers in query keys and filter database reads where implemented.
- Component state owns transient inputs such as selected date windows, menu visibility, and active demo actions.
- Bootstrap configures a 60-second query stale time, one retry, and no refetch on window focus; individual hooks can override query behavior.

## Rationale and alternatives

This keeps database response lifecycles out of the auth store while avoiding a global store for every input. Putting all responses in Zustand would require custom invalidation and loading/error management. Separate layers require deliberate cache keys and mutation invalidation; keys themselves do not enforce tenancy. The current sign-out hook does not explicitly clear the QueryClient cache.

## Verification and references

Inspect [bootstrap](../../src/main.tsx), [auth store](../../src/store/authStore.ts), [client hook](../../src/hooks/useClient.ts), and [demo mutations](../../src/pages/DemoPage.tsx). Visible query failure handling is planned in [phase 2](../plans/reliability-hardening/phase-2-application-reliability.md).
