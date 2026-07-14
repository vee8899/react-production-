import { useClientServices } from "@/hooks/useClientServices";

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

export const ClientServices = ({ clientId, organizationId }: { clientId: string; organizationId?: string }) => {
  const { data: services, isLoading, error } = useClientServices(clientId, organizationId);

  if (isLoading) return <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Loading services...</p>;
  if (error) return <p style={{ color: "#A13A32" }}>Unable to load service status.</p>;
  if (!services?.length) return <p style={{ color: "#6B6762" }}>Your enabled capabilities will appear here as onboarding progresses.</p>;

  return (
    <div className="grid gap-px bg-[#D7D3CC] sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const name = serviceNames[service.featureKey] ?? service.featureKey.replaceAll("_", " ");
        const status = service.status;
        return (
          <div key={service.featureKey} className="bg-[#F7F5F1] p-6">
            <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>{name}</p>
            <p className="mt-3 font-mono text-xl" style={{ color: statusColors[status] ?? "#6B6762" }}>
              {statusLabels[status] ?? status}
            </p>
          </div>
        );
      })}
    </div>
  );
};
