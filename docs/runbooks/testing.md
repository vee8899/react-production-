# Runbook: testing

## Run the test suite

Run the suite once from the repository root:

```powershell
npm.cmd run test -- --run
```

Vitest and Testing Library tests live under `src/test/`. The test setup is in `src/test/setup.ts`.

## Choose the right test coverage

- Update or add a unit test for domain logic in `src/lib/` or `src/utils/`.
- Update or add a component test when rendered states, navigation, forms, or user interaction changes.
- Include loading, empty, error, unauthenticated, and successful states when the feature has them.
- For tenancy-sensitive behavior, test that one client cannot see another client’s records. UI tests alone are not enough; review the RLS migration as well.
- For ingestion changes, cover valid, malformed, unauthorized, duplicate, and cross-organization events.

## Full verification

The normal pull-request checks are:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

Run the build even when tests pass. It catches TypeScript and production-bundling errors that a test environment may not expose.

## When a test fails

1. Read the first meaningful assertion failure, not only the final summary.
2. Re-run the smallest relevant test file while iterating.
3. Check whether the failure is caused by stale test data, a missing environment variable, timing, or an actual behavior change.
4. Do not weaken an assertion simply to make the suite green. Update the test when the product behavior intentionally changed and document the reason.

## Related

See [`local-development.md`](local-development.md), [`docs/mcp-operations.md`](../mcp-operations.md), and [`AGENT.md`](../../AGENT.md).
