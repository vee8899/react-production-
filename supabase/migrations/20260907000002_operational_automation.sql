-- Supabase-only automation. Configuration is deliberately empty until an
-- operator verifies the demo tenant and binds the dedicated login role.
create schema if not exists automation;
revoke all on schema automation from public, anon, authenticated;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'n8n_demo_executor') then
    create role n8n_demo_executor nologin nosuperuser nocreatedb nocreaterole noinherit;
  end if;
end $$;
grant usage on schema automation to n8n_demo_executor;

create table automation.configuration (
  singleton boolean primary key default true check (singleton),
  organization_id uuid not null references public.organizations(id),
  client_id uuid not null references public.clients(id),
  execution_role name not null unique default 'n8n_demo_executor',
  enabled boolean not null default false
);
create table automation.workflow_bindings (
  operation text primary key check (operation in
    ('lead_intake','listing_intake','appointment_intake','lead_queue',
     'appointment_queue','listing_queue','daily_snapshot','event_intake','recovery','failure')),
  workflow_id uuid not null unique references public.workflows(id),
  n8n_workflow_id text not null unique,
  feature_type text not null,
  workflow_name text not null
);

create table public.operational_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_type text not null check (task_type in ('lead_follow_up','appointment_reminder','listing_review')),
  entity_type text not null check (entity_type in ('lead','appointment','listing')),
  entity_id uuid not null,
  source_revision text not null,
  deduplication_key text not null,
  due_at timestamptz not null,
  review_status text not null default 'pending' check
    (review_status in ('pending','acknowledged','completed','cancelled')),
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, deduplication_key)
);
create index operational_tasks_pending on public.operational_tasks(organization_id, due_at)
  where review_status = 'pending';
alter table public.operational_tasks enable row level security;
create policy operational_tasks_member_read on public.operational_tasks for select to authenticated
  using (public.is_organization_member(organization_id));
grant select on public.operational_tasks to authenticated;
-- Dashboard database operators can edit. Browser members intentionally cannot.

