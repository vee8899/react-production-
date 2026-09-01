-- Give the Northstar demo workspace a believable mid-market monthly workload.
-- The 120 generated batch runs process exactly 1,440 work units (records) over
-- 30 days. Existing demo activity remains in place so the current-day feed
-- still shows the hand-picked examples from the refresh migration.

do $$
declare
  v_client_id uuid;
  v_org_id uuid;
  v_run record;
  v_started_at timestamptz;
  v_duration_ms integer;
  v_status public.run_status;
  v_records_failed integer;
begin
  select c.id, c.organization_id
    into v_client_id, v_org_id
    from public.clients c
    join public.organizations o on o.id = c.organization_id
   where c.email = 'demo@northstar.example'
     and o.name = 'Northstar Realty Demo'
   limit 1;

  if v_client_id is null then
    raise notice 'Northstar demo account has not been provisioned; skipping workload seed.';
    return;
  end if;

  for v_run in
    select
      day_offset,
      run_slot,
      case run_slot
        when 1 then 'demo-lead-follow-up'
        when 2 then 'demo-listing-notifications'
        when 3 then 'demo-appointment-scheduling'
        else 'demo-crm-sync'
      end as n8n_workflow_id,
      case run_slot
        when 1 then 'New lead follow-up'
        when 2 then 'Listing status notification'
        when 3 then 'Appointment confirmation'
        else 'CRM contact synchronization'
      end as workflow_name,
      case run_slot
        when 1 then 'lead_follow_up'
        when 2 then 'listing_notifications'
        when 3 then 'appointment_scheduling'
        else 'crm_sync'
      end as feature_key,
      case run_slot
        when 1 then 8
        when 2 then 11
        when 3 then 13
        else 16
      end as records_processed,
      w.id as workflow_id
    from generate_series(0, 29) as days(day_offset)
    cross join generate_series(1, 4) as slots(run_slot)
    join public.workflows w
      on w.client_id = v_client_id
     and w.n8n_workflow_id = case run_slot
       when 1 then 'demo-lead-follow-up'
       when 2 then 'demo-listing-notifications'
       when 3 then 'demo-appointment-scheduling'
       else 'demo-crm-sync'
     end
    order by day_offset desc, run_slot
  loop
    -- Keep every generated run safely in the past, including today's four
    -- batches, so operational metrics never include future activity.
    v_started_at := now()
      - (v_run.day_offset * interval '1 day')
      - ((5 - v_run.run_slot) * interval '12 minutes');
    v_duration_ms := 900 + ((v_run.day_offset * 97 + v_run.run_slot * 211) % 2600);
    v_status := case
      when (v_run.day_offset, v_run.run_slot) in ((5, 2), (13, 4), (23, 1))
        then 'partial'::public.run_status
      else 'success'::public.run_status
    end;
    v_records_failed := case when v_status = 'partial' then 1 else 0 end;

    perform public.ingest_workflow_run(
      format(
        'demo-volume-%s-%s',
        to_char((current_date - v_run.day_offset)::date, 'YYYYMMDD'),
        v_run.n8n_workflow_id
      ),
      v_client_id,
      v_org_id,
      v_run.feature_key,
      v_run.workflow_name,
      v_run.n8n_workflow_id,
      v_status,
      v_run.workflow_id,
      v_started_at,
      v_started_at + (v_duration_ms * interval '1 millisecond'),
      v_duration_ms,
      case when v_status = 'partial' then 1 else 0 end,
      v_run.records_processed,
      v_records_failed,
      case when v_status = 'partial' then 'One work item requires review' else null end,
      jsonb_build_object(
        'demo', true,
        'source', '30_day_workload_seed',
        'batch_size', v_run.records_processed
      ),
      '[]'::jsonb,
      '[]'::jsonb,
      jsonb_build_object('demo', true, 'source', '30_day_workload_seed')
    );
  end loop;

  -- Keep the Analytics view aligned with the canonical workflow-run history.
  insert into public.analytics_snapshots (
    client_id,
    organization_id,
    snapshot_date,
    total_runs,
    successful_runs,
    failed_runs,
    total_records,
    avg_duration_ms
  )
  select
    v_client_id,
    v_org_id,
    r.started_at::date,
    count(*)::integer,
    count(*) filter (where r.status = 'success')::integer,
    count(*) filter (where r.status <> 'success')::integer,
    coalesce(sum(r.records_processed), 0)::integer,
    round(avg(r.duration_ms))::integer
  from public.workflow_runs r
  where r.organization_id = v_org_id
    and r.started_at >= (current_date - interval '29 days')
    and r.started_at < (current_date + interval '1 day')
  group by r.started_at::date
  on conflict (client_id, snapshot_date) do update
    set organization_id = excluded.organization_id,
        total_runs = excluded.total_runs,
        successful_runs = excluded.successful_runs,
        failed_runs = excluded.failed_runs,
        total_records = excluded.total_records,
        avg_duration_ms = excluded.avg_duration_ms;
end;
$$;
