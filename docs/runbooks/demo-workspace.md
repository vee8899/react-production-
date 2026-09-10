# Database-backed demo workspace

The demo uses a real authenticated Supabase client workspace. It is not a browser-only fixture and it does not use production client data.

## Provision the demo user

Create a dedicated Auth user in the Supabase dashboard or with an operator-only Auth command. Keep the credentials separate from production users.

Then run the seed function with the user's Auth UUID using a service-role SQL session:

```sql
select * from public.seed_demo_workspace(
  '<DEMO_AUTH_USER_ID>'::uuid,
  'demo@northstar.example'
);
```

The function creates or reuses the `Northstar Realty Demo` organization, client, services, workflows, real-estate records, workflow runs, steps, and audit links.

## Deploy the simulator

Deploy the `demo-event` Edge Function with the normal Supabase function deployment flow:

```powershell
npx supabase functions deploy demo-event
```

The function requires the normal Supabase project environment and authenticates the caller's session. It only accepts users belonging to `Northstar Realty Demo`.

The browser sends a bearer token. The function answers unauthenticated `OPTIONS` with HTTP 204 before accessing configuration, authentication, or mutation dependencies. It allows `POST, OPTIONS` and the `authorization`, `apikey`, `content-type`, and `x-client-info` headers, with `Access-Control-Allow-Origin: *` and no credentialed cookies. Success and error responses include those CORS headers. POST still requires a valid token and the caller's provisioned demo organization; request data cannot choose another tenant.

## Use the demo

Sign in with the demo Auth user and open `/demo`. The page reads the real demo tenant through the same client, workflow, metrics, and real-estate queries used elsewhere in the portal.

The event buttons create demo records and call `ingest_workflow_run`. They never send external notifications or invoke n8n.

The workflow summary shows loading, successful empty, initial failure, and cached-result refresh failure states, with retry for query errors. Event controls are restored in `finally` after all outcomes. If an event succeeds but refreshing the workspace fails, the message confirms processing and asks the user to refresh the page. An unconfirmed request asks the user to check recent activity before retrying, because demo events generate new IDs and automatic replay could duplicate records.

## Verify browser operation

Run the local executable handler and UI regression tests:

```powershell
npm.cmd run test -- --run src/test/browserEndpointHandlers.test.ts src/test/dashboardReliability.test.tsx
```

For staging, seed a dedicated demo user, complete its required legal consent, deploy the updated function, and configure `STAGING_APP_URL`, `STAGING_DEMO_EMAIL`, and `STAGING_DEMO_PASSWORD`. Then run `npm.cmd run test:e2e:staging`. The demo test creates one synthetic lead and workflow run in that tenant. It verifies a real browser POST, CORS response, successful processing message, and restored controls. Missing demo credentials skip that test; a skip is not verification. See the [staging acceptance runbook](staging-acceptance.md).
