create schema if not exists real_estate;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  vertical_key text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  constraint organization_members_role_check check (role in ('owner', 'admin', 'member'))
);

alter table public.clients add column if not exists organization_id uuid;

insert into public.organizations (name, slug, vertical_key)
select c.company_name,
       left(regexp_replace(lower(c.company_name), '[^a-z0-9]+', '-', 'g'), 80) || '-' || left(c.id::text, 8),
       'real_estate'
from public.clients c
where c.organization_id is null
on conflict (slug) do nothing;

update public.clients c
set organization_id = o.id
from public.organizations o
where c.organization_id is null
  and o.slug = left(regexp_replace(lower(c.company_name), '[^a-z0-9]+', '-', 'g'), 80) || '-' || left(c.id::text, 8);

insert into public.organization_members (organization_id, user_id, role)
select c.organization_id, c.user_id, 'owner'
from public.clients c
where c.organization_id is not null
on conflict (organization_id, user_id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'clients_organization_id_fkey'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
      add constraint clients_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;
alter table public.clients alter column organization_id set not null;

alter table public.workflows add column if not exists organization_id uuid;
alter table public.automation_runs add column if not exists organization_id uuid;
alter table public.analytics_snapshots add column if not exists organization_id uuid;
alter table public.client_services add column if not exists organization_id uuid;

update public.workflows w set organization_id = c.organization_id
from public.clients c where w.organization_id is null and w.client_id = c.id;
update public.automation_runs r set organization_id = c.organization_id
from public.clients c where r.organization_id is null and r.client_id = c.id;
update public.analytics_snapshots s set organization_id = c.organization_id
from public.clients c where s.organization_id is null and s.client_id = c.id;
update public.client_services s set organization_id = c.organization_id
from public.clients c where s.organization_id is null and s.client_id = c.id;

alter table public.workflows alter column organization_id set not null;
alter table public.automation_runs alter column organization_id set not null;
alter table public.analytics_snapshots alter column organization_id set not null;
alter table public.client_services alter column organization_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workflows_organization_id_fkey'
      and conrelid = 'public.workflows'::regclass
  ) then
    alter table public.workflows
      add constraint workflows_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'automation_runs_organization_id_fkey'
      and conrelid = 'public.automation_runs'::regclass
  ) then
    alter table public.automation_runs
      add constraint automation_runs_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'analytics_snapshots_organization_id_fkey'
      and conrelid = 'public.analytics_snapshots'::regclass
  ) then
    alter table public.analytics_snapshots
      add constraint analytics_snapshots_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'client_services_organization_id_fkey'
      and conrelid = 'public.client_services'::regclass
  ) then
    alter table public.client_services
      add constraint client_services_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
  );
$$;

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  name text not null,
  status text not null default 'pending',
  connection_health text not null default 'unknown',
  credentials_metadata jsonb not null default '{}'::jsonb,
  configuration jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, name),
  constraint integrations_status_check check (status in ('pending', 'connected', 'paused', 'error', 'disconnected')),
  constraint integrations_health_check check (connection_health in ('unknown', 'healthy', 'degraded', 'unhealthy'))
);

create table if not exists public.feature_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  feature_key text not null,
  status text not null default 'onboarding',
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, feature_key),
  constraint feature_subscriptions_status_check check (status in ('onboarding', 'active', 'paused', 'cancelled'))
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  event_id text not null unique,
  feature_key text not null default 'custom_workflow',
  status public.run_status not null default 'success',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  retries integer not null default 0,
  records_processed integer not null default 0,
  records_failed integer not null default 0,
  outputs jsonb not null default '{}'::jsonb,
  error_message text,
  correlation_id text,
  created_at timestamptz not null default now(),
  constraint workflow_runs_nonnegative_check check (retries >= 0 and records_processed >= 0 and records_failed >= 0)
);

