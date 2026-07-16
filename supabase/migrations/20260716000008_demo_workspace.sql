-- Idempotently seed a production-shaped Northstar Realty demo workspace for
-- an existing Supabase Auth user. The function is service-role only; it does
-- not create Auth users or expose demo data to anonymous clients.
drop function if exists public.seed_demo_workspace(uuid, text);

create or replace function public.seed_demo_workspace(
  p_user_id uuid,
  p_email text default 'demo@northstar.example'
)
returns table (demo_organization_id uuid, demo_client_id uuid)
language plpgsql
security definer
set search_path = public, real_estate
as $$
declare
  v_org_id uuid;
  v_client_id uuid;
  v_workflow_id uuid;
  v_lead_id uuid;
  v_listing_id uuid;
  v_slug text;
begin
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'A valid Auth user is required' using errcode = '22023';
  end if;

  select c.organization_id, c.id
    into v_org_id, v_client_id
    from public.clients c
    join public.organizations o on o.id = c.organization_id
   where c.user_id = p_user_id
     and o.name = 'Northstar Realty Demo';

  if v_client_id is null then
    v_slug := left(regexp_replace('northstar-realty-demo', '[^a-z0-9]+', '-', 'g'), 70)
      || '-' || left(p_user_id::text, 8);

    insert into public.organizations (name, slug, vertical_key)
    values ('Northstar Realty Demo', v_slug, 'real_estate')
    returning id into v_org_id;

    insert into public.organization_members (organization_id, user_id, role)
    values (v_org_id, p_user_id, 'owner');

    insert into public.clients (company_name, email, plan, user_id, organization_id)
    values ('Northstar Realty Demo', lower(trim(p_email)), 'demo', p_user_id, v_org_id)
    returning id into v_client_id;

    insert into public.feature_subscriptions (organization_id, feature_key, status)
    values (v_org_id, 'module.real_estate', 'active')
    on conflict (organization_id, feature_key) do update
      set status = excluded.status,
          updated_at = now();

    insert into public.client_services (client_id, organization_id, feature_type, status)
    values
      (v_client_id, v_org_id, 'lead_follow_up', 'active'),
      (v_client_id, v_org_id, 'listing_notifications', 'active'),
      (v_client_id, v_org_id, 'appointment_scheduling', 'active'),
      (v_client_id, v_org_id, 'crm_sync', 'active')
    on conflict (client_id, feature_type) do update
      set organization_id = excluded.organization_id,
          status = excluded.status,
          updated_at = now();
  end if;

  insert into public.workflows (client_id, organization_id, n8n_workflow_id, name, description, feature_type, is_active)
  values
    (v_client_id, v_org_id, 'demo-lead-follow-up', 'New lead follow-up', 'Demo source events trigger lead qualification and follow-up.', 'lead_follow_up', true),
    (v_client_id, v_org_id, 'demo-listing-notifications', 'Listing status notification', 'Demo listing changes notify the connected team.', 'listing_notifications', true),
    (v_client_id, v_org_id, 'demo-appointment-scheduling', 'Appointment confirmation', 'Demo appointments create confirmation activity.', 'appointment_scheduling', true),
    (v_client_id, v_org_id, 'demo-crm-sync', 'CRM contact synchronization', 'Demo records synchronize to the connected CRM.', 'crm_sync', true)
  on conflict (client_id, n8n_workflow_id) do update
    set organization_id = excluded.organization_id,
        name = excluded.name,
        description = excluded.description,
        feature_type = excluded.feature_type,
        is_active = excluded.is_active,
        updated_at = now();

  insert into real_estate.leads (organization_id, lead_type, status, first_name, last_name, email, phone, source_system, external_id, metadata)
  values
    (v_org_id, 'buyer', 'qualified', 'Maya', 'Chen', 'maya.chen@example.test', '555-0101', 'demo-website', 'demo-lead-001', '{"demo":true}'::jsonb),
    (v_org_id, 'seller', 'contacted', 'Jordan', 'Ellis', 'jordan.ellis@example.test', '555-0102', 'demo-referral', 'demo-lead-002', '{"demo":true}'::jsonb),
    (v_org_id, 'inquiry', 'new', 'Rafael', 'Torres', 'rafael.torres@example.test', '555-0103', 'demo-listing-portal', 'demo-lead-003', '{"demo":true}'::jsonb)
  on conflict (organization_id, source_system, external_id) do update
    set status = excluded.status,
        updated_at = now();

  select id into v_lead_id
    from real_estate.leads
   where organization_id = v_org_id and external_id = 'demo-lead-001';

  insert into real_estate.listings (organization_id, listing_type, status, address_line1, city, state_region, postal_code, country_code, property_type, price, bedrooms, bathrooms, source_system, external_id, metadata)
  values
    (v_org_id, 'sale', 'active', '1847 Juniper Street', 'Austin', 'TX', '78704', 'US', 'single_family', 685000, 3, 2.5, 'demo-mls', 'demo-listing-001', '{"demo":true}'::jsonb),
    (v_org_id, 'sale', 'under_contract', '92 Harbor View Drive', 'Charleston', 'SC', '29401', 'US', 'townhouse', 925000, 4, 3, 'demo-mls', 'demo-listing-002', '{"demo":true}'::jsonb)
  on conflict (organization_id, source_system, external_id) do update
    set status = excluded.status,
        updated_at = now();

  select id into v_listing_id
    from real_estate.listings
   where organization_id = v_org_id and external_id = 'demo-listing-001';

  insert into real_estate.appointments (organization_id, lead_id, listing_id, appointment_type, status, title, starts_at, ends_at, timezone, notes, source_system, external_id, metadata)
  values
    (v_org_id, v_lead_id, v_listing_id, 'property_tour', 'confirmed', 'Juniper Street property tour', now() + interval '2 days', now() + interval '2 days 1 hour', 'America/Chicago', 'Demo appointment', 'demo-calendar', 'demo-appointment-001', '{"demo":true}'::jsonb)
  on conflict (organization_id, source_system, external_id) do update
    set status = excluded.status,
        updated_at = now();

  if not exists (select 1 from public.workflow_runs where organization_id = v_org_id) then
    select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-lead-follow-up';
    perform public.ingest_workflow_run(
      'demo-seed-lead-follow-up', v_client_id, v_org_id, 'lead_follow_up', 'New lead follow-up', 'demo-lead-follow-up', 'success', v_workflow_id,
      now() - interval '2 hours', now() - interval '2 hours' + interval '2 seconds', 1840, 0, 8, 0, null, '{}'::jsonb,
      '[{"step_key":"receive_lead","step_name":"Receive lead","status":"success","duration_ms":180},{"step_key":"qualify_lead","step_name":"Qualify lead","status":"success","duration_ms":860},{"step_key":"queue_follow_up","step_name":"Queue follow-up","status":"success","duration_ms":800}]'::jsonb,
      jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','lead','entity_id',v_lead_id,'action','created','source_system','demo')),
      '{"demo":true,"source":"seed"}'::jsonb
    );

    select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-listing-notifications';
    perform public.ingest_workflow_run(
      'demo-seed-listing-notification', v_client_id, v_org_id, 'listing_notifications', 'Listing status notification', 'demo-listing-notifications', 'error', v_workflow_id,
      now() - interval '1 day', now() - interval '1 day' + interval '4 seconds', 4120, 1, 11, 1, 'Demo notification provider needs attention', '{}'::jsonb,
      '[{"step_key":"detect_change","step_name":"Detect listing change","status":"success","duration_ms":1200},{"step_key":"send_notification","step_name":"Send notification","status":"error","duration_ms":2920,"error_message":"Demo notification provider needs attention"}]'::jsonb,
      jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','listing','entity_id',v_listing_id,'action','status_changed','source_system','demo')),
      '{"demo":true,"source":"seed"}'::jsonb
    );

    select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-appointment-scheduling';
    perform public.ingest_workflow_run(
      'demo-seed-appointment', v_client_id, v_org_id, 'appointment_scheduling', 'Appointment confirmation', 'demo-appointment-scheduling', 'success', v_workflow_id,
      now() - interval '2 days', now() - interval '2 days' + interval '3 seconds', 2310, 0, 4, 0, null, '{}'::jsonb,
      '[{"step_key":"read_appointment","step_name":"Read appointment","status":"success","duration_ms":900},{"step_key":"queue_confirmation","step_name":"Queue confirmation","status":"success","duration_ms":1410}]'::jsonb,
      jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','appointment','entity_id',(select id from real_estate.appointments where organization_id = v_org_id and external_id = 'demo-appointment-001'),'action','created','source_system','demo')),
      '{"demo":true,"source":"seed"}'::jsonb
    );
  end if;

  return query select v_org_id, v_client_id;
end;
$$;

revoke all on function public.seed_demo_workspace(uuid, text) from public, anon, authenticated;
grant execute on function public.seed_demo_workspace(uuid, text) to service_role;
