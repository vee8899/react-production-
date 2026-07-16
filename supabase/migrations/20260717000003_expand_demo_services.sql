-- Give the Northstar demo tenant the complete platform service catalog.
-- The real_estate module remains a separate feature subscription.

insert into public.client_services (client_id, organization_id, feature_type, status)
select c.id, c.organization_id, service.feature_type::public.feature_type, 'active'::public.client_service_status
from public.clients c
join public.organizations o on o.id = c.organization_id
cross join (values
  ('workflow_automation'),
  ('system_integrations'),
  ('agentic_operations'),
  ('notifications'),
  ('business_insights'),
  ('modular_industry_workflows'),
  ('system_data_synchronization'),
  ('custom_business_solutions')
) as service(feature_type)
where c.email = 'demo@northstar.example'
  and o.name = 'Northstar Realty Demo'
on conflict (client_id, feature_type) do update
  set organization_id = excluded.organization_id,
      status = excluded.status,
      updated_at = now();
