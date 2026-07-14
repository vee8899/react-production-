import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";
import { normalizeServiceSubscription, type NormalizedServiceSubscription } from "@/lib/serviceSubscriptions";

export const useClientServices = (clientId: string | undefined, organizationId?: string) =>
  useQuery({
    queryKey: ["client-services", clientId, organizationId],
    enabled: !!clientId || !!organizationId,
    queryFn: async (): Promise<NormalizedServiceSubscription[]> => {
      if (organizationId) {
        const { data, error } = await supabase
          .from("feature_subscriptions")
          .select("feature_key, status, configuration")
          .eq("organization_id", organizationId)
          .order("feature_key");

        if (!error && data && data.length > 0) {
          return data.map((service) => normalizeServiceSubscription({
            featureKey: service.feature_key,
            status: service.status,
            configuration: service.configuration,
            source: "feature_subscriptions",
          }));
        }
      }

      const { data, error } = await supabase
        .from("client_services")
        .select("feature_type, status")
        .eq("client_id", clientId!)
        .order("feature_type");

      if (error) throw error;
      return (data ?? []).map((service) => normalizeServiceSubscription({
        featureKey: service.feature_type,
        status: service.status,
        configuration: {},
        source: "client_services",
      }));
    },
  });
