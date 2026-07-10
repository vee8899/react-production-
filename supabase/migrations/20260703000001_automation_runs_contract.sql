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

alter table public.automation_runs
  add column if not exists event_id text,
  add column if not exists feature_type public.feature_type not null default 'custom_workflow';

alter table public.automation_runs
  alter column status drop default,
  alter column status type public.run_status
  using case lower(coalesce(status::text, ''))
    when 'success' then 'success'::public.run_status
    when 'completed' then 'success'::public.run_status
    when 'complete' then 'success'::public.run_status
    when 'error' then 'error'::public.run_status
    when 'failed' then 'error'::public.run_status
    when 'failure' then 'error'::public.run_status
    when 'partial' then 'partial'::public.run_status
    when 'warning' then 'partial'::public.run_status
    else 'error'::public.run_status
  end,
  alter column status set default 'success'::public.run_status,
  alter column status set not null;

alter table public.automation_runs
  alter column records_processed set default 0,
  alter column records_processed set not null,
  alter column records_failed set default 0,
  alter column records_failed set not null,
  alter column ran_at set default now(),
  alter column ran_at set not null;

alter table public.automation_runs
  alter column duration_ms drop not null;

alter table public.automation_runs
  alter column error_message drop not null;

alter table public.automation_runs
  alter column metadata set default '{}'::jsonb;

create unique index if not exists automation_runs_event_id_key
  on public.automation_runs (event_id)
  where event_id is not null;

update public.automation_runs
set feature_type = 'custom_workflow'
where feature_type is null;
