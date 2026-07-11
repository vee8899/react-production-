import { useClientServices } from "@/hooks/useClientServices";

const serviceNames = {
  lead_follow_up: "Lead follow-up",
  crm_sync: "CRM sync",
  data_pipeline: "Data pipelines",
  appointment_scheduling: "Appointment scheduling",
  listing_notifications: "Listing notifications",
  client_communication: "Client communications",
} as const;

const statusLabels = {
  onboarding: "Onboarding",
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
} as const;

const statusColors = {
  onboarding: "#A66A00",
  active: "#16794C",
  paused: "#6B6762",
  cancelled: "#A13A32",
} as const;

export const ClientServices = ({ clientId }: { clientId: string }) => {
  const { data: services, isLoading, error } = useClientServices(clientId);

  if (isLoading) {
    return <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Loading services...</p>;
  }

  if (error) {
    return <p style={{ color: "#A13A32" }}>Unable to load service status.</p>;
  }

  if (!services?.length) {
    return <p style={{ color: "#6B6762" }}>Your enabled services will appear here as your onboarding progresses.</p>;
  }

  return (
    <div className="grid gap-px bg-[#D7D3CC] sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const name = serviceNames[service.feature_type as keyof typeof serviceNames];
        const status = service.status;
        if (!name || !(status in statusLabels)) return null;

        return (
          <div key={service.feature_type} className="bg-[#F7F5F1] p-6">
            <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>{name}</p>
            <p className="mt-3 font-mono text-xl" style={{ color: statusColors[status] }}>
              {statusLabels[status]}
            </p>
          </div>
        );
      })}
    </div>
  );
};
