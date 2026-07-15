-- Canonical run storage and tenant-safety hardening.
-- workflow_runs is the product source of truth. automation_runs remains a
-- compatibility projection until all external consumers have migrated.

insert into public.workflow_runs (
  organization_id,
  workflow_id,
  event_id,
  feature_key,
  status,
  started_at,
  finished_at,
  duration_ms,
  retries,
  records_processed,
  records_failed,
  outputs,
  error_message,
  correlation_id,
  created_at
)
select
  legacy.organization_id,
  legacy.workflow_id,
  legacy.event_id,
  legacy.feature_type::text,
  legacy.status,
  legacy.ran_at,
  legacy.ran_at,
  legacy.duration_ms,
  0,
  legacy.records_processed,
  legacy.records_failed,
  coalesce(legacy.metadata, '{}'::jsonb),
  legacy.error_message,
  legacy.event_id,
  legacy.ran_at
from public.automation_runs legacy
where legacy.event_id is not null
  and legacy.organization_id is not null
on conflict (event_id) do nothing;

update public.automation_runs legacy
set workflow_run_id = canonical.id
from public.workflow_runs canonical
where canonical.event_id = legacy.event_id
  and legacy.workflow_run_id is distinct from canonical.id;

create index if not exists workflow_runs_organization_started_idx
  on public.workflow_runs (organization_id, started_at desc);

drop function if exists public.ingest_workflow_run(
  text, uuid, uuid, text, text, text, public.run_status, uuid,
  timestamptz, timestamptz, integer, integer, integer, integer,
  text, jsonb, jsonb, jsonb, jsonb
);

