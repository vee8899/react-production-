do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'lead_type' and typnamespace = 'public'::regnamespace
  ) then
    create type public.lead_type as enum ('buyer', 'seller', 'inquiry', 'other');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'lead_status' and typnamespace = 'public'::regnamespace
  ) then
    create type public.lead_status as enum ('new', 'contacted', 'qualified', 'nurture', 'converted', 'lost');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'listing_type' and typnamespace = 'public'::regnamespace
  ) then
    create type public.listing_type as enum ('sale', 'rental');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'listing_status' and typnamespace = 'public'::regnamespace
  ) then
    create type public.listing_status as enum ('draft', 'active', 'pending', 'under_contract', 'sold', 'withdrawn', 'expired');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'appointment_status' and typnamespace = 'public'::regnamespace
  ) then
    create type public.appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'workflow_entity_type' and typnamespace = 'public'::regnamespace
  ) then
    create type public.workflow_entity_type as enum ('lead', 'listing', 'appointment');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'audit_action' and typnamespace = 'public'::regnamespace
  ) then
    create type public.audit_action as enum ('created', 'updated', 'synced', 'status_changed', 'deleted');
  end if;
end $$;

alter table public.workflows
  add column if not exists feature_type public.feature_type not null default 'custom_workflow';

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  lead_type public.lead_type not null default 'inquiry',
  status public.lead_status not null default 'new',
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
  unique (client_id, source_system, external_id),
  constraint leads_contact_required check (email is not null or phone is not null or external_id is not null)
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  listing_type public.listing_type not null default 'sale',
  status public.listing_status not null default 'draft',
  address_line1 text,
  address_line2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text,
  property_type text,
  price numeric(14, 2),
  bedrooms integer,
  bathrooms numeric(5, 2),
  listing_url text,
  source_system text not null default 'internal',
  external_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, source_system, external_id),
  constraint listings_positive_dimensions check ((bedrooms is null or bedrooms >= 0) and (bathrooms is null or bathrooms >= 0)),
  constraint listings_positive_price check (price is null or price >= 0)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  appointment_type text not null default 'general',
  status public.appointment_status not null default 'scheduled',
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  notes text,
  source_system text not null default 'internal',
  external_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, source_system, external_id),
  constraint appointments_valid_window check (ends_at > starts_at)
);

create table if not exists public.automation_run_entities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  run_id uuid not null references public.automation_runs(id) on delete cascade,
  entity_type public.workflow_entity_type not null,
  entity_id uuid not null,
  action public.audit_action not null default 'updated',
  source_system text not null default 'n8n',
  external_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (run_id, entity_type, entity_id),
  unique (client_id, run_id, entity_type, entity_id)
);

create table if not exists public.record_audit_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  entity_type public.workflow_entity_type not null,
  entity_id uuid not null,
  action public.audit_action not null,
  source_system text not null default 'internal',
  external_id text,
  actor_type text not null default 'system',
  actor_id text,
  changed_fields jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists workflows_client_feature_idx
  on public.workflows (client_id, feature_type);
create index if not exists leads_client_status_idx
  on public.leads (client_id, status, updated_at desc);
create index if not exists listings_client_status_idx
  on public.listings (client_id, status, updated_at desc);
create index if not exists appointments_client_starts_idx
  on public.appointments (client_id, starts_at desc);
create index if not exists appointments_client_status_idx
  on public.appointments (client_id, status);
create index if not exists automation_run_entities_client_idx
  on public.automation_run_entities (client_id, entity_type, entity_id);
create index if not exists record_audit_log_entity_idx
  on public.record_audit_log (client_id, entity_type, entity_id, occurred_at desc);
create index if not exists record_audit_log_external_idx
  on public.record_audit_log (client_id, source_system, external_id);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.listings enable row level security;
alter table public.appointments enable row level security;
alter table public.automation_run_entities enable row level security;
alter table public.record_audit_log enable row level security;

drop policy if exists leads_select_own on public.leads;
create policy leads_select_own
  on public.leads for select to authenticated
  using (exists (select 1 from public.clients c where c.id = leads.client_id and c.user_id = (select auth.uid())));

drop policy if exists listings_select_own on public.listings;
create policy listings_select_own
  on public.listings for select to authenticated
  using (exists (select 1 from public.clients c where c.id = listings.client_id and c.user_id = (select auth.uid())));

drop policy if exists appointments_select_own on public.appointments;
create policy appointments_select_own
  on public.appointments for select to authenticated
  using (exists (select 1 from public.clients c where c.id = appointments.client_id and c.user_id = (select auth.uid())));