create table public.workflow_checkpoints (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  checkpoint_key text not null,
  source_revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (organization_id, checkpoint_key)
);
create table public.run_report_outbox (
  event_id text primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation text not null references automation.workflow_bindings(operation),
  request_hash text not null,
  result jsonb not null,
  payload jsonb not null,
  report_status text not null default 'pending' check
    (report_status in ('pending','leased','delivered','quarantined')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  lease_token uuid,
  lease_until timestamptz,
  last_http_status integer,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index run_report_outbox_pending on public.run_report_outbox(next_attempt_at)
  where report_status in ('pending','leased');
alter table public.workflow_checkpoints enable row level security;
alter table public.run_report_outbox enable row level security;

-- Only new suite-generated reports participate; historical report duplicates
-- are preserved rather than deleted to make this constraint fit.
alter table public.reports add column automation_date date;
create unique index reports_automation_day on public.reports
  (organization_id,report_type,automation_date) where automation_date is not null;

create sequence automation.source_revision;
alter table real_estate.leads add column automation_revision bigint not null default 0;
alter table real_estate.listings add column automation_revision bigint not null default 0;
alter table real_estate.appointments add column automation_revision bigint not null default 0;
update real_estate.leads set automation_revision=nextval('automation.source_revision');
update real_estate.listings set automation_revision=nextval('automation.source_revision');
update real_estate.appointments set automation_revision=nextval('automation.source_revision');

create function automation.source_changed() returns trigger
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
begin
  -- Share the same lock with pollers, including writes made in the dashboard.
  -- Allocate the revision after locking so checkpoints cannot pass uncommitted changes.
  perform pg_advisory_xact_lock(hashtextextended(new.organization_id::text, 417));
  if tg_op = 'UPDATE' then
    if new.organization_id <> old.organization_id then
      raise exception 'Entity organization is immutable' using errcode = '23514';
    end if;
    if (to_jsonb(new) - array['updated_at','automation_revision']) =
       (to_jsonb(old) - array['updated_at','automation_revision']) then
      new.updated_at := old.updated_at;
      new.automation_revision := old.automation_revision;
      return new;
    end if;
  end if;
  new.automation_revision := nextval('automation.source_revision');
  new.updated_at := clock_timestamp();
  return new;
end $$;
create trigger automation_lead_revision before insert or update on real_estate.leads
  for each row execute function automation.source_changed();
create trigger automation_listing_revision before insert or update on real_estate.listings
  for each row execute function automation.source_changed();
create trigger automation_appointment_revision before insert or update on real_estate.appointments
  for each row execute function automation.source_changed();

create function automation.task_audit() returns trigger
language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if tg_op = 'UPDATE' then
    if (to_jsonb(new) - array['review_status','resolution_note','updated_at']) <>
       (to_jsonb(old) - array['review_status','resolution_note','updated_at']) then
      raise exception 'Task identity is immutable' using errcode = '23514';
    end if;
    new.updated_at := clock_timestamp();
    if new.review_status is distinct from old.review_status then
      insert into public.audit_log(organization_id,actor_type,actor_id,entity_type,entity_id,action,before_state,after_state)
      values(new.organization_id,'operator',session_user,'operational_task',new.id,'status_changed',
        jsonb_build_object('review_status',old.review_status),
        jsonb_build_object('review_status',new.review_status));
    end if;
  end if;
  return new;
end $$;
create trigger operational_task_audit before update on public.operational_tasks
  for each row execute function automation.task_audit();

create function automation.context(p_operation text) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c automation.configuration; w automation.workflow_bindings;
begin
  select * into c from automation.configuration where singleton and enabled;
  if not found or session_user <> c.execution_role then
    raise exception 'Automation execution is not configured for this login' using errcode = '42501';
  end if;
  select * into w from automation.workflow_bindings where operation = p_operation;
  if not found or not exists(select 1 from public.clients where id=c.client_id and organization_id=c.organization_id)
    or not exists(select 1 from public.workflows where id=w.workflow_id and client_id=c.client_id
      and organization_id=c.organization_id and n8n_workflow_id=w.n8n_workflow_id) then
    raise exception 'Invalid automation binding' using errcode = '42501';
  end if;
  return to_jsonb(c) || to_jsonb(w);
end $$;

create function automation.enqueue(p_operation text,p_event text,p_hash text,p_result jsonb,
  p_count integer,p_refs jsonb default '[]',p_error text default null) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb := automation.context(p_operation); v_status text;
begin
  v_status := case when p_error is null then 'success' else 'error' end;
  insert into public.run_report_outbox(event_id,organization_id,operation,request_hash,result,payload)
  values(p_event,(c->>'organization_id')::uuid,p_operation,p_hash,p_result,
    jsonb_build_object('event_id',p_event,'organization_id',c->>'organization_id',
      'client_id',c->>'client_id','workflow_id',c->>'workflow_id',
      'workflow_name',c->>'workflow_name','n8n_workflow_id',c->>'n8n_workflow_id',
      'feature_type',c->>'feature_type','status',v_status,'records_processed',p_count,
      'records_failed',case when p_error is null then 0 else 1 end,'error_message',p_error,
      'entity_refs',p_refs,'metadata',jsonb_build_object('operation',p_operation,'work_identified',p_count),
      'workflow_steps',jsonb_build_array(jsonb_build_object('step_key',p_operation,
        'status',v_status,'outputs',jsonb_build_object('records_processed',p_count)))));
  return p_result || jsonb_build_object('event_id',p_event,'report_status','pending');
end $$;

create function automation.intake(p_operation text,p_event text,p_body jsonb) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare
  c jsonb := automation.context(p_operation); org uuid := (c->>'organization_id')::uuid;
  v_table text; fields text[]; v_columns text; v_assign text; v_old jsonb; v_new jsonb;
  v_id uuid; v_hash text := md5(p_body::text); prior public.run_report_outbox; v_result jsonb;
begin
  if p_operation not in ('lead_intake','listing_intake','appointment_intake') then
    raise exception 'Unsupported intake' using errcode='22023';
  end if;
  if p_event is null or length(p_event) not between 1 and 200 then
    return jsonb_build_object('http_status',400,'error','A stable event_id of 1-200 characters is required');
  end if;
  perform pg_advisory_xact_lock(hashtextextended(org::text,417));
  select * into prior from public.run_report_outbox where event_id=p_event;
  if found then
    if prior.organization_id<>org or prior.operation<>p_operation or prior.request_hash<>v_hash then
      return jsonb_build_object('http_status',409,'error','Event ID conflict');
    end if;
    return prior.result || jsonb_build_object('event_id',p_event,'report_status',prior.report_status);
  end if;
  begin
    if jsonb_typeof(p_body) <> 'object' or p_body is null then raise exception 'Invalid body' using errcode='22023'; end if;
    if (p_body ? 'organization_id' and p_body->>'organization_id' is distinct from org::text)
      or (p_body ? 'client_id' and p_body->>'client_id' is distinct from c->>'client_id')
      or (p_body ? 'workflow_id' and p_body->>'workflow_id' is distinct from c->>'workflow_id')
      or (p_body ? 'n8n_workflow_id' and p_body->>'n8n_workflow_id' is distinct from c->>'n8n_workflow_id') then
      raise exception 'Conflicting trusted identifier' using errcode='22023';
    end if;
    if length(coalesce(btrim(p_body->>'external_id'),'')) not between 1 and 255
      or length(coalesce(btrim(p_body->>'source_system'),'')) not between 1 and 80 then
      raise exception 'Source identity required' using errcode='22023';
    end if;
    if p_operation='lead_intake' then
      v_table := 'leads';
      fields := array['lead_type','status','first_name','last_name','email','phone','assigned_agent_external_id','source_system','external_id','metadata'];
    elsif p_operation='listing_intake' then
      v_table := 'listings';
      fields := array['listing_type','status','address_line1','address_line2','city','state_region','postal_code','country_code','property_type','price','bedrooms','bathrooms','listing_url','source_system','external_id','metadata'];
    else
      v_table := 'appointments';
      fields := array['lead_id','listing_id','appointment_type','status','title','starts_at','ends_at','timezone','notes','source_system','external_id','metadata'];
    end if;
    if exists(select 1 from jsonb_object_keys(p_body) k where k <> all(fields ||
      array['organization_id','client_id','workflow_id','n8n_workflow_id','event_id'])) then
      raise exception 'Unknown or protected field' using errcode='22023';
    end if;
    execute format('select to_jsonb(t) from real_estate.%I t where organization_id=$1 and source_system=$2 and external_id=$3 for update',v_table)
      into v_old using org,p_body->>'source_system',p_body->>'external_id';
    v_id := coalesce((v_old->>'id')::uuid,gen_random_uuid());
    v_new := coalesce(v_old,jsonb_build_object('id',v_id,'organization_id',org,'metadata','{}'::jsonb,
      'created_at',now(),'updated_at',now(),'automation_revision',0)) ||
      (p_body - array['organization_id','client_id','workflow_id','n8n_workflow_id','event_id']);
    if p_operation='lead_intake' then
      v_new := jsonb_build_object('lead_type','inquiry','status','new') || v_new;
      if coalesce(nullif(btrim(v_new->>'email'),''),nullif(btrim(v_new->>'phone'),'')) is null
        or v_new->>'status' not in ('new','contacted','qualified','nurture','converted','lost','closed') then
        raise exception 'Lead contact or status invalid' using errcode='22023';
      end if;
    elsif p_operation='listing_intake' then
      v_new := jsonb_build_object('listing_type','sale','status','draft') || v_new;
      if nullif(btrim(v_new->>'address_line1'),'') is null
        or v_new->>'status' not in ('draft','active','pending','sold','rented','withdrawn','inactive')
        or (v_new->>'price')::numeric < 0 or (v_new->>'bedrooms')::integer < 0 or (v_new->>'bathrooms')::numeric < 0 then
        raise exception 'Listing fields invalid' using errcode='22023';
      end if;
    else
      v_new := jsonb_build_object('appointment_type','general','status','scheduled','timezone','UTC') || v_new;
      if nullif(btrim(v_new->>'title'),'') is null or v_new->>'starts_at' is null or v_new->>'ends_at' is null
        or v_new->>'starts_at' !~ '(Z|[+-][0-9]{2}:[0-9]{2})$'
        or v_new->>'ends_at' !~ '(Z|[+-][0-9]{2}:[0-9]{2})$'
        or (v_new->>'ends_at')::timestamptz <= (v_new->>'starts_at')::timestamptz
        or v_new->>'status' not in ('scheduled','confirmed','completed','cancelled','no_show') then
        raise exception 'Appointment fields invalid' using errcode='22023';
      end if;
      if (v_new->>'lead_id' is not null and not exists(select 1 from real_estate.leads where id=(v_new->>'lead_id')::uuid and organization_id=org))
        or (v_new->>'listing_id' is not null and not exists(select 1 from real_estate.listings where id=(v_new->>'listing_id')::uuid and organization_id=org)) then
        raise exception 'Invalid linked entity' using errcode='22023';
      end if;
    end if;
    select string_agg(format('%I',f),','),string_agg(format('%I=excluded.%I',f,f),',')
      into v_columns,v_assign from unnest(fields) f;
    execute format('insert into real_estate.%1$I (id,organization_id,%2$s) select id,organization_id,%2$s from jsonb_populate_record(null::real_estate.%1$I,$1) on conflict (organization_id,source_system,external_id) do update set %3$s returning id',v_table,v_columns,v_assign)
      into v_id using v_new;
    if p_operation='appointment_intake' then
      update public.operational_tasks set review_status='cancelled',resolution_note='Appointment cancelled or rescheduled'
      where organization_id=org and entity_type='appointment' and entity_id=v_id and review_status='pending'
        and (v_new->>'status' not in ('scheduled','confirmed') or source_revision <> ((v_new->>'starts_at')::timestamptz at time zone 'UTC')::text);
    end if;
    v_result := jsonb_build_object('http_status',200,'ok',true,'entity_id',v_id);
  exception when data_exception or integrity_constraint_violation then
    return automation.enqueue(p_operation,p_event,v_hash,
      jsonb_build_object('http_status',400,'error','Invalid request or linked entity'),0,'[]','intake_validation_failed');
  end;
  return automation.enqueue(p_operation,p_event,v_hash,v_result,1,
    jsonb_build_array(jsonb_build_object('vertical_key','real_estate','entity_type',left(v_table,length(v_table)-1),
      'entity_id',v_id,'action',case when v_old is null then 'created' else 'updated' end)));
end $$;

create function automation.poll(p_operation text,p_event text,p_cursor uuid default null) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb := automation.context(p_operation); org uuid := (c->>'organization_id')::uuid;
  r record; v_count integer:=0; v_scanned integer:=0; v_inserted integer; v_checkpoint bigint:=0;
  v_type text; v_entity text; v_revision text; v_due timestamptz; v_next uuid;
  v_hash text := md5(p_operation || coalesce(p_cursor::text,'')); prior public.run_report_outbox;
begin
  if p_operation not in ('lead_queue','listing_queue','appointment_queue') or
    p_event is null or length(p_event) not between 1 and 200 then
    raise exception 'Invalid polling operation or event' using errcode='22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(org::text,417));
  select * into prior from public.run_report_outbox where event_id=p_event;
  if found then
    if prior.organization_id<>org or prior.operation<>p_operation or prior.request_hash<>v_hash then
      raise exception 'Event ID conflict' using errcode='P4091';
    end if;
    return prior.result || jsonb_build_object('event_id',p_event,'report_status',prior.report_status);
  end if;
  -- Also reconcile changes made directly in the Supabase dashboard.
  if p_operation='appointment_queue' then
    update public.operational_tasks t set review_status='cancelled',resolution_note='Appointment obsolete'
    where t.organization_id=org and t.task_type='appointment_reminder' and t.review_status='pending'
      and not exists(select 1 from real_estate.appointments a where a.id=t.entity_id and a.organization_id=org
        and a.status in ('scheduled','confirmed') and a.starts_at>now()
        and (a.starts_at at time zone 'UTC')::text=t.source_revision);
  end if;
  if p_operation='listing_queue' then
    insert into public.workflow_checkpoints(organization_id,checkpoint_key) values(org,'listing_queue') on conflict do nothing;
    select source_revision into v_checkpoint from public.workflow_checkpoints
      where organization_id=org and checkpoint_key='listing_queue' for update;
  end if;
  for r in
    select * from (
      select id, automation_revision, updated_at as due_at, status, null::timestamptz as starts_at
      from real_estate.leads where p_operation='lead_queue' and organization_id=org
        and status in ('new','contacted','nurture') and updated_at<=now()-interval '24 hours'
        and (p_cursor is null or id>p_cursor)
      union all
      select id,automation_revision,updated_at,status,null::timestamptz
      from real_estate.listings where p_operation='listing_queue' and organization_id=org
        and automation_revision>v_checkpoint
      union all
      select id,automation_revision,starts_at,status,starts_at
      from real_estate.appointments where p_operation='appointment_queue' and organization_id=org
        and status in ('scheduled','confirmed') and starts_at>now() and starts_at<=now()+interval '24 hours'
        and (p_cursor is null or id>p_cursor)
    ) entities order by case when p_operation='listing_queue' then automation_revision else 0 end,id limit 100
  loop
    v_scanned:=v_scanned+1; v_next:=r.id;
    if p_operation='listing_queue' then
      v_checkpoint:=r.automation_revision;
      if r.status<>'active' then continue; end if;
      v_type:='listing_review'; v_entity:='listing';
    elsif p_operation='lead_queue' then
      v_type:='lead_follow_up'; v_entity:='lead';
    else
      v_type:='appointment_reminder'; v_entity:='appointment';
    end if;
    v_revision:=case when p_operation='appointment_queue' then (r.starts_at at time zone 'UTC')::text else r.automation_revision::text end;
    v_due:=case when p_operation='lead_queue' then r.due_at+interval '24 hours' else r.due_at end;
    insert into public.operational_tasks(organization_id,task_type,entity_type,entity_id,source_revision,deduplication_key,due_at)
      values(org,v_type,v_entity,r.id,v_revision,v_type||':'||r.id||':'||v_revision,v_due)
      on conflict (organization_id,deduplication_key) do nothing;
    get diagnostics v_inserted=row_count;
    v_count:=v_count+v_inserted;
  end loop;
  if p_operation='listing_queue' then
    update public.workflow_checkpoints set source_revision=v_checkpoint,updated_at=now()
      where organization_id=org and checkpoint_key='listing_queue';
  end if;
  return automation.enqueue(p_operation,p_event,v_hash,
    jsonb_build_object('ok',true,'http_status',200,'records_processed',v_count,'records_scanned',v_scanned,
      'next_cursor',v_next,'has_more',v_scanned=100,'checkpoint',v_checkpoint),v_count);
end $$;

create function automation.snapshot(p_event text) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb:=automation.context('daily_snapshot'); org uuid:=(c->>'organization_id')::uuid;
  v_date date:=(now() at time zone 'UTC')::date; v_data jsonb; v_id uuid; prior public.run_report_outbox;
begin
  if p_event is null or length(p_event) not between 1 and 200 then raise exception 'Invalid event' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(org::text,417));
  select * into prior from public.run_report_outbox where event_id=p_event;
  if found then
    if prior.organization_id<>org or prior.operation<>'daily_snapshot' then raise exception 'Event ID conflict' using errcode='P4091'; end if;
    return prior.result || jsonb_build_object('event_id',p_event,'report_status',prior.report_status);
  end if;
  select jsonb_build_object(
    'leads',(select count(*) from real_estate.leads where organization_id=org),
    'listings',(select count(*) from real_estate.listings where organization_id=org),
    'appointments',(select count(*) from real_estate.appointments where organization_id=org),
    'pending_tasks',(select count(*) from public.operational_tasks where organization_id=org and review_status='pending'),
    'pending_lead_follow_up',(select count(*) from public.operational_tasks where organization_id=org and review_status='pending' and task_type='lead_follow_up'),
    'pending_appointment_reminder',(select count(*) from public.operational_tasks where organization_id=org and review_status='pending' and task_type='appointment_reminder'),
    'pending_listing_review',(select count(*) from public.operational_tasks where organization_id=org and review_status='pending' and task_type='listing_review')
  ) into v_data;
  insert into public.reports(organization_id,report_type,automation_date,period_start,period_end,status,data)
    values(org,'operational_snapshot',v_date,v_date,v_date,'ready',v_data)
    on conflict (organization_id,report_type,automation_date) where automation_date is not null
    do update set data=excluded.data,status='ready',updated_at=now() returning id into v_id;
  return automation.enqueue('daily_snapshot',p_event,md5(v_date::text),
    jsonb_build_object('ok',true,'http_status',200,'report_id',v_id,'counts',v_data),1);
end $$;

create function automation.claim_reports(p_event text default null) returns setof jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb:=automation.context('recovery'); org uuid:=(c->>'organization_id')::uuid;
begin
  return query with candidates as (
    select event_id from public.run_report_outbox where organization_id=org
      and (p_event is null or event_id=p_event)
      and ((report_status='pending' and next_attempt_at<=now()) or
           (report_status='leased' and lease_until<=now()))
    order by created_at,event_id limit 100 for update skip locked
  ), leased as (
    update public.run_report_outbox o set report_status='leased',lease_token=gen_random_uuid(),
      lease_until=now()+interval '5 minutes',updated_at=now()
    from candidates c where o.event_id=c.event_id returning o.*
  ) select jsonb_build_object('event_id',event_id,'lease_token',lease_token,'payload',payload) from leased;
end $$;

create function automation.pending_report_ids() returns table(event_id text)
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb:=automation.context('recovery');
begin
  return query select o.event_id from public.run_report_outbox o
    where organization_id=(c->>'organization_id')::uuid
      and ((report_status='pending' and next_attempt_at<=now()) or
        (report_status='leased' and lease_until<=now()))
    order by created_at,o.event_id limit 100;
end $$;

create function automation.finish_report(p_event text,p_lease uuid,p_http integer,p_ok boolean,p_attempts integer)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb:=automation.context('recovery'); v_status text;
begin
  if p_attempts not between 1 and 3 or p_http not between 0 and 599 then
    raise exception 'Invalid reporting result' using errcode='22023';
  end if;
  v_status:=case when p_http=200 and p_ok then 'delivered'
    when p_http=0 or p_http=429 or p_http>=500 then 'pending' else 'quarantined' end;
  update public.run_report_outbox set report_status=v_status,attempts=attempts+p_attempts,
    next_attempt_at=now()+interval '15 minutes',lease_token=null,lease_until=null,
    last_http_status=p_http,last_error_code=case when v_status='delivered' then null
      when v_status='pending' then 'report_transport_unavailable' else 'report_rejected' end,updated_at=now()
  where event_id=p_event and organization_id=(c->>'organization_id')::uuid
    and report_status='leased' and lease_token=p_lease;
  if not found then raise exception 'Report lease is stale' using errcode='40001'; end if;
  return jsonb_build_object('event_id',p_event,'report_status',v_status);
end $$;

create function automation.record_failure(p_origin text,p_execution text) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, automation as $$
declare c jsonb:=automation.context('failure'); v_operation text; v_event text;
begin
  select operation into v_operation from automation.workflow_bindings where n8n_workflow_id=p_origin;
  if v_operation is null or p_execution is null or length(p_execution) not between 1 and 80 then
    raise exception 'Invalid originating workflow' using errcode='22023';
  end if;
  v_event:='n8n-failure:'||p_origin||':'||p_execution;
  perform pg_advisory_xact_lock(hashtextextended(c->>'organization_id',417));
  if exists(select 1 from public.run_report_outbox where event_id=v_event) then
    return jsonb_build_object('event_id',v_event);
  end if;
  return automation.enqueue(v_operation,v_event,md5(v_event),jsonb_build_object('ok',false),0,'[]','workflow_execution_failed');
end $$;

create function automation.accept_event(p_event text,p_body jsonb) returns jsonb
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
      if jsonb_typeof(p_body->'entity_refs')<>'array' or jsonb_array_length(p_body->'entity_refs')>100 then
        raise exception 'Invalid references' using errcode='22023';
      end if;
      for ref in select value from jsonb_array_elements(p_body->'entity_refs') loop
        if not ((ref->>'entity_type'='lead' and exists(select 1 from real_estate.leads where id=(ref->>'entity_id')::uuid and organization_id=org))
          or (ref->>'entity_type'='listing' and exists(select 1 from real_estate.listings where id=(ref->>'entity_id')::uuid and organization_id=org))
          or (ref->>'entity_type'='appointment' and exists(select 1 from real_estate.appointments where id=(ref->>'entity_id')::uuid and organization_id=org))) then
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

-- No default PUBLIC execution on security-definer helpers or direct table access.
revoke all on all functions in schema automation from public, anon, authenticated;
grant execute on function automation.intake(text,text,jsonb) to n8n_demo_executor;
grant execute on function automation.accept_event(text,jsonb) to n8n_demo_executor;
grant execute on function automation.poll(text,text,uuid),automation.snapshot(text),
  automation.claim_reports(text),automation.pending_report_ids(),automation.finish_report(text,uuid,integer,boolean,integer),
  automation.record_failure(text,text) to n8n_demo_executor;