alter table public.automation_runs
  add column if not exists workflow_run_id uuid references public.workflow_runs(id) on delete set null;

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  step_key text not null,
  step_name text not null,
  status text not null default 'success',
  attempt integer not null default 1,
  started_at timestamptz,
  finished_at timestamptz,
  duration_ms integer,
  outputs jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  unique (workflow_run_id, step_key, attempt),
  constraint workflow_steps_attempt_check check (attempt > 0),
  constraint workflow_steps_status_check check (status in ('pending', 'running', 'success', 'error', 'skipped'))
);

create table if not exists public.workflow_run_entities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  vertical_key text not null default 'general',
  entity_type text not null,
  entity_id uuid not null,
  action text not null default 'updated',
  source_system text not null default 'internal',
  external_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workflow_run_id, entity_type, entity_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  notification_type text not null,
  subject text,
  body text not null,
  status text not null default 'queued',
  resource_type text,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_status_check check (status in ('queued', 'processing', 'sent', 'failed', 'cancelled'))
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  channel text not null,
  destination_metadata jsonb not null default '{}'::jsonb,
  provider_message_id text,
  status text not null default 'queued',
  attempts integer not null default 0,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (notification_id, channel),
  constraint notification_deliveries_channel_check check (channel in ('email', 'sms', 'webhook', 'push')),
  constraint notification_deliveries_status_check check (status in ('queued', 'sending', 'sent', 'failed', 'cancelled'))
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  report_type text not null,
  period_start date,
  period_end date,
  status text not null default 'pending',
  artifact_url text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_status_check check (status in ('pending', 'running', 'ready', 'failed'))
);

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  provider text not null,
  model text not null,
  prompt_hash text not null,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  duration_ms integer,
  cost numeric(14, 6),
  result_status text not null default 'queued',
  correlation_id text,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_jobs_status_check check (result_status in ('queued', 'running', 'succeeded', 'failed', 'cancelled'))
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_type text not null default 'system',
  actor_id text,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  request_id text,
  workflow_id uuid references public.workflows(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists workflow_runs_org_created_idx on public.workflow_runs (organization_id, created_at desc);
create index if not exists workflow_steps_run_idx on public.workflow_steps (organization_id, workflow_run_id, attempt);
create index if not exists workflow_run_entities_entity_idx on public.workflow_run_entities (organization_id, vertical_key, entity_type, entity_id);
create index if not exists integrations_org_status_idx on public.integrations (organization_id, status);
create index if not exists notifications_org_status_idx on public.notifications (organization_id, status, created_at desc);
create index if not exists notification_deliveries_org_status_idx on public.notification_deliveries (organization_id, status);
create index if not exists reports_org_period_idx on public.reports (organization_id, period_start desc, period_end desc);
create index if not exists ai_jobs_org_created_idx on public.ai_jobs (organization_id, created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (organization_id, entity_type, entity_id, created_at desc);

do $$
begin
  if to_regclass('public.leads') is not null then
    execute $migration$
      create table if not exists real_estate.leads (
        id uuid primary key default gen_random_uuid(),
        organization_id uuid not null references public.organizations(id) on delete cascade,
        lead_type text not null default 'inquiry',
        status text not null default 'new',
        first_name text,
        last_name text,
        email text,
        phone text,
        assigned_agent_external_id text,
        source_system text not null default 'internal',
        external_id text,
        metadata jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        unique (organization_id, source_system, external_id)
      )
    $migration$;
    execute $migration$
      insert into real_estate.leads (id, organization_id, lead_type, status, first_name, last_name, email, phone, assigned_agent_external_id, source_system, external_id, metadata, created_at, updated_at)
      select l.id, c.organization_id, l.lead_type::text, l.status::text, l.first_name, l.last_name, l.email, l.phone, l.assigned_agent_external_id, l.source_system, l.external_id, l.metadata, l.created_at, l.updated_at
      from public.leads l join public.clients c on c.id = l.client_id
      on conflict (id) do nothing
    $migration$;
  else
    execute $migration$
      create table if not exists real_estate.leads (
        id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
        lead_type text not null default 'inquiry', status text not null default 'new', first_name text, last_name text, email text, phone text,
        assigned_agent_external_id text, source_system text not null default 'internal', external_id text, metadata jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, source_system, external_id)
      )
    $migration$;
  end if;
end $$;

create table if not exists real_estate.listings (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  listing_type text not null default 'sale', status text not null default 'draft', address_line1 text, address_line2 text, city text,
  state_region text, postal_code text, country_code text, property_type text, price numeric(14, 2), bedrooms integer, bathrooms numeric(5, 2),
  listing_url text, source_system text not null default 'internal', external_id text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, source_system, external_id)
);

