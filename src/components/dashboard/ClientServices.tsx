import { useClientServices } from "@/hooks/useClientServices";
import { RealEstateMetrics } from "@/components/dashboard/RealEstateMetrics";

const serviceNames: Record<string, string> = {
  lead_follow_up: "Lead follow-up",
  listing_notifications: "Listing notifications",
  client_communication: "Client communications",
  crm_sync: "CRM sync",
  document_generation: "Document generation",
  appointment_scheduling: "Appointment scheduling",
  data_pipeline: "Data pipelines",
  custom_workflow: "Custom workflows",
  workflow_automation: "Workflow automation",
  integrations: "System integrations",
  notifications: "Notifications",
  reporting: "Reporting and observability",
  ai_operations: "AI-assisted operations",
  custom_modules: "Custom industry modules",
};

const moduleNames: Record<string, string> = {
  real_estate: "Real Estate Operations",
};

const statusLabels: Record<string, string> = {
  onboarding: "Onboarding",
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
  trialing: "Trialing",
  past_due: "Past due",
};

const statusColors: Record<string, string> = {
  onboarding: "#A66A00",
  active: "#16794C",
  paused: "#6B6762",
  cancelled: "#A13A32",
  trialing: "#16794C",
  past_due: "#A13A32",
};

const eligibleModuleStatuses = new Set(["onboarding", "active", "paused"]);

export const ClientServices = ({ clientId, organizationId }: { clientId: string; organizationId?: string }) => {
  const { data: services, isLoading, error } = useClientServices(clientId, organizationId);

  if (isLoading) return <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Loading services...</p>;
  if (error) return <p style={{ color: "#A13A32" }}>Unable to load service status.</p>;
  if (!services?.length) return <p style={{ color: "#6B6762" }}>Your enabled capabilities will appear here as onboarding progresses.</p>;

  const capabilities = services.filter((service) => !service.isModule);
  const modules = services.filter((service) => service.isModule && eligibleModuleStatuses.has(service.status));

  return (
    <div className="space-y-8">
      {capabilities.length > 0 ? (
        <div className="grid gap-px bg-[#D7D3CC] sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((service) => {
            const name = serviceNames[service.featureKey] ?? service.featureKey.replaceAll("_", " ");
            return (
              <div key={service.featureKey} className="bg-[#F7F5F1] p-6">
                <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>{name}</p>
                <p className="mt-3 font-mono text-xl" style={{ color: statusColors[service.status] ?? "#6B6762" }}>
                  {statusLabels[service.status] ?? service.status}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "#6B6762" }}>No platform capabilities have been subscribed yet.</p>
      )}

      {modules.map((module) => (
        <section key={module.featureKey} className="border border-border bg-[#F7F5F1] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Subscribed module</p>
              <h3 className="mt-2 font-display text-2xl" style={{ color: "#0F0E0D" }}>
                {moduleNames[module.moduleKey ?? ""] ?? module.moduleKey ?? "Industry module"}
              </h3>
            </div>
            <p className="font-mono text-sm uppercase" style={{ color: statusColors[module.status] ?? "#6B6762" }}>
              {statusLabels[module.status] ?? module.status}
            </p>
          </div>
          <div className="mt-8">
            {module.moduleKey === "real_estate" && organizationId ? (
              <RealEstateMetrics organizationId={organizationId} status={module.status} />
            ) : (
              <p style={{ color: "#6B6762" }}>This module is subscribed and ready for its operational metrics.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};
