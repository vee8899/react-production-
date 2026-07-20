# Runbook: RLS isolation tests

The executable database isolation tests live in
`supabase/tests/database/rls_isolation.sql`. They use Supabase's pgTAP runner
and exercise real policies with two users, two organizations, and an anonymous
role.

Prerequisites:

- Docker Desktop running
- Supabase CLI available through `npx`

Run from the repository root:

```powershell
npm.cmd run db:test
```

The test verifies that tenant users can read only their own organizations,
memberships, clients, workflows, and runs. It also verifies that cross-tenant
membership writes and anonymous workflow writes are rejected.

The test runs in a transaction and rolls its fixtures back, so it does not
modify a persistent local database.