create or replace function public.ingest_workflow_run(
  p_event_id text,
  p_client_id uuid,
  p_organization_id uuid,
  p_feature_key text,
  p_workflow_name text,
  p_n8n_workflow_id text,
  p_status public.run_status,
  p_workflow_id uuid,
  p_started_at timestamptz,
  p_finished_at timestamptz,
  p_duration_ms integer,
  p_retries integer,
  p_records_processed integer,
  p_records_failed integer,
  p_error_message text,
  p_outputs jsonb,
  p_steps jsonb,
  p_entity_refs jsonb,
  p_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_client_org_id uuid;
  v_run_id uuid;
  v_legacy_run_id uuid;
  v_step jsonb;
  v_ref jsonb;
  v_feature_type public.feature_type := 'custom_workflow';
begin
  select c.organization_id
    into v_client_org_id
    from public.clients c
   where c.id = p_client_id;

  if v_client_org_id is null then
    raise exception 'Client does not exist or has no organization' using errcode = '23503';
  end if;

  if p_organization_id is not null and p_organization_id <> v_client_org_id then
    raise exception 'Client and organization do not match' using errcode = '23514';
  end if;
  v_org_id := v_client_org_id;

  if p_workflow_id is not null and not exists (
    select 1
      from public.workflows w
     where w.id = p_workflow_id
       and w.client_id = p_client_id
       and w.organization_id = v_org_id
  ) then
    raise exception 'Workflow does not belong to client organization' using errcode = '23503';
  end if;

  if p_feature_key in (
    'lead_follow_up', 'listing_notifications', 'client_communication',
    'crm_sync', 'document_generation', 'appointment_scheduling',
    'data_pipeline', 'custom_workflow'
  ) then
    v_feature_type := p_feature_key::public.feature_type;
  end if;

  insert into public.workflow_runs (
    organization_id, workflow_id, event_id, feature_key, status,
    started_at, finished_at, duration_ms, retries, records_processed,
    records_failed, outputs, error_message, correlation_id
  ) values (
    v_org_id, p_workflow_id, p_event_id, coalesce(p_feature_key, 'custom_workflow'),
    p_status, coalesce(p_started_at, now()), p_finished_at, p_duration_ms,
    coalesce(p_retries, 0), coalesce(p_records_processed, 0),
    coalesce(p_records_failed, 0), coalesce(p_outputs, '{}'::jsonb),
    p_error_message, p_event_id
  )
  on conflict (event_id) do update set
    organization_id = excluded.organization_id,
    workflow_id = excluded.workflow_id,
    feature_key = excluded.feature_key,
    status = excluded.status,
    started_at = excluded.started_at,
    finished_at = excluded.finished_at,
    duration_ms = excluded.duration_ms,
    retries = excluded.retries,
    records_processed = excluded.records_processed,
    records_failed = excluded.records_failed,
    outputs = excluded.outputs,
    error_message = excluded.error_message,
    correlation_id = excluded.correlation_id
  returning id into v_run_id;

  delete from public.workflow_steps where workflow_run_id = v_run_id;
  for v_step in select value from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) loop
    insert into public.workflow_steps (
      organization_id, workflow_run_id, step_key, step_name, status,
      attempt, started_at, finished_at, duration_ms, outputs, error_message
    ) values (
      v_org_id, v_run_id, v_step->>'step_key',
      coalesce(v_step->>'step_name', v_step->>'step_key'),
      coalesce(v_step->>'status', 'success'),
      coalesce((v_step->>'attempt')::integer, 1),
      (v_step->>'started_at')::timestamptz,
      (v_step->>'finished_at')::timestamptz,
      (v_step->>'duration_ms')::integer,
      coalesce(v_step->'outputs', '{}'::jsonb),
      v_step->>'error_message'
    );
  end loop;

  delete from public.workflow_run_entities where workflow_run_id = v_run_id;
  for v_ref in select value from jsonb_array_elements(coalesce(p_entity_refs, '[]'::jsonb)) loop
    if nullif(v_ref->>'entity_type', '') is null or nullif(v_ref->>'entity_id', '') is null then
      raise exception 'Workflow entity references require entity_type and entity_id' using errcode = '22023';
    end if;

    insert into public.workflow_run_entities (
      organization_id, workflow_run_id, vertical_key, entity_type, entity_id,
      action, source_system, external_id, metadata
    ) values (
      v_org_id, v_run_id,
      coalesce(nullif(v_ref->>'vertical_key', ''), 'general'),
      v_ref->>'entity_type', (v_ref->>'entity_id')::uuid,
      coalesce(v_ref->>'action', 'updated'),
      coalesce(nullif(v_ref->>'source_system', ''), 'internal'),
      nullif(v_ref->>'external_id', ''),
      coalesce(v_ref->'metadata', '{}'::jsonb)
    );

    insert into public.audit_log (
      organization_id, actor_type, entity_type, entity_id, action,
      after_state, request_id, workflow_id
    ) values (
      v_org_id, 'automation', v_ref->>'entity_type',
      (v_ref->>'entity_id')::uuid, coalesce(v_ref->>'action', 'updated'),
      coalesce(v_ref->'after_state', v_ref->'metadata', '{}'::jsonb),
      p_event_id, p_workflow_id
    );
  end loop;

  -- Compatibility projection only. New consumers must read workflow_runs.
  select id into v_legacy_run_id
    from public.automation_runs
   where event_id = p_event_id
   limit 1;

  if v_legacy_run_id is null then
    insert into public.automation_runs (
      workflow_run_id, organization_id, event_id, client_id, workflow_id,
      feature_type, workflow_name, n8n_workflow_id, status,
      records_processed, records_failed, duration_ms, error_message,
      metadata, ran_at
    ) values (
      v_run_id, v_org_id, p_event_id, p_client_id, p_workflow_id,
      v_feature_type, p_workflow_name, p_n8n_workflow_id, p_status,
      coalesce(p_records_processed, 0), coalesce(p_records_failed, 0),
      p_duration_ms, p_error_message, coalesce(p_metadata, '{}'::jsonb),
      coalesce(p_finished_at, p_started_at, now())
    );
  else
    update public.automation_runs
       set workflow_run_id = v_run_id,
           organization_id = v_org_id,
           feature_type = v_feature_type,
           workflow_name = p_workflow_name,
           n8n_workflow_id = p_n8n_workflow_id,
           status = p_status,
           records_processed = coalesce(p_records_processed, 0),
           records_failed = coalesce(p_records_failed, 0),
           duration_ms = p_duration_ms,
           error_message = p_error_message,
           metadata = coalesce(p_metadata, '{}'::jsonb),
           ran_at = coalesce(p_finished_at, p_started_at, now())
     where id = v_legacy_run_id;
  end if;

  return v_run_id;
end;
$$;

revoke all on function public.ingest_workflow_run(
  text, uuid, uuid, text, text, text, public.run_status, uuid,
  timestamptz, timestamptz, integer, integer, integer, integer,
  text, jsonb, jsonb, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.ingest_workflow_run(
  text, uuid, uuid, text, text, text, public.run_status, uuid,
  timestamptz, timestamptz, integer, integer, integer, integer,
  text, jsonb, jsonb, jsonb, jsonb
) to service_role;
