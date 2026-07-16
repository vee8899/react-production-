-- Add the canonical service keys. Legacy values remain for older integrations.
alter type public.feature_type add value if not exists 'workflow_automation';
alter type public.feature_type add value if not exists 'system_integrations';
alter type public.feature_type add value if not exists 'agentic_operations';
alter type public.feature_type add value if not exists 'notifications';
alter type public.feature_type add value if not exists 'business_insights';
alter type public.feature_type add value if not exists 'modular_industry_workflows';
alter type public.feature_type add value if not exists 'system_data_synchronization';
alter type public.feature_type add value if not exists 'custom_business_solutions';
