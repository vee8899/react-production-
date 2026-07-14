import type { Json } from "@/types/supabase";

export type NormalizedServiceSubscription = {
  featureKey: string;
  isModule: boolean;
  moduleKey: string | null;
  status: string;
  configuration: Json;
  source: "feature_subscriptions" | "client_services";
};

export const normalizeServiceSubscription = (service: {
  featureKey: string;
  status: string;
  configuration?: Json;
  source: NormalizedServiceSubscription["source"];
}): NormalizedServiceSubscription => {
  const isModule = service.featureKey.startsWith("module.");
  return {
    featureKey: service.featureKey,
    isModule,
    moduleKey: isModule ? service.featureKey.slice("module.".length) : null,
    status: service.status,
    configuration: service.configuration ?? {},
    source: service.source,
  };
};