create table if not exists real_estate.appointments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references real_estate.leads(id) on delete set null, listing_id uuid references real_estate.listings(id) on delete set null,
  appointment_type text not null default 'general', status text not null default 'scheduled', title text not null, starts_at timestamptz not null,
  ends_at timestamptz not null, timezone text not null default 'UTC', notes text, source_system text not null default 'internal', external_id text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (organization_id, source_system, external_id), constraint real_estate_appointments_valid_window check (ends_at > starts_at)
);

create index if not exists real_estate_leads_org_status_idx on real_estate.leads (organization_id, status, updated_at desc);
create index if not exists real_estate_listings_org_status_idx on real_estate.listings (organization_id, status, updated_at desc);
create index if not exists real_estate_appointments_org_starts_idx on real_estate.appointments (organization_id, starts_at desc);

do $$
begin
  if to_regclass('public.listings') is not null then
    execute $migration$
      insert into real_estate.listings (id, organization_id, listing_type, status, address_line1, address_line2, city, state_region, postal_code, country_code, property_type, price, bedrooms, bathrooms, listing_url, source_system, external_id, metadata, created_at, updated_at)
      select l.id, c.organization_id, l.listing_type::text, l.status::text, l.address_line1, l.address_line2, l.city, l.state_region, l.postal_code, l.country_code, l.property_type, l.price, l.bedrooms, l.bathrooms, l.listing_url, l.source_system, l.external_id, l.metadata, l.created_at, l.updated_at
      from public.listings l join public.clients c on c.id = l.client_id
      on conflict (id) do nothing
    $migration$;
  end if;
  if to_regclass('public.appointments') is not null then
    execute $migration$
      insert into real_estate.appointments (id, organization_id, lead_id, listing_id, appointment_type, status, title, starts_at, ends_at, timezone, notes, source_system, external_id, metadata, created_at, updated_at)
      select a.id, c.organization_id, a.lead_id, a.listing_id, a.appointment_type, a.status::text, a.title, a.starts_at, a.ends_at, a.timezone, a.notes, a.source_system, a.external_id, a.metadata, a.created_at, a.updated_at
      from public.appointments a join public.clients c on c.id = a.client_id
      on conflict (id) do nothing
    $migration$;
  end if;
end $$;

drop function if exists public.ingest_automation_run(text, uuid, public.feature_type, text, text, public.run_status, timestamptz, integer, integer, integer, text, uuid, jsonb, jsonb);
drop table if exists public.record_audit_log cascade;
drop table if exists public.automation_run_entities cascade;
drop table if exists public.appointments cascade;
drop table if exists public.listings cascade;
drop table if exists public.leads cascade;
drop type if exists public.lead_type cascade;
drop type if exists public.lead_status cascade;
drop type if exists public.listing_type cascade;
drop type if exists public.listing_status cascade;
drop type if exists public.appointment_status cascade;
drop type if exists public.workflow_entity_type cascade;
drop type if exists public.audit_action cascade;

