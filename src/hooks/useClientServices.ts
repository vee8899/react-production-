import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";
import { normalizeServiceSubscription, type NormalizedServiceSubscription } from "@/lib/serviceSubscriptions";

export const useClientServices = (clientId: string | undefined, organizationId?: string) =>
  useQuery({
    queryKey: ["client-services", clientId, organizationId],
    enabled: !!clientId || !!organizationId,
    queryFn: async (): Promise<NormalizedServiceSubscription[]> => {
      const [featureResult, clientResult] = await Promise.all([
        organizationId
          ? supabase
              .from("feature_subscriptions")
              .select("feature_key, status, configuration")
              .eq("organization_id", organizationId)
              .order("feature_key")
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("client_services")
          .select("feature_type, status")
          .eq("client_id", clientId!)
          .order("feature_type"),
      ]);

      if (featureResult.error) throw featureResult.error;
      if (clientResult.error) throw clientResult.error;

      const featureSubscriptions = (featureResult.data ?? []).map((service) => normalizeServiceSubscription({
        featureKey: service.feature_key,
        status: service.status,
        configuration: service.configuration,
        source: "feature_subscriptions",
      }));
      const clientServices = (clientResult.data ?? []).map((service) => normalizeServiceSubscription({
        featureKey: service.feature_type,
        status: service.status,
        configuration: {},
        source: "client_services",
      }));

      const merged = new Map<string, NormalizedServiceSubscription>();
      [...featureSubscriptions, ...clientServices].forEach((service) => {
        if (!merged.has(service.featureKey)) merged.set(service.featureKey, service);
      });

      /*
        The two sources represent different product layers:
        feature_subscriptions contains modules, while client_services contains
        client-facing platform capabilities. Both must be visible together.
      */
      return [...merged.values()];
    },
  });
