-- Add representative workflow definitions and run history for every remaining
-- platform service in the Northstar demo workspace.

do $$
declare
  v_client_id uuid;
  v_org_id uuid;
  v_entity_id uuid;
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
    return;
  end if;

  select id into v_entity_id
    from real_estate.leads
   where organization_id = v_org_id
   order by created_at
   limit 1;

  insert into public.workflows (client_id, organization_id, n8n_workflow_id, name, description, feature_type, is_active)
  values
    (v_client_id, v_org_id, 'demo-agentic-operations', 'Lead enrichment assistant', 'Demo classification and enrichment support for incoming leads.', 'agentic_operations', true),
    (v_client_id, v_org_id, 'demo-business-insights', 'Operations performance report', 'Demo reporting workflow summarizes operational throughput and exceptions.', 'business_insights', true),
    (v_client_id, v_org_id, 'demo-modular-industry-workflows', 'Real-estate transaction coordination', 'Demo vertical workflow coordinates records across the real-estate module.', 'modular_industry_workflows', true),
    (v_client_id, v_org_id, 'demo-system-data-synchronization', 'Portal data synchronization', 'Demo synchronization keeps approved records aligned across connected systems.', 'system_data_synchronization', true),
    (v_client_id, v_org_id, 'demo-custom-business-solutions', 'Custom operations handoff', 'Demo custom workflow handles a business-specific exception path.', 'custom_business_solutions', true)
  on conflict (client_id, n8n_workflow_id) do update
    set organization_id = excluded.organization_id,
        name = excluded.name,
        description = excluded.description,
        feature_type = excluded.feature_type,
        is_active = excluded.is_active,
        updated_at = now();

  if v_entity_id is null then
    return;
  end if;

  select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-agentic-operations';
  perform public.ingest_workflow_run('demo-seed-agentic-operations', v_client_id, v_org_id, 'agentic_operations', 'Lead enrichment assistant', 'demo-agentic-operations', 'success', v_workflow_id, now() - interval '3 hours', now() - interval '3 hours' + interval '2 seconds', 2050, 0, 6, 0, null, '{"demo":true}'::jsonb, '[]'::jsonb, jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','lead','entity_id',v_entity_id,'action','updated','source_system','demo')), '{"demo":true,"source":"seed"}'::jsonb);

  select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-business-insights';
  perform public.ingest_workflow_run('demo-seed-business-insights', v_client_id, v_org_id, 'business_insights', 'Operations performance report', 'demo-business-insights', 'success', v_workflow_id, now() - interval '5 hours', now() - interval '5 hours' + interval '4 seconds', 3980, 0, 18, 0, null, '{"demo":true}'::jsonb, '[]'::jsonb, jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','lead','entity_id',v_entity_id,'action','synced','source_system','demo')), '{"demo":true,"source":"seed"}'::jsonb);

  select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-modular-industry-workflows';
  perform public.ingest_workflow_run('demo-seed-modular-industry-workflows', v_client_id, v_org_id, 'modular_industry_workflows', 'Real-estate transaction coordination', 'demo-modular-industry-workflows', 'success', v_workflow_id, now() - interval '7 hours', now() - interval '7 hours' + interval '3 seconds', 2760, 0, 9, 0, null, '{"demo":true}'::jsonb, '[]'::jsonb, jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','lead','entity_id',v_entity_id,'action','updated','source_system','demo')), '{"demo":true,"source":"seed"}'::jsonb);

  select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-system-data-synchronization';
  perform public.ingest_workflow_run('demo-seed-system-data-synchronization', v_client_id, v_org_id, 'system_data_synchronization', 'Portal data synchronization', 'demo-system-data-synchronization', 'success', v_workflow_id, now() - interval '9 hours', now() - interval '9 hours' + interval '5 seconds', 5120, 0, 14, 0, null, '{"demo":true}'::jsonb, '[]'::jsonb, jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','lead','entity_id',v_entity_id,'action','synced','source_system','demo')), '{"demo":true,"source":"seed"}'::jsonb);

  select id into v_workflow_id from public.workflows where client_id = v_client_id and n8n_workflow_id = 'demo-custom-business-solutions';
  perform public.ingest_workflow_run('demo-seed-custom-business-solutions', v_client_id, v_org_id, 'custom_business_solutions', 'Custom operations handoff', 'demo-custom-business-solutions', 'partial', v_workflow_id, now() - interval '1 day', now() - interval '1 day' + interval '6 seconds', 6340, 1, 5, 1, 'One demo exception requires review', '{"demo":true}'::jsonb, '[]'::jsonb, jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type','lead','entity_id',v_entity_id,'action','updated','source_system','demo')), '{"demo":true,"source":"seed"}'::jsonb);
end;
$$;