create or replace function public.ingest_workflow_run(
  p_event_id text,
  p_client_id uuid,
  p_organization_id uuid,
  p_feature_key text,
  p_workflow_name text,
  p_n8n_workflow_id text,
  p_status public.run_status,
  p_workflow_id uuid,
  p_started_at timestamptz,
  p_finished_at timestamptz,
  p_duration_ms integer,
  p_retries integer,
  p_records_processed integer,
  p_records_failed integer,
  p_error_message text,
  p_outputs jsonb,
  p_steps jsonb,
  p_entity_refs jsonb,
  p_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := p_organization_id;
  v_run_id uuid;
  v_step jsonb;
  v_ref jsonb;
  v_feature_type public.feature_type := 'custom_workflow';
begin
  if v_org_id is null then
    select c.organization_id into v_org_id from public.clients c where c.id = p_client_id;
  end if;
  if v_org_id is null then
    raise exception 'An organization is required for workflow ingestion' using errcode = '23503';
  end if;

  if p_feature_key in ('workflow_automation', 'system_integrations', 'agentic_operations', 'notifications', 'business_insights', 'modular_industry_workflows', 'system_data_synchronization', 'custom_business_solutions', 'lead_follow_up', 'listing_notifications', 'client_communication', 'crm_sync', 'document_generation', 'appointment_scheduling', 'data_pipeline', 'custom_workflow') then
    v_feature_type := p_feature_key::public.feature_type;
  end if;

  insert into public.workflow_runs (organization_id, workflow_id, event_id, feature_key, status, started_at, finished_at, duration_ms, retries, records_processed, records_failed, outputs, error_message, correlation_id)
  values (v_org_id, p_workflow_id, p_event_id, coalesce(p_feature_key, 'custom_workflow'), p_status, coalesce(p_started_at, now()), p_finished_at, p_duration_ms, coalesce(p_retries, 0), coalesce(p_records_processed, 0), coalesce(p_records_failed, 0), coalesce(p_outputs, '{}'::jsonb), p_error_message, p_event_id)
  on conflict (event_id) do update set organization_id = excluded.organization_id, workflow_id = excluded.workflow_id, feature_key = excluded.feature_key, status = excluded.status, started_at = excluded.started_at, finished_at = excluded.finished_at, duration_ms = excluded.duration_ms, retries = excluded.retries, records_processed = excluded.records_processed, records_failed = excluded.records_failed, outputs = excluded.outputs, error_message = excluded.error_message, correlation_id = excluded.correlation_id
  returning id into v_run_id;

  delete from public.workflow_steps where workflow_run_id = v_run_id;
  for v_step in select value from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) loop
    insert into public.workflow_steps (organization_id, workflow_run_id, step_key, step_name, status, attempt, started_at, finished_at, duration_ms, outputs, error_message)
    values (v_org_id, v_run_id, v_step->>'step_key', coalesce(v_step->>'step_name', v_step->>'step_key'), coalesce(v_step->>'status', 'success'), coalesce((v_step->>'attempt')::integer, 1), (v_step->>'started_at')::timestamptz, (v_step->>'finished_at')::timestamptz, (v_step->>'duration_ms')::integer, coalesce(v_step->'outputs', '{}'::jsonb), v_step->>'error_message');
  end loop;

  delete from public.workflow_run_entities where workflow_run_id = v_run_id;
  for v_ref in select value from jsonb_array_elements(coalesce(p_entity_refs, '[]'::jsonb)) loop
    if nullif(v_ref->>'entity_type', '') is null or nullif(v_ref->>'entity_id', '') is null then
      raise exception 'Workflow entity references require entity_type and entity_id' using errcode = '22023';
    end if;
    insert into public.workflow_run_entities (organization_id, workflow_run_id, vertical_key, entity_type, entity_id, action, source_system, external_id, metadata)
    values (v_org_id, v_run_id, coalesce(nullif(v_ref->>'vertical_key', ''), 'general'), v_ref->>'entity_type', (v_ref->>'entity_id')::uuid, coalesce(v_ref->>'action', 'updated'), coalesce(nullif(v_ref->>'source_system', ''), 'internal'), nullif(v_ref->>'external_id', ''), coalesce(v_ref->'metadata', '{}'::jsonb));
    insert into public.audit_log (organization_id, actor_type, entity_type, entity_id, action, after_state, request_id, workflow_id)
    values (v_org_id, 'automation', v_ref->>'entity_type', (v_ref->>'entity_id')::uuid, coalesce(v_ref->>'action', 'updated'), coalesce(v_ref->'after_state', v_ref->'metadata', '{}'::jsonb), p_event_id, p_workflow_id);
  end loop;

  insert into public.automation_runs (workflow_run_id, organization_id, event_id, client_id, workflow_id, feature_type, workflow_name, n8n_workflow_id, status, records_processed, records_failed, duration_ms, error_message, metadata, ran_at)
  values (v_run_id, v_org_id, p_event_id, p_client_id, p_workflow_id, v_feature_type, p_workflow_name, p_n8n_workflow_id, p_status, coalesce(p_records_processed, 0), coalesce(p_records_failed, 0), p_duration_ms, p_error_message, coalesce(p_metadata, '{}'::jsonb), coalesce(p_finished_at, p_started_at, now()))
  on conflict (event_id) do update set workflow_run_id = excluded.workflow_run_id, organization_id = excluded.organization_id, feature_type = excluded.feature_type, workflow_name = excluded.workflow_name, n8n_workflow_id = excluded.n8n_workflow_id, status = excluded.status, records_processed = excluded.records_processed, records_failed = excluded.records_failed, duration_ms = excluded.duration_ms, error_message = excluded.error_message, metadata = excluded.metadata, ran_at = excluded.ran_at;

  return v_run_id;
