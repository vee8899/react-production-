alter table public.clients enable row level security;
alter table public.automation_runs enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.workflows enable row level security;

drop policy if exists clients_select_own on public.clients;
create policy clients_select_own
  on public.clients
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists automation_runs_select_own on public.automation_runs;
create policy automation_runs_select_own
  on public.automation_runs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = automation_runs.client_id
        and client.user_id = (select auth.uid())
    )
  );

drop policy if exists analytics_snapshots_select_own on public.analytics_snapshots;
create policy analytics_snapshots_select_own
  on public.analytics_snapshots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = analytics_snapshots.client_id
        and client.user_id = (select auth.uid())
    )
  );

drop policy if exists workflows_select_own on public.workflows;
create policy workflows_select_own
  on public.workflows
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = workflows.client_id
        and client.user_id = (select auth.uid())
    )
  );