drop policy if exists automation_run_entities_select_own on public.automation_run_entities;
create policy automation_run_entities_select_own
  on public.automation_run_entities for select to authenticated
  using (exists (select 1 from public.clients c where c.id = automation_run_entities.client_id and c.user_id = (select auth.uid())));

drop policy if exists record_audit_log_select_own on public.record_audit_log;
create policy record_audit_log_select_own
  on public.record_audit_log for select to authenticated
  using (exists (select 1 from public.clients c where c.id = record_audit_log.client_id and c.user_id = (select auth.uid())));

create or replace function public.ingest_automation_run(
  p_event_id text,
  p_client_id uuid,
  p_feature_type public.feature_type,
  p_workflow_name text,
  p_n8n_workflow_id text,
  p_status public.run_status,
  p_ran_at timestamptz,
  p_duration_ms integer,
  p_records_processed integer,
  p_records_failed integer,
  p_error_message text,
  p_workflow_id uuid,
  p_metadata jsonb,
  p_entity_refs jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_ref jsonb;
  v_entity_type public.workflow_entity_type;
  v_entity_id uuid;
  v_action public.audit_action;
  v_source_system text;
  v_external_id text;
  v_changed_fields jsonb;
  v_metadata jsonb;
begin
  insert into public.automation_runs (
    event_id, client_id, feature_type, workflow_name, n8n_workflow_id,
    status, ran_at, duration_ms, records_processed, records_failed,
    error_message, workflow_id, metadata
  ) values (
    p_event_id, p_client_id, p_feature_type, p_workflow_name, p_n8n_workflow_id,
    p_status, coalesce(p_ran_at, now()), p_duration_ms,
    coalesce(p_records_processed, 0), coalesce(p_records_failed, 0),
    p_error_message, p_workflow_id, coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (event_id) do update set
    client_id = excluded.client_id,
    feature_type = excluded.feature_type,
    workflow_name = excluded.workflow_name,
    n8n_workflow_id = excluded.n8n_workflow_id,
    status = excluded.status,
    ran_at = excluded.ran_at,
    duration_ms = excluded.duration_ms,
    records_processed = excluded.records_processed,
    records_failed = excluded.records_failed,
    error_message = excluded.error_message,
    workflow_id = excluded.workflow_id,
    metadata = excluded.metadata
  returning id into v_run_id;

  delete from public.automation_run_entities where run_id = v_run_id;

  for v_ref in select value from jsonb_array_elements(coalesce(p_entity_refs, '[]'::jsonb)) loop
    v_entity_type := (v_ref->>'entity_type')::public.workflow_entity_type;
    v_entity_id := (v_ref->>'entity_id')::uuid;
    v_action := coalesce((v_ref->>'action')::public.audit_action, 'updated'::public.audit_action);
    v_source_system := coalesce(nullif(v_ref->>'source_system', ''), 'n8n');
    v_external_id := nullif(v_ref->>'external_id', '');
    v_changed_fields := coalesce(v_ref->'changed_fields', '{}'::jsonb);
    v_metadata := coalesce(v_ref->'metadata', '{}'::jsonb);

    if v_entity_type = 'lead' and not exists (
      select 1 from public.leads where id = v_entity_id and client_id = p_client_id
    ) then
      raise exception 'Lead % does not belong to client %', v_entity_id, p_client_id using errcode = '23503';
    elsif v_entity_type = 'listing' and not exists (
      select 1 from public.listings where id = v_entity_id and client_id = p_client_id
    ) then
      raise exception 'Listing % does not belong to client %', v_entity_id, p_client_id using errcode = '23503';
    elsif v_entity_type = 'appointment' and not exists (
      select 1 from public.appointments where id = v_entity_id and client_id = p_client_id
    ) then
      raise exception 'Appointment % does not belong to client %', v_entity_id, p_client_id using errcode = '23503';
    end if;

    insert into public.automation_run_entities (
      client_id, run_id, entity_type, entity_id, action,
      source_system, external_id, metadata
    ) values (
      p_client_id, v_run_id, v_entity_type, v_entity_id, v_action,
      v_source_system, v_external_id, v_metadata
    );

    insert into public.record_audit_log (
      client_id, entity_type, entity_id, action, source_system,
      external_id, actor_type, changed_fields, metadata
    ) values (
      p_client_id, v_entity_type, v_entity_id, v_action, v_source_system,
      v_external_id, 'automation', v_changed_fields, v_metadata
    );
  end loop;

  return v_run_id;
end;
$$;

revoke all on function public.ingest_automation_run(
  text, uuid, public.feature_type, text, text, public.run_status,
  timestamptz, integer, integer, integer, text, uuid, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.ingest_automation_run(
  text, uuid, public.feature_type, text, text, public.run_status,
  timestamptz, integer, integer, integer, text, uuid, jsonb, jsonb
) to service_role;
