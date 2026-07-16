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

## Use the demo

Sign in with the demo Auth user and open `/demo`. The page reads the real demo tenant through the same client, workflow, metrics, and real-estate queries used elsewhere in the portal.

The event buttons create demo records and call `ingest_workflow_run`. They never send external notifications or invoke n8n.
