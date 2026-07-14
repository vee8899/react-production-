import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";
import type { Database, Json } from "@/types/supabase";
import { getStepDefinition } from "@/lib/onboarding";

type Onboarding = Database["public"]["Tables"]["organization_onboarding"]["Row"];
type OnboardingStep = Database["public"]["Tables"]["organization_onboarding_steps"]["Row"];
type SubscriptionSummary = Pick<Database["public"]["Tables"]["feature_subscriptions"]["Row"], "feature_key" | "status">;
type IntegrationSummary = Pick<Database["public"]["Tables"]["integrations"]["Row"], "provider" | "name" | "status" | "connection_health">;

export const useOrganizationOnboarding = (organizationId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["organization-onboarding", organizationId];

  const query = useQuery({
    queryKey,
    enabled: !!organizationId,
    queryFn: async (): Promise<{ onboarding: Onboarding; steps: OnboardingStep[]; subscriptions: SubscriptionSummary[]; integrations: IntegrationSummary[] }> => {
      const { data: onboarding, error: onboardingError } = await supabase
        .from("organization_onboarding")
        .select("*")
        .eq("organization_id", organizationId!)
        .single();
      if (onboardingError) throw onboardingError;

      const { data: steps, error: stepsError } = await supabase
        .from("organization_onboarding_steps")
        .select("*")
        .eq("organization_id", organizationId!)
        .order("created_at");
      if (stepsError) throw stepsError;

      const [{ data: subscriptions, error: subscriptionsError }, { data: integrations, error: integrationsError }] = await Promise.all([
        supabase.from("feature_subscriptions").select("feature_key, status").eq("organization_id", organizationId!),
        supabase.from("integrations").select("provider, name, status, connection_health").eq("organization_id", organizationId!),
      ]);
      if (subscriptionsError) throw subscriptionsError;
      if (integrationsError) throw integrationsError;
      return { onboarding, steps: steps ?? [], subscriptions: subscriptions ?? [], integrations: integrations ?? [] };
    },
  });

  const saveStep = useMutation({
    mutationFn: async ({ stepId, status, data }: { stepId: string; status: OnboardingStep["status"]; data: Json }) => {
      const current = query.data;
      const step = current?.steps.find((item) => item.id === stepId);
      if (!step || !current) throw new Error("Onboarding step was not found");

      const { error: stepError } = await supabase
        .from("organization_onboarding_steps")
        .update({ status, data, completed_at: status === "complete" ? new Date().toISOString() : null })
        .eq("id", stepId)
        .eq("organization_id", organizationId!);
      if (stepError) throw stepError;

      const definition = getStepDefinition(step.step_key);
      const previousAnswers = (current.onboarding.answers ?? {}) as Record<string, Record<string, Json>>;
      const nextAnswers = {
        ...previousAnswers,
        [definition.namespace]: { ...(previousAnswers[definition.namespace] ?? {}), [step.step_key.replace(`${definition.namespace}.`, "")]: data },
      };
      const { error: onboardingError } = await supabase
        .from("organization_onboarding")
        .update({ answers: nextAnswers, status: current.onboarding.status === "draft" ? "in_progress" : current.onboarding.status, started_at: current.onboarding.started_at ?? new Date().toISOString() })
        .eq("id", current.onboarding.id)
        .eq("organization_id", organizationId!);
      if (onboardingError) throw onboardingError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!query.data?.onboarding.id) throw new Error("Onboarding was not found");
      const { error } = await supabase.rpc("submit_organization_onboarding", { p_onboarding_id: query.data.onboarding.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { ...query, saveStep, submit };
};
