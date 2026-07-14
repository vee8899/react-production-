create type public.organization_onboarding_status as enum (
  'draft', 'in_progress', 'submitted', 'in_review', 'ready', 'launched', 'paused'
);

create type public.organization_onboarding_step_status as enum (
  'not_started', 'in_progress', 'complete', 'blocked', 'skipped'
);

create table public.organization_onboarding (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  status public.organization_onboarding_status not null default 'draft',
  owner_user_id uuid references auth.users(id) on delete set null,
  owner_metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  submitted_at timestamptz,
  launched_at timestamptz,
  answers jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  onboarding_id uuid not null references public.organization_onboarding(id) on delete cascade,
  step_key text not null,
  status public.organization_onboarding_step_status not null default 'not_started',
  assigned_to uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (onboarding_id, step_key)
);

create index organization_onboarding_org_status_idx
  on public.organization_onboarding (organization_id, status);
create index organization_onboarding_steps_org_status_idx
  on public.organization_onboarding_steps (organization_id, status);
create index organization_onboarding_steps_assigned_idx
  on public.organization_onboarding_steps (assigned_to, status);

do $$
declare
  v_org record;
  v_onboarding_id uuid;
  v_step text;
  v_core_steps text[] := array[
    'company_profile', 'business_goals', 'workload_and_workflows',
    'selected_modules', 'integrations', 'access_and_permissions', 'launch_review'
  ];
begin
  for v_org in select id from public.organizations loop
    insert into public.organization_onboarding (organization_id, owner_user_id, status)
    select v_org.id, m.user_id, 'draft'
    from public.organization_members m
    where m.organization_id = v_org.id and m.role = 'owner'
    order by m.created_at
    limit 1
    on conflict (organization_id) do nothing
    returning id into v_onboarding_id;

    if v_onboarding_id is not null then
      foreach v_step in array v_core_steps loop
        insert into public.organization_onboarding_steps (organization_id, onboarding_id, step_key)
        values (v_org.id, v_onboarding_id, v_step)
        on conflict (onboarding_id, step_key) do nothing;
      end loop;
    end if;
    v_onboarding_id := null;
  end loop;
end;
$$;

create or replace function public.set_onboarding_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists organization_onboarding_set_updated_at on public.organization_onboarding;
create trigger organization_onboarding_set_updated_at
before update on public.organization_onboarding
for each row execute function public.set_onboarding_updated_at();

drop trigger if exists organization_onboarding_steps_set_updated_at on public.organization_onboarding_steps;
create trigger organization_onboarding_steps_set_updated_at
before update on public.organization_onboarding_steps
for each row execute function public.set_onboarding_updated_at();

create or replace function public.validate_onboarding_scope()
returns trigger
language plpgsql
as $$
begin
  if new.organization_id <> old.organization_id then
    raise exception 'Onboarding organization cannot change' using errcode = '23514';
  end if;
  if tg_table_name = 'organization_onboarding_steps' then
    if new.onboarding_id <> old.onboarding_id then
      raise exception 'Onboarding step parent cannot change' using errcode = '23514';
    end if;
    if not exists (
      select 1 from public.organization_onboarding o
      where o.id = new.onboarding_id and o.organization_id = new.organization_id
    ) then
      raise exception 'Onboarding step parent does not match organization' using errcode = '23503';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists organization_onboarding_scope_guard on public.organization_onboarding;
create trigger organization_onboarding_scope_guard
before update on public.organization_onboarding
for each row execute function public.validate_onboarding_scope();

drop trigger if exists organization_onboarding_steps_scope_guard on public.organization_onboarding_steps;
create trigger organization_onboarding_steps_scope_guard
before update on public.organization_onboarding_steps
for each row execute function public.validate_onboarding_scope();

create or replace function public.is_organization_admin(p_organization_id uuid)
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
      and m.role in ('owner', 'admin')
  );
$$;

alter table public.organization_onboarding enable row level security;
alter table public.organization_onboarding_steps enable row level security;

create policy organization_onboarding_select_member
  on public.organization_onboarding for select to authenticated
  using (public.is_organization_member(organization_id));

create policy organization_onboarding_update_member
  on public.organization_onboarding for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (
    public.is_organization_member(organization_id)
    and status in ('draft', 'in_progress')
  );

create policy organization_onboarding_steps_select_member
  on public.organization_onboarding_steps for select to authenticated
  using (public.is_organization_member(organization_id));

