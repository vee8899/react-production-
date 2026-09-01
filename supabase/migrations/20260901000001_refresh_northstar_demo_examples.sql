-- Refresh the existing Northstar demo tenant with examples that read as
-- recent activity. This intentionally touches only rows identified as demo
-- fixtures, so customer-created tenant data is left intact.

do $$
declare
  v_client_id uuid;
  v_org_id uuid;
  v_lead_id uuid;
  v_listing_id uuid;
  v_workflow_id uuid;
begin
  select c.id, c.organization_id
    into v_client_id, v_org_id
    from public.clients c
    join public.organizations o on o.id = c.organization_id
   where c.email = 'demo@northstar.example'
     and o.name = 'Northstar Realty Demo'
   limit 1;

  if v_client_id is null then
    raise notice 'Northstar demo account has not been provisioned; skipping demo refresh.';
    return;
  end if;

  insert into real_estate.leads (
    organization_id, lead_type, status, first_name, last_name, email, phone,
    source_system, external_id, metadata
  ) values
    (v_org_id, 'buyer', 'qualified', 'Sofia', 'Patel', 'sofia.patel@example.test', '555-0141', 'demo-website', 'demo-lead-001', '{"demo":true,"example":"website-inquiry"}'::jsonb),
    (v_org_id, 'seller', 'contacted', 'Marcus', 'Owens', 'marcus.owens@example.test', '555-0142', 'demo-referral', 'demo-lead-002', '{"demo":true,"example":"referral"}'::jsonb),
    (v_org_id, 'inquiry', 'new', 'Elena', 'Martinez', 'elena.martinez@example.test', '555-0143', 'demo-listing-portal', 'demo-lead-003', '{"demo":true,"example":"listing-alert"}'::jsonb)
  on conflict (organization_id, source_system, external_id) do update
    set lead_type = excluded.lead_type,
        status = excluded.status,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        metadata = excluded.metadata,
        updated_at = now();

  insert into real_estate.listings (
    organization_id, listing_type, status, address_line1, city, state_region,
    postal_code, country_code, property_type, price, bedrooms, bathrooms,
    source_system, external_id, metadata
  ) values
    (v_org_id, 'sale', 'active', '1847 Juniper Street', 'Austin', 'TX', '78704', 'US', 'single_family', 725000, 3, 2.5, 'demo-mls', 'demo-listing-001', '{"demo":true,"example":"price-update"}'::jsonb),
    (v_org_id, 'sale', 'under_contract', '92 Harbor View Drive', 'Charleston', 'SC', '29401', 'US', 'townhouse', 945000, 4, 3, 'demo-mls', 'demo-listing-002', '{"demo":true,"example":"contract-update"}'::jsonb)
  on conflict (organization_id, source_system, external_id) do update
    set listing_type = excluded.listing_type,
        status = excluded.status,
        address_line1 = excluded.address_line1,
        city = excluded.city,
        state_region = excluded.state_region,
        postal_code = excluded.postal_code,
        country_code = excluded.country_code,
        property_type = excluded.property_type,
        price = excluded.price,
        bedrooms = excluded.bedrooms,
        bathrooms = excluded.bathrooms,
        metadata = excluded.metadata,
        updated_at = now();

  select id into v_lead_id
    from real_estate.leads
   where organization_id = v_org_id
     and source_system = 'demo-website'
     and external_id = 'demo-lead-001';

  select id into v_listing_id
    from real_estate.listings
   where organization_id = v_org_id
     and source_system = 'demo-mls'
     and external_id = 'demo-listing-001';

  insert into real_estate.appointments (
    organization_id, lead_id, listing_id, appointment_type, status, title,
    starts_at, ends_at, timezone, notes, source_system, external_id, metadata
  ) values (
    v_org_id, v_lead_id, v_listing_id, 'property_tour', 'confirmed',
    'Juniper Street property tour', now() + interval '1 day',
    now() + interval '1 day 1 hour', 'America/Chicago',
    'Confirmed after website inquiry.', 'demo-calendar', 'demo-appointment-001',
    '{"demo":true,"example":"confirmed-tour"}'::jsonb
  )
  on conflict (organization_id, source_system, external_id) do update
    set lead_id = excluded.lead_id,
        listing_id = excluded.listing_id,
        status = excluded.status,
        title = excluded.title,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        timezone = excluded.timezone,
        notes = excluded.notes,
        metadata = excluded.metadata,
        updated_at = now();

  select id into v_workflow_id
    from public.workflows
   where client_id = v_client_id
     and n8n_workflow_id = 'demo-lead-follow-up';

  perform public.ingest_workflow_run(
    'demo-seed-lead-follow-up', v_client_id, v_org_id, 'lead_follow_up',
    'New lead follow-up', 'demo-lead-follow-up', 'success', v_workflow_id,
    now() - interval '18 minutes', now() - interval '18 minutes' + interval '2 seconds',
    1840, 0, 1, 0, null, '{"demo":true,"example":"website-inquiry"}'::jsonb,
    '[{"step_key":"receive_lead","step_name":"Receive website inquiry","status":"success","duration_ms":180},{"step_key":"qualify_lead","step_name":"Qualify lead","status":"success","duration_ms":860},{"step_key":"queue_follow_up","step_name":"Queue agent follow-up","status":"success","duration_ms":800}]'::jsonb,
    jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','lead','entity_id',v_lead_id,'action','updated','source_system','demo')),
    '{"demo":true,"source":"refresh"}'::jsonb
  );

  select id into v_workflow_id
    from public.workflows
   where client_id = v_client_id
     and n8n_workflow_id = 'demo-listing-notifications';

  perform public.ingest_workflow_run(
    'demo-seed-listing-notification', v_client_id, v_org_id, 'listing_notifications',
    'Listing status notification', 'demo-listing-notifications', 'success', v_workflow_id,
    now() - interval '47 minutes', now() - interval '47 minutes' + interval '3 seconds',
    2960, 0, 2, 0, null, '{"demo":true,"example":"price-update"}'::jsonb,
    '[{"step_key":"detect_change","step_name":"Detect price update","status":"success","duration_ms":1160},{"step_key":"notify_team","step_name":"Notify listing team","status":"success","duration_ms":1800}]'::jsonb,
    jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','listing','entity_id',v_listing_id,'action','status_changed','source_system','demo')),
    '{"demo":true,"source":"refresh"}'::jsonb
  );

  select id into v_workflow_id
    from public.workflows
   where client_id = v_client_id
     and n8n_workflow_id = 'demo-appointment-scheduling';

  perform public.ingest_workflow_run(
    'demo-seed-appointment', v_client_id, v_org_id, 'appointment_scheduling',
    'Appointment confirmation', 'demo-appointment-scheduling', 'success', v_workflow_id,
    now() - interval '2 hours', now() - interval '2 hours' + interval '2 seconds',
    2210, 0, 1, 0, null, '{"demo":true,"example":"confirmed-tour"}'::jsonb,
    '[{"step_key":"read_appointment","step_name":"Read requested tour","status":"success","duration_ms":820},{"step_key":"send_confirmation","step_name":"Send tour confirmation","status":"success","duration_ms":1390}]'::jsonb,
    jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','appointment','entity_id',(select id from real_estate.appointments where organization_id = v_org_id and external_id = 'demo-appointment-001'),'action','updated','source_system','demo')),
    '{"demo":true,"source":"refresh"}'::jsonb
  );
end;
$$;
