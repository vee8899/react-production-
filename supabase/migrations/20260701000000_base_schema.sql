create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'run_status' and typnamespace = 'public'::regnamespace
  ) then
    create type public.run_status as enum ('success', 'error', 'partial');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'feature_type' and typnamespace = 'public'::regnamespace
  ) then
    create type public.feature_type as enum (
      'lead_follow_up',
      'listing_notifications',
      'client_communication',
      'crm_sync',
      'document_generation',
      'appointment_scheduling',
      'data_pipeline',
      'custom_workflow'
    );
  end if;
end $$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text not null,
  email text not null,
  plan text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  n8n_workflow_id text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, n8n_workflow_id)
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  event_id text,
  client_id uuid not null references public.clients(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  n8n_workflow_id text not null,
  workflow_name text not null,
  feature_type public.feature_type not null default 'custom_workflow',
  status public.run_status not null default 'success',
  records_processed integer not null default 0,
  records_failed integer not null default 0,
  duration_ms integer,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  ran_at timestamptz not null default now()
);

create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  snapshot_date date not null,
  total_runs integer not null default 0,
  successful_runs integer not null default 0,
  failed_runs integer not null default 0,
  total_records integer not null default 0,
  avg_duration_ms integer,
  created_at timestamptz not null default now(),
  unique (client_id, snapshot_date)
);

create unique index if not exists automation_runs_event_id_key
  on public.automation_runs (event_id)
  where event_id is not null;

create index if not exists clients_user_id_idx
  on public.clients (user_id);

create index if not exists workflows_client_id_idx
  on public.workflows (client_id);

create index if not exists automation_runs_client_ran_at_idx
  on public.automation_runs (client_id, ran_at desc);

create index if not exists analytics_snapshots_client_date_idx
  on public.analytics_snapshots (client_id, snapshot_date desc);
