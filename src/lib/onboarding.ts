import type { Json } from "@/types/supabase";

export type OnboardingStatus = "draft" | "in_progress" | "submitted" | "in_review" | "ready" | "launched" | "paused";
export type OnboardingStepStatus = "not_started" | "in_progress" | "complete" | "blocked" | "skipped";

export type OnboardingStepDefinition = {
  key: string;
  label: string;
  description: string;
  namespace: "platform" | "real_estate";
};

export const platformOnboardingSteps: OnboardingStepDefinition[] = [
  { key: "company_profile", label: "Company profile", description: "Tell us who the platform is supporting.", namespace: "platform" },
  { key: "business_goals", label: "Business goals", description: "Describe the outcomes you want automation to improve.", namespace: "platform" },
  { key: "workload_and_workflows", label: "Workload and workflows", description: "Identify repeatable work and the systems involved.", namespace: "platform" },
  { key: "selected_modules", label: "Selected modules", description: "Confirm the capabilities and modules included in your rollout.", namespace: "platform" },
  { key: "integrations", label: "Integrations", description: "Confirm the tools that should connect to your workflows.", namespace: "platform" },
  { key: "access_and_permissions", label: "Access and permissions", description: "Confirm who can provide access and approve workflow changes.", namespace: "platform" },
  { key: "launch_review", label: "Launch review", description: "Review the scope and confirm the rollout is ready.", namespace: "platform" },
];

export const verticalOnboardingSteps: Record<string, OnboardingStepDefinition[]> = {
  real_estate: [
    { key: "real_estate.lead_sources", label: "Lead sources", description: "List the systems that provide buyer, seller, or inquiry records.", namespace: "real_estate" },
    { key: "real_estate.appointment_system", label: "Appointment system", description: "Identify the calendar or scheduling system used by the team.", namespace: "real_estate" },
  ],
};

export const getStepDefinition = (stepKey: string): OnboardingStepDefinition =>
  [...platformOnboardingSteps, ...Object.values(verticalOnboardingSteps).flat()].find((step) => step.key === stepKey) ?? {
    key: stepKey,
    label: stepKey.replaceAll("_", " ").replaceAll(".", " / "),
    description: "Provide the information needed for this onboarding step.",
    namespace: stepKey.startsWith("real_estate.") ? "real_estate" : "platform",
  };

export const getOnboardingStepDefinitions = (featureKeys: string[]) => [
  ...platformOnboardingSteps,
  ...Object.entries(verticalOnboardingSteps)
    .filter(([vertical]) => featureKeys.includes(`module.${vertical}`))
    .flatMap(([, steps]) => steps),
];

export type NormalizedOnboardingAnswers = Record<string, Record<string, Json>>;
