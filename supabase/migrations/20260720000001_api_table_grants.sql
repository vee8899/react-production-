-- PostgREST requires table privileges before RLS policies can evaluate a row.
-- These grants expose tables to authenticated clients; tenant isolation remains
-- enforced by the RLS policies defined in the platform migrations.
grant usage on schema public to authenticated;
grant select on table
  public.organizations,
  public.organization_members,
  public.clients,
  public.workflows,
  public.automation_runs,
  public.analytics_snapshots,
  public.client_services,
  public.integrations,
  public.feature_subscriptions,
  public.workflow_runs,
  public.workflow_steps,
  public.workflow_run_entities,
  public.notifications,
  public.notification_deliveries,
  public.reports,
  public.ai_jobs,
  public.audit_log,
  public.organization_onboarding,
  public.organization_onboarding_steps,
  public.legal_documents,
  public.legal_consents,
  public.cookie_preferences
to authenticated;
