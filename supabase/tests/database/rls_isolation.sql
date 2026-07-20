begin;

select plan(11);

-- Test fixtures are created before switching roles, just as a service-role
-- provisioning flow would create them in production.
set local role postgres;

insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'alice@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'bob@example.com')
on conflict (id) do nothing;

insert into public.organizations (id, name, slug, vertical_key)
values
  ('10000000-0000-0000-0000-000000000001', 'Alice Realty', 'rls-alice', 'real_estate'),
  ('10000000-0000-0000-0000-000000000002', 'Bob Realty', 'rls-bob', 'real_estate')
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'owner')
on conflict (organization_id, user_id) do nothing;

insert into public.clients (id, user_id, company_name, email, organization_id)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alice Realty', 'alice@example.com', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Bob Realty', 'bob@example.com', '10000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.workflows (id, client_id, organization_id, n8n_workflow_id, name)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'alice-workflow', 'Alice workflow'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'bob-workflow', 'Bob workflow')
on conflict (id) do nothing;

insert into public.workflow_runs (id, organization_id, workflow_id, event_id, feature_key, status)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'rls-alice-event', 'custom_workflow', 'success'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'rls-bob-event', 'custom_workflow', 'success')
on conflict (id) do nothing;

set local role authenticated;
set local "request.jwt.claims" = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001"}';

select is((select count(*)::int from public.organizations), 1, 'Alice sees only her organization');
select is((select count(*)::int from public.organization_members), 1, 'Alice sees only her membership');
select is((select count(*)::int from public.clients), 1, 'Alice sees only her client row');
select is((select count(*)::int from public.workflows), 1, 'Alice sees only her workflow');
select is((select count(*)::int from public.workflow_runs), 1, 'Alice sees only her workflow run');
select is((select name from public.organizations), 'Alice Realty', 'Alice cannot see Bob organization data');
select is((select name from public.workflows), 'Alice workflow', 'Alice cannot see Bob workflow data');

select throws_ok(
  $$insert into public.organization_members (organization_id, user_id, role)
    values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'member')$$,
  '42501',
  'new row violates row-level security policy for table "organization_members"',
  'Alice cannot insert a membership into Bob organization'
);

set local role anon;
set local "request.jwt.claims" = '{"role":"anon"}';

select is((select count(*)::int from public.organizations), 0, 'Anonymous users see no organizations');
select is((select count(*)::int from public.workflow_runs), 0, 'Anonymous users see no workflow runs');
select throws_ok(
  $$insert into public.workflow_runs (organization_id, event_id, feature_key, status)
    values ('10000000-0000-0000-0000-000000000001', 'rls-anon-event', 'custom_workflow', 'success')$$,
  '42501',
  'new row violates row-level security policy for table "workflow_runs"',
  'Anonymous users cannot insert workflow runs'
);

select * from finish();
rollback;
