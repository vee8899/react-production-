import { useRealEstateMetrics } from "@/hooks/useRealEstateMetrics";

type RealEstateMetricsProps = {
  organizationId: string;
  status: string;
};

export const RealEstateMetrics = ({ organizationId, status }: RealEstateMetricsProps) => {
  const metricsEnabled = status === "active" || status === "onboarding";
  const { data, isLoading, error } = useRealEstateMetrics(organizationId, metricsEnabled);

  if (status === "paused") {
    return <p style={{ color: "#6B6762" }}>Real-estate metrics are paused until this module is reactivated.</p>;
  }

  if (isLoading) {
    return <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Loading module metrics...</p>;
  }

  if (error) {
    return <p style={{ color: "#6B6762" }}>Real-estate operational metrics are unavailable.</p>;
  }

  const metrics = [
    [data?.activeLeads ?? 0, "Active Leads"],
    [data?.activeListings ?? 0, "Active Listings"],
    [data?.upcomingAppointments ?? 0, "Upcoming Appointments"],
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#D7D3CC]">
      {metrics.map(([value, label]) => (
        <div key={label} className="bg-[#F7F5F1] p-6">
          <p className="font-mono text-3xl" style={{ color: "#0F0E0D" }}>{value}</p>
          <p className="mt-2 text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>{label}</p>
        </div>
      ))}
    </div>
  );
};