create policy organization_onboarding_steps_update_member
  on public.organization_onboarding_steps for update to authenticated
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create or replace function public.provision_client_workspace(
  p_company_name text,
  p_email text,
  p_plan text,
  p_user_id uuid,
  p_vertical_key text default 'general',
  p_feature_keys jsonb default '[]'::jsonb
)
returns table (organization_id uuid, client_id uuid, onboarding_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_client_id uuid;
  v_onboarding_id uuid;
  v_slug text;
  v_feature text;
  v_step text;
  v_core_steps text[] := array[
    'company_profile', 'business_goals', 'workload_and_workflows',
    'selected_modules', 'integrations', 'access_and_permissions', 'launch_review'
  ];
begin
  if nullif(trim(p_company_name), '') is null or p_user_id is null then
    raise exception 'Company name and user are required' using errcode = '22023';
  end if;

  v_slug := left(regexp_replace(lower(trim(p_company_name)), '[^a-z0-9]+', '-', 'g'), 70)
    || '-' || left(p_user_id::text, 8);

  insert into public.organizations (name, slug, vertical_key)
  values (trim(p_company_name), v_slug, coalesce(nullif(trim(p_vertical_key), ''), 'general'))
  returning id into v_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org_id, p_user_id, 'owner');

  insert into public.clients (company_name, email, plan, user_id, organization_id)
  values (trim(p_company_name), lower(trim(p_email)), coalesce(nullif(trim(p_plan), ''), 'starter'), p_user_id, v_org_id)
  returning id into v_client_id;

  for v_feature in select jsonb_array_elements_text(coalesce(p_feature_keys, '[]'::jsonb)) loop
    insert into public.feature_subscriptions (organization_id, feature_key, status)
    values (v_org_id, v_feature, 'onboarding')
    on conflict (organization_id, feature_key) do nothing;
  end loop;

  insert into public.organization_onboarding (organization_id, owner_user_id, status)
  values (v_org_id, p_user_id, 'draft')
  returning id into v_onboarding_id;

  foreach v_step in array v_core_steps loop
    insert into public.organization_onboarding_steps (organization_id, onboarding_id, step_key)
    values (v_org_id, v_onboarding_id, v_step);
  end loop;

  if exists (
    select 1 from public.feature_subscriptions
    where organization_id = v_org_id and feature_key = 'module.real_estate'
  ) then
    foreach v_step in array array['real_estate.lead_sources', 'real_estate.appointment_system'] loop
      insert into public.organization_onboarding_steps (organization_id, onboarding_id, step_key)
      values (v_org_id, v_onboarding_id, v_step);
    end loop;
  end if;

  insert into public.audit_log (organization_id, actor_type, actor_id, entity_type, entity_id, action, after_state)
  values (v_org_id, 'system', p_user_id::text, 'organization_onboarding', v_onboarding_id, 'created', jsonb_build_object('status', 'draft'));

  return query select v_org_id, v_client_id, v_onboarding_id;
end;
$$;

revoke all on function public.provision_client_workspace(text, text, text, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.provision_client_workspace(text, text, text, uuid, text, jsonb) to service_role;

create or replace function public.submit_organization_onboarding(p_onboarding_id uuid)
returns public.organization_onboarding
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.organization_onboarding;
begin
  update public.organization_onboarding
  set status = 'submitted', submitted_at = now()
  where id = p_onboarding_id
    and public.is_organization_member(organization_id)
    and status in ('draft', 'in_progress');

  if not found then
    raise exception 'Onboarding cannot be submitted' using errcode = '42501';
  end if;

  select * into v_row from public.organization_onboarding where id = p_onboarding_id;
  insert into public.audit_log (organization_id, actor_type, actor_id, entity_type, entity_id, action, after_state)
  values (v_row.organization_id, 'user', (select auth.uid())::text, 'organization_onboarding', v_row.id, 'submitted', v_row.answers);
  return v_row;
end;
$$;

revoke all on function public.submit_organization_onboarding(uuid) from public, anon;
grant execute on function public.submit_organization_onboarding(uuid) to authenticated;

create or replace function public.admin_update_organization_onboarding(
  p_onboarding_id uuid,
  p_status public.organization_onboarding_status,
  p_owner_user_id uuid default null
)
returns public.organization_onboarding
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.organization_onboarding;
begin
  update public.organization_onboarding
  set status = p_status,
      owner_user_id = coalesce(p_owner_user_id, owner_user_id),
      launched_at = case when p_status = 'launched' then coalesce(launched_at, now()) else launched_at end
  where id = p_onboarding_id
  returning * into v_row;

  if not found then
    raise exception 'Onboarding was not found' using errcode = '22023';
  end if;

  insert into public.audit_log (organization_id, actor_type, entity_type, entity_id, action, after_state)
  values (v_row.organization_id, 'admin', 'organization_onboarding', v_row.id, 'status_changed', jsonb_build_object('status', p_status, 'owner_user_id', v_row.owner_user_id));
  return v_row;
end;
$$;

revoke all on function public.admin_update_organization_onboarding(uuid, public.organization_onboarding_status, uuid) from public, anon, authenticated;
grant execute on function public.admin_update_organization_onboarding(uuid, public.organization_onboarding_status, uuid) to service_role;
