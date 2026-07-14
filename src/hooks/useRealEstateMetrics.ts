import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";

export type RealEstateMetrics = {
  activeLeads: number;
  activeListings: number;
  upcomingAppointments: number;
};

export const useRealEstateMetrics = (organizationId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: ["real-estate-metrics", organizationId],
    enabled: enabled && !!organizationId,
    queryFn: async (): Promise<RealEstateMetrics> => {
      const today = new Date().toISOString();
      const [leads, listings, appointments] = await Promise.all([
        supabase.schema("real_estate").from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId!).in("status", ["new", "contacted", "qualified", "nurture"]),
        supabase.schema("real_estate").from("listings").select("id", { count: "exact", head: true }).in("status", ["active", "pending", "under_contract"]).eq("organization_id", organizationId!),
        supabase.schema("real_estate").from("appointments").select("id", { count: "exact", head: true }).eq("organization_id", organizationId!).gte("starts_at", today).in("status", ["scheduled", "confirmed"]),
      ]);

      const error = leads.error ?? listings.error ?? appointments.error;
      if (error) throw error;

      return {
        activeLeads: leads.count ?? 0,
        activeListings: listings.count ?? 0,
        upcomingAppointments: appointments.count ?? 0,
      };
    },
  });
