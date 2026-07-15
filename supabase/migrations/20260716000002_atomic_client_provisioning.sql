-- Keep client workspace and service provisioning in one database transaction.

drop function if exists public.provision_client_workspace(text, text, text, uuid, text, jsonb);

create or replace function public.provision_client_workspace(
  p_company_name text,
  p_email text,
  p_plan text,
  p_user_id uuid,
  p_vertical_key text default 'general',
  p_feature_keys jsonb default '[]'::jsonb,
  p_services jsonb default '[]'::jsonb
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
  v_service jsonb;
  v_core_step text;
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

  for v_service in select value from jsonb_array_elements(coalesce(p_services, '[]'::jsonb)) loop
    insert into public.client_services (client_id, organization_id, feature_type, status)
    values (
      v_client_id,
      v_org_id,
      (v_service->>'feature_type')::public.feature_type,
      coalesce((v_service->>'status')::public.client_service_status, 'onboarding')
    )
    on conflict (client_id, feature_type) do update
      set organization_id = excluded.organization_id,
          status = excluded.status,
          updated_at = now();
  end loop;

  insert into public.organization_onboarding (organization_id, owner_user_id, status)
  values (v_org_id, p_user_id, 'draft')
  returning id into v_onboarding_id;

  foreach v_core_step in array v_core_steps loop
    insert into public.organization_onboarding_steps (organization_id, onboarding_id, step_key)
    values (v_org_id, v_onboarding_id, v_core_step);
  end loop;

  if exists (
    select 1 from public.feature_subscriptions
    where organization_id = v_org_id and feature_key = 'module.real_estate'
  ) then
    foreach v_core_step in array array['real_estate.lead_sources', 'real_estate.appointment_system'] loop
      insert into public.organization_onboarding_steps (organization_id, onboarding_id, step_key)
      values (v_org_id, v_onboarding_id, v_core_step);
    end loop;
  end if;

  insert into public.audit_log (organization_id, actor_type, actor_id, entity_type, entity_id, action, after_state)
  values (v_org_id, 'system', p_user_id::text, 'organization_onboarding', v_onboarding_id, 'created', jsonb_build_object('status', 'draft'));

  return query select v_org_id, v_client_id, v_onboarding_id;
end;
$$;

revoke all on function public.provision_client_workspace(text, text, text, uuid, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.provision_client_workspace(text, text, text, uuid, text, jsonb, jsonb) to service_role;
