export const workflowEntityTypes = ["lead", "listing", "appointment"] as const;

export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "nurture",
  "converted",
  "lost",
] as const;

export const listingStatuses = [
  "draft",
  "active",
  "pending",
  "under_contract",
  "sold",
  "withdrawn",
  "expired",
] as const;

export const appointmentStatuses = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const auditActions = [
  "created",
  "updated",
  "synced",
  "status_changed",
  "deleted",
] as const;

export const serviceFeatureTypes = [
  "workflow_automation",
  "system_integrations",
  "agentic_operations",
  "notifications",
  "business_insights",
  "modular_industry_workflows",
  "system_data_synchronization",
  "custom_business_solutions",
] as const;

export const moduleFeatureKeys = ["module.real_estate"] as const;
