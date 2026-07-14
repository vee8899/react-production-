import { describe, expect, it } from "vitest";
import {
  MAX_AUTOMATION_COVERAGE,
  automationModules,
  calculateTeamLaborRoi,
  companySizeMultipliers,
  currencies,
  laborRateConfigs,
  formatCurrency,
} from "@/lib/roiCalculator";

const inputs = {
  teamSize: 4,
  monthlyVolume: 100,
  minutesPerItem: 30,
  selectedModuleKeys: ["lead_follow_up", "crm_sync"],
  companySize: "26-100" as const,
  currency: "USD" as const,
};

describe("team labor ROI model", () => {
  it("calculates manual hours and annual labor savings", () => {
    const result = calculateTeamLaborRoi(inputs);
    const manualHours = (4 * 100 * 30) / 60;
    const coverage = 0.18 + 0.15;
    const annualSavings = manualHours * coverage * 45 * 12;

    expect(result.manualHoursPerMonth).toBe(manualHours);
    expect(result.automationCoverage).toBe(coverage);
    expect(result.hoursSavedPerMonth).toBe(manualHours * coverage);
    expect(result.annualLaborSavings).toBe(annualSavings);
  });

  it("calculates internal investment, net savings, ROI, and payback", () => {
    const result = calculateTeamLaborRoi(inputs);
    const selectedPrice = 149 + 199;
    const investment = selectedPrice * companySizeMultipliers["26-100"] * 12;

    expect(result.selectedModulesPrice).toBe(selectedPrice);
    expect(result.automationInvestment).toBe(investment);
    expect(result.netAnnualSavings).toBe(result.annualLaborSavings - investment);
    expect(result.roiPercentage).toBe((result.netAnnualSavings / investment) * 100);
    expect(result.paybackMonths).toBe(investment / (result.annualLaborSavings / 12));
  });

  it("uses currency-specific labor assumptions and keeps the module price model stable", () => {
    expect(currencies).toEqual(["USD", "INR", "EUR", "GBP"]);
    expect(laborRateConfigs.USD).toMatchObject({ min: 20, max: 100, default: 45 });
    expect(laborRateConfigs.INR).toMatchObject({ min: 300, max: 2500, default: 800 });
    expect(laborRateConfigs.EUR).toMatchObject({ min: 18, max: 90, default: 42 });
    expect(laborRateConfigs.GBP).toMatchObject({ min: 15, max: 80, default: 38 });
    expect(automationModules.map((module) => module.key)).toContain("ai_assistant");

    const usd = calculateTeamLaborRoi(inputs);
    const inr = calculateTeamLaborRoi({ ...inputs, currency: "INR" });
    expect(inr.manualHoursPerMonth).toBe(usd.manualHoursPerMonth);
    expect(inr.automationInvestment).not.toBe(usd.automationInvestment);
    expect(inr.annualLaborSavings).not.toBe(usd.annualLaborSavings);
  });

  it("adds module coverage incrementally and caps it at 90 percent", () => {
    const selectedModuleKeys = automationModules.map((module) => module.key);
    const result = calculateTeamLaborRoi({ ...inputs, selectedModuleKeys });

    expect(result.automationCoverage).toBeCloseTo(MAX_AUTOMATION_COVERAGE);
    expect(result.workItemsAssisted).toBe(Math.round(inputs.monthlyVolume * MAX_AUTOMATION_COVERAGE));
  });

  it("handles zero workload and no selected modules safely", () => {
    const result = calculateTeamLaborRoi({ ...inputs, monthlyVolume: 0, selectedModuleKeys: [] });

    expect(result.manualHoursPerMonth).toBe(0);
    expect(result.automationCoverage).toBe(0);
    expect(result.annualLaborSavings).toBe(0);
    expect(result.automationInvestment).toBe(0);
    expect(result.netAnnualSavings).toBe(0);
    expect(result.roiPercentage).toBeNull();
    expect(result.paybackMonths).toBeNull();
  });

  it("formats supported currencies directly", () => {
    expect(formatCurrency(1234, "USD")).toContain("1,234");
    expect(formatCurrency(1234, "INR")).toContain("1,234");
    expect(formatCurrency(1234, "EUR")).toContain("1,234");
    expect(formatCurrency(1234, "GBP")).toContain("1,234");
  });
});