end;
$$;

revoke all on function public.ingest_workflow_run(text, uuid, uuid, text, text, text, public.run_status, uuid, timestamptz, timestamptz, integer, integer, integer, integer, text, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.ingest_workflow_run(text, uuid, uuid, text, text, text, public.run_status, uuid, timestamptz, timestamptz, integer, integer, integer, integer, text, jsonb, jsonb, jsonb, jsonb) to service_role;

do $$
declare
  r record;
begin
  for r in select n.nspname as schema_name, c.relname as table_name
           from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname in ('public', 'real_estate')
             and c.relkind = 'r'
             and c.relname in ('organizations', 'organization_members', 'clients', 'workflows', 'automation_runs', 'analytics_snapshots', 'client_services', 'integrations', 'feature_subscriptions', 'workflow_runs', 'workflow_steps', 'workflow_run_entities', 'notifications', 'notification_deliveries', 'reports', 'ai_jobs', 'audit_log', 'leads', 'listings', 'appointments')
  loop
    execute format('alter table %I.%I enable row level security', r.schema_name, r.table_name);
  end loop;
end $$;

drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member on public.organizations for select to authenticated using (public.is_organization_member(id));
drop policy if exists organization_members_select_member on public.organization_members;
create policy organization_members_select_member on public.organization_members for select to authenticated using (public.is_organization_member(organization_id));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['integrations','feature_subscriptions','workflow_runs','workflow_steps','workflow_run_entities','notifications','notification_deliveries','reports','ai_jobs','audit_log'] loop
    execute format('drop policy if exists %I_select_member on public.%I', table_name, table_name);
    execute format('create policy %I_select_member on public.%I for select to authenticated using (public.is_organization_member(organization_id))', table_name, table_name);
  end loop;
end $$;

drop policy if exists real_estate_leads_select_member on real_estate.leads;
create policy real_estate_leads_select_member on real_estate.leads for select to authenticated using (public.is_organization_member(organization_id));
drop policy if exists real_estate_listings_select_member on real_estate.listings;
create policy real_estate_listings_select_member on real_estate.listings for select to authenticated using (public.is_organization_member(organization_id));
drop policy if exists real_estate_appointments_select_member on real_estate.appointments;
create policy real_estate_appointments_select_member on real_estate.appointments for select to authenticated using (public.is_organization_member(organization_id));
