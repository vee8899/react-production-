import { describe, expect, it } from "vitest";
import { getOnboardingStepDefinitions, getStepDefinition, platformOnboardingSteps } from "@/lib/onboarding";

describe("onboarding contracts", () => {
  it("always exposes the reusable platform steps", () => {
    expect(getOnboardingStepDefinitions([])).toEqual(platformOnboardingSteps);
    expect(getOnboardingStepDefinitions([]).some((step) => step.namespace === "real_estate")).toBe(false);
  });

  it("adds real-estate steps only for the subscribed module", () => {
    const steps = getOnboardingStepDefinitions(["crm_sync", "module.real_estate"]);
    expect(steps.map((step) => step.key)).toContain("real_estate.lead_sources");
    expect(getOnboardingStepDefinitions(["real_estate"]).some((step) => step.namespace === "real_estate")).toBe(false);
  });

  it("normalizes unknown keys without coupling the core", () => {
    expect(getStepDefinition("module.healthcare.intake")).toMatchObject({
      key: "module.healthcare.intake",
      namespace: "platform",
    });
  });
});
