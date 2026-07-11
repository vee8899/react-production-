do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'client_service_status' and typnamespace = 'public'::regnamespace
  ) then
    create type public.client_service_status as enum ('onboarding', 'active', 'paused', 'cancelled');
  end if;
end $$;

create table if not exists public.client_services (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  feature_type public.feature_type not null,
  status public.client_service_status not null default 'onboarding',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, feature_type),
  constraint client_services_supported_feature_check check (
    feature_type in (
      'lead_follow_up'::public.feature_type,
      'listing_notifications'::public.feature_type,
      'client_communication'::public.feature_type,
      'crm_sync'::public.feature_type,
      'appointment_scheduling'::public.feature_type,
      'data_pipeline'::public.feature_type
    )
  )
);

create index if not exists client_services_client_status_idx
  on public.client_services (client_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists client_services_set_updated_at on public.client_services;
create trigger client_services_set_updated_at
before update on public.client_services
for each row execute function public.set_updated_at();

alter table public.client_services enable row level security;

create policy client_services_select_own
  on public.client_services
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = client_services.client_id
        and client.user_id = (select auth.uid())
    )
  );
