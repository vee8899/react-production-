-- Run only in hosted demo project iutycpnqlzxovffctjyz, after both 20260907 migrations.
begin;
do $$ begin
 if (select count(*) from public.clients where id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and email='demo@northstar.example')<>1 then
  raise exception 'Northstar demo identity mismatch';
 end if;
end $$;
insert into automation.configuration(singleton,organization_id,client_id,enabled)
 values(true,'72fca9a0-6b41-4f8b-a385-ddb678456ed5','031512ab-3bd0-4b6e-b4af-2cb467b95d7c',false);
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','ehuyolTR9wCTt4th','Real Estate - Lead Intake',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'lead_intake',id,n8n_workflow_id,'modular_industry_workflows',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='ehuyolTR9wCTt4th';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','8OiSVHA5ur4ck4er','Real Estate - Listing Intake',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'listing_intake',id,n8n_workflow_id,'modular_industry_workflows',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='8OiSVHA5ur4ck4er';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','tBMUKfX53tDbaw4c','Real Estate - Appointment Intake',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'appointment_intake',id,n8n_workflow_id,'modular_industry_workflows',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='tBMUKfX53tDbaw4c';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','ankwO330MgME56EA','Platform - Lead Follow-up Queue',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'lead_queue',id,n8n_workflow_id,'workflow_automation',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='ankwO330MgME56EA';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','wFbOZvL0JpZmxYOp','Platform - Appointment Reminder Queue',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'appointment_queue',id,n8n_workflow_id,'workflow_automation',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='wFbOZvL0JpZmxYOp';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','vQO59QJZ2RqWb0oS','Platform - Listing Notification Queue',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'listing_queue',id,n8n_workflow_id,'workflow_automation',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='vQO59QJZ2RqWb0oS';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','2s7jhe3GaIiJdQG7','Platform - Daily Data Pipeline Snapshot',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'daily_snapshot',id,n8n_workflow_id,'business_insights',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='2s7jhe3GaIiJdQG7';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','9zbbX0mzILkkXG1e','Platform - Event Intake & Run Logging',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'event_intake',id,n8n_workflow_id,'workflow_automation',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='9zbbX0mzILkkXG1e';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','iinJGEl68Xp2t5Re','Platform - Run Reporting Recovery',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'recovery',id,n8n_workflow_id,'workflow_automation',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='iinJGEl68Xp2t5Re';
insert into public.workflows(client_id,organization_id,n8n_workflow_id,name,is_active)
values('031512ab-3bd0-4b6e-b4af-2cb467b95d7c','72fca9a0-6b41-4f8b-a385-ddb678456ed5','2hJ2yGfSiGK2s84u','Platform - Supabase Shared Failure Handler',false)
on conflict(client_id,n8n_workflow_id) do update set name=excluded.name where workflows.organization_id=excluded.organization_id;
insert into automation.workflow_bindings(operation,workflow_id,n8n_workflow_id,feature_type,workflow_name)
select 'failure',id,n8n_workflow_id,'workflow_automation',name from public.workflows where client_id='031512ab-3bd0-4b6e-b4af-2cb467b95d7c' and organization_id='72fca9a0-6b41-4f8b-a385-ddb678456ed5' and n8n_workflow_id='2hJ2yGfSiGK2s84u';
do $$ begin if (select count(*) from automation.workflow_bindings)<>10 then raise exception 'Incomplete workflow bindings'; end if; end $$;
commit;

