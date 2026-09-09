with tasks as (select * from public.operational_tasks where organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and entity_id='b9cefa62-a06d-41bf-93c6-c13310393728'),
outbox as (select * from public.run_report_outbox where organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5')
select 'completed_reminder' as check_name,count(*) as count from tasks where review_status='completed'
union all select 'cancelled_reminder',count(*) from tasks where review_status='cancelled'
union all select 'pending_reminder',count(*) from tasks where review_status='pending'
union all select 'task_audit_transitions',count(*) from public.audit_log where entity_type='operational_task' and entity_id in (select id from tasks)
union all select 'delivered_reports',count(*) from outbox where report_status='delivered'
union all select 'pending_or_leased_reports',count(*) from outbox where report_status in ('pending','leased')
union all select 'delivered_missing_canonical_run',count(*) from outbox o left join public.workflow_runs r using(event_id) where o.report_status='delivered' and r.id is null
union all select 'origin_workflow_mismatch',count(*) from outbox o join public.workflow_runs r using(event_id) join automation.workflow_bindings b on b.operation=o.operation where r.workflow_id is distinct from b.workflow_id
union all select 'quarantined_success_runs',count(*) from outbox o join public.workflow_runs r using(event_id) where o.report_status='quarantined' and r.status='success'
union all select 'zero_value_listings',count(*) from real_estate.listings where organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and source_system='n8n_acceptance_pagination' and price=0 and bedrooms=0 and bathrooms=0;
