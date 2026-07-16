-- Normalize persisted rows to the service vocabulary used by the UI.

alter table public.client_services
  drop constraint if exists client_services_supported_feature_check;

alter table public.client_services
  add constraint client_services_supported_feature_check check (
    feature_type in (
      'workflow_automation'::public.feature_type, 'system_integrations'::public.feature_type,
      'agentic_operations'::public.feature_type, 'notifications'::public.feature_type,
      'business_insights'::public.feature_type, 'modular_industry_workflows'::public.feature_type,
      'system_data_synchronization'::public.feature_type, 'custom_business_solutions'::public.feature_type,
      'lead_follow_up'::public.feature_type, 'listing_notifications'::public.feature_type,
      'client_communication'::public.feature_type, 'crm_sync'::public.feature_type,
      'document_generation'::public.feature_type, 'appointment_scheduling'::public.feature_type,
      'data_pipeline'::public.feature_type, 'custom_workflow'::public.feature_type
    )
  );

insert into public.client_services (client_id, organization_id, feature_type, status)
select client_id, organization_id, feature_type, status
from (
  select distinct on (client_id, feature_type)
    client_id,
    organization_id,
    feature_type,
    status
  from (
    select
      client_id,
      organization_id,
      case client_services.feature_type::text
        when 'lead_follow_up' then 'workflow_automation'::public.feature_type
        when 'listing_notifications' then 'notifications'::public.feature_type
        when 'client_communication' then 'agentic_operations'::public.feature_type
        when 'crm_sync' then 'system_integrations'::public.feature_type
        when 'document_generation' then 'custom_business_solutions'::public.feature_type
        when 'appointment_scheduling' then 'workflow_automation'::public.feature_type
        when 'data_pipeline' then 'system_data_synchronization'::public.feature_type
        when 'custom_workflow' then 'custom_business_solutions'::public.feature_type
      end as feature_type,
      status,
      created_at
    from public.client_services
    where client_services.feature_type::text in ('lead_follow_up', 'listing_notifications', 'client_communication', 'crm_sync', 'document_generation', 'appointment_scheduling', 'data_pipeline', 'custom_workflow')
  ) mapped
  order by client_id, feature_type,
    case status::text
      when 'active' then 4
      when 'onboarding' then 3
      when 'paused' then 2
      else 1
    end desc,
    created_at desc
) deduplicated
on conflict (client_id, feature_type) do update set status = excluded.status;

delete from public.client_services
where feature_type::text in ('lead_follow_up', 'listing_notifications', 'client_communication', 'crm_sync', 'document_generation', 'appointment_scheduling', 'data_pipeline', 'custom_workflow');

update public.workflows
set feature_type = case feature_type::text
  when 'lead_follow_up' then 'workflow_automation'::public.feature_type
  when 'listing_notifications' then 'notifications'::public.feature_type
  when 'client_communication' then 'agentic_operations'::public.feature_type
  when 'crm_sync' then 'system_integrations'::public.feature_type
  when 'document_generation' then 'custom_business_solutions'::public.feature_type
  when 'appointment_scheduling' then 'workflow_automation'::public.feature_type
  when 'data_pipeline' then 'system_data_synchronization'::public.feature_type
  when 'custom_workflow' then 'custom_business_solutions'::public.feature_type
  else feature_type
end
where feature_type::text in ('lead_follow_up', 'listing_notifications', 'client_communication', 'crm_sync', 'document_generation', 'appointment_scheduling', 'data_pipeline', 'custom_workflow');

update public.workflow_runs
set feature_key = case feature_key
  when 'lead_follow_up' then 'workflow_automation'
  when 'listing_notifications' then 'notifications'
  when 'client_communication' then 'agentic_operations'
  when 'crm_sync' then 'system_integrations'
  when 'document_generation' then 'custom_business_solutions'
  when 'appointment_scheduling' then 'workflow_automation'
  when 'data_pipeline' then 'system_data_synchronization'
  when 'custom_workflow' then 'custom_business_solutions'
  else feature_key
end
where feature_key in ('lead_follow_up', 'listing_notifications', 'client_communication', 'crm_sync', 'document_generation', 'appointment_scheduling', 'data_pipeline', 'custom_workflow');

update public.automation_runs
set feature_type = case feature_type::text
  when 'lead_follow_up' then 'workflow_automation'::public.feature_type
  when 'listing_notifications' then 'notifications'::public.feature_type
  when 'client_communication' then 'agentic_operations'::public.feature_type
  when 'crm_sync' then 'system_integrations'::public.feature_type
  when 'document_generation' then 'custom_business_solutions'::public.feature_type
  when 'appointment_scheduling' then 'workflow_automation'::public.feature_type
  when 'data_pipeline' then 'system_data_synchronization'::public.feature_type
  when 'custom_workflow' then 'custom_business_solutions'::public.feature_type
  else feature_type
end
where feature_type::text in ('lead_follow_up', 'listing_notifications', 'client_communication', 'crm_sync', 'document_generation', 'appointment_scheduling', 'data_pipeline', 'custom_workflow');
