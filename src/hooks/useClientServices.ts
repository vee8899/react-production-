import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";

export const useClientServices = (clientId: string | undefined, organizationId?: string) =>
  useQuery({
    queryKey: ["client-services", clientId, organizationId],
    enabled: !!clientId || !!organizationId,
    queryFn: async () => {
      if (organizationId) {
        const { data, error } = await supabase
          .from("feature_subscriptions")
          .select("feature_key, status, configuration")
          .eq("organization_id", organizationId)
          .order("feature_key");

        if (!error && data && data.length > 0) {
          return data.map((service) => ({ featureKey: service.feature_key, status: service.status, configuration: service.configuration, source: "feature_subscriptions" as const }));
        }
      }

      const { data, error } = await supabase
        .from("client_services")
        .select("feature_type, status")
        .eq("client_id", clientId!)
        .order("feature_type");

      if (error) throw error;
      return (data ?? []).map((service) => ({ featureKey: service.feature_type, status: service.status, configuration: {}, source: "client_services" as const }));
    },
  });
