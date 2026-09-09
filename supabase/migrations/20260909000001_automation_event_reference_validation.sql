-- Reject missing/null entity types instead of allowing SQL UNKNOWN past validation.
create or replace function automation.accept_event(p_event text,p_body jsonb) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb:=automation.context('event_intake'); org uuid:=(c->>'organization_id')::uuid;
  prior public.run_report_outbox; v_hash text:=md5(p_body::text); v_result jsonb;
  v_count integer; v_failed integer; v_status text; v_refs jsonb:='[]'; ref jsonb;
begin
  if p_event is null or length(p_event) not between 1 and 200 then
    return jsonb_build_object('http_status',400,'error','A stable event_id is required');
  end if;
  perform pg_advisory_xact_lock(hashtextextended(org::text,417));
  select * into prior from public.run_report_outbox where event_id=p_event;
  if found then
    if prior.organization_id<>org or prior.operation<>'event_intake' or prior.request_hash<>v_hash then
      return jsonb_build_object('http_status',409,'error','Event ID conflict');
    end if;
    return prior.result || jsonb_build_object('event_id',p_event,'report_status',prior.report_status);
  end if;
  begin
    if jsonb_typeof(p_body)<>'object' or p_body is null then raise exception 'Invalid event' using errcode='22023'; end if;
    if (p_body ? 'organization_id' and p_body->>'organization_id' is distinct from c->>'organization_id')
      or (p_body ? 'client_id' and p_body->>'client_id' is distinct from c->>'client_id')
      or (p_body ? 'workflow_id' and p_body->>'workflow_id' is distinct from c->>'workflow_id')
      or (p_body ? 'n8n_workflow_id' and p_body->>'n8n_workflow_id' is distinct from c->>'n8n_workflow_id') then
      raise exception 'Conflicting trusted identifiers' using errcode='22023';
    end if;
    v_status:=p_body->>'status';
    v_count:=coalesce((p_body->>'records_processed')::integer,0);
    v_failed:=coalesce((p_body->>'records_failed')::integer,0);
    if v_status is null or v_status not in ('success','partial','error') or v_count<0 or v_failed<0 then
      raise exception 'Invalid event status or counts' using errcode='22023';
    end if;
    if p_body ? 'entity_refs' then
      if jsonb_typeof(p_body->'entity_refs') is distinct from 'array' or jsonb_array_length(p_body->'entity_refs')>100 then
        raise exception 'Invalid references' using errcode='22023';
      end if;
      for ref in select value from jsonb_array_elements(p_body->'entity_refs') loop
        if ((ref->>'entity_type'='lead' and exists(select 1 from real_estate.leads where id=(ref->>'entity_id')::uuid and organization_id=org))
          or (ref->>'entity_type'='listing' and exists(select 1 from real_estate.listings where id=(ref->>'entity_id')::uuid and organization_id=org))
          or (ref->>'entity_type'='appointment' and exists(select 1 from real_estate.appointments where id=(ref->>'entity_id')::uuid and organization_id=org))) is not true then
          raise exception 'Invalid linked entity' using errcode='22023';
        end if;
        v_refs:=v_refs||jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type',ref->>'entity_type','entity_id',ref->>'entity_id','action','synced'));
      end loop;
    end if;
  exception when data_exception or integrity_constraint_violation then
    return jsonb_build_object('http_status',400,'error','Invalid event or linked entity');
  end;
  v_result:=automation.enqueue('event_intake',p_event,v_hash,jsonb_build_object('http_status',202,'accepted',true),v_count,v_refs,
    case when v_status='error' then 'source_reported_failure' else null end);
  update public.run_report_outbox set payload=payload||jsonb_build_object('status',v_status,'records_failed',v_failed)
    where event_id=p_event;
  return v_result;
end $$;
