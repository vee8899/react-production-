import { describe, expect, it } from "vitest";
import { getOnboardingStepDefinitions, getStepDefinition, platformOnboardingSteps } from "@/lib/onboarding";

describe("onboarding contracts", () => {
  it("returns platform onboarding steps without subscribed modules", () => {
    expect(getOnboardingStepDefinitions([])).toEqual(platformOnboardingSteps);
  });

  it("does not include real-estate onboarding without its module subscription", () => {
    expect(getOnboardingStepDefinitions([]).some((step) => step.namespace === "real_estate")).toBe(false);
  });

  it("adds real-estate onboarding for the namespaced module subscription", () => {
    const steps = getOnboardingStepDefinitions(["system_integrations", "module.real_estate"]);
    expect(steps.map((step) => step.key)).toContain("real_estate.lead_sources");
  });

  it("does not infer a module subscription from an unnamespaced key", () => {
    expect(getOnboardingStepDefinitions(["real_estate"]).some((step) => step.namespace === "real_estate")).toBe(false);
  });

  it("normalizes unknown keys without coupling the core", () => {
    expect(getStepDefinition("module.healthcare.intake")).toMatchObject({
      key: "module.healthcare.intake",
      namespace: "platform",
    });
  });
});
