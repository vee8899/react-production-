export const serviceCatalog = [
  { key: "workflow_automation", label: "Workflow Automation" },
  { key: "system_integrations", label: "System Integrations" },
  { key: "agentic_operations", label: "Agentic Operations" },
  { key: "notifications", label: "Notifications" },
  { key: "business_insights", label: "Business Insights" },
  { key: "modular_industry_workflows", label: "Modular Industry Workflows" },
  { key: "system_data_synchronization", label: "System Data Synchronization" },
  { key: "custom_business_solutions", label: "Custom Business Solutions" },
] as const;

export type ServiceKey = (typeof serviceCatalog)[number]["key"];

export const serviceLabels: Record<string, string> = Object.fromEntries(
  serviceCatalog.map((service) => [service.key, service.label]),
);

export const legacyServiceAliases: Record<string, ServiceKey> = {
  lead_follow_up: "workflow_automation",
  listing_notifications: "notifications",
  client_communication: "agentic_operations",
  crm_sync: "system_integrations",
  document_generation: "custom_business_solutions",
  appointment_scheduling: "workflow_automation",
  data_pipeline: "system_data_synchronization",
  custom_workflow: "custom_business_solutions",
};

export const getServiceLabel = (key: string | null | undefined) => {
  if (!key) return "Custom Business Solutions";
  return serviceLabels[key] ?? serviceLabels[legacyServiceAliases[key]] ?? key.replaceAll("_", " ");
};
