export type Currency = "USD" | "INR" | "EUR" | "GBP";

export type LaborRateConfig = {
  currency: Currency;
  min: number;
  max: number;
  step: number;
  default: number;
};

export const laborRateConfigs: Record<Currency, LaborRateConfig> = {
  USD: { currency: "USD", min: 20, max: 100, step: 5, default: 45 },
  INR: { currency: "INR", min: 300, max: 2500, step: 50, default: 800 },
  EUR: { currency: "EUR", min: 18, max: 90, step: 5, default: 42 },
  GBP: { currency: "GBP", min: 15, max: 80, step: 5, default: 38 },
};

export const currencies: Currency[] = ["USD", "INR", "EUR", "GBP"];
export const MAX_AUTOMATION_COVERAGE = 0.9;
export const PRODUCTIVE_HOURS_PER_FTE_MONTH = 173;

export const automationModules = [
  { key: "workflow_automation", label: "Workflow Automation", coverageContribution: 0.18, monthlyPrice: { USD: 149, INR: 12000, EUR: 139, GBP: 119 } },
  { key: "system_integrations", label: "System Integrations", coverageContribution: 0.15, monthlyPrice: { USD: 199, INR: 16000, EUR: 179, GBP: 159 } },
  { key: "agentic_operations", label: "Agentic Operations", coverageContribution: 0.12, monthlyPrice: { USD: 299, INR: 24000, EUR: 269, GBP: 239 } },
  { key: "notifications", label: "Notifications", coverageContribution: 0.10, monthlyPrice: { USD: 149, INR: 12000, EUR: 139, GBP: 119 } },
  { key: "business_insights", label: "Business Insights", coverageContribution: 0.08, monthlyPrice: { USD: 99, INR: 8000, EUR: 89, GBP: 79 } },
  { key: "modular_industry_workflows", label: "Modular Industry Workflows", coverageContribution: 0.08, monthlyPrice: { USD: 179, INR: 14500, EUR: 159, GBP: 139 } },
  { key: "system_data_synchronization", label: "System Data synchronization", coverageContribution: 0.05, monthlyPrice: { USD: 129, INR: 10500, EUR: 119, GBP: 99 } },
  { key: "custom_business_solutions", label: "Custom Business Solutions", coverageContribution: 0.22, monthlyPrice: { USD: 249, INR: 20000, EUR: 229, GBP: 199 } },
] as const;

export type CompanySize = "1-25" | "26-100" | "101-500" | "500+";

export const companySizeMultipliers: Record<CompanySize, number> = {
  "1-25": 1,
  "26-100": 1.35,
  "101-500": 1.8,
  "500+": 2.4,
};

export type TeamLaborRoiInputs = {
  monthlyVolume: number;
  minutesPerItem: number;
  selectedModuleKeys: string[];
  companySize: CompanySize;
  currency: Currency;
  laborRatePerHour?: number;
};

export type TeamLaborRoiOutputs = {
  manualHoursPerMonth: number;
  automationCoverage: number;
  hoursSavedPerMonth: number;
  annualLaborSavings: number;
  automationInvestment: number;
  netAnnualSavings: number;
  roiPercentage: number | null;
  paybackMonths: number | null;
  additionalWorkItemsPerMonth: number;
  capacityIncreasePercentage: number;
  equivalentFteCapacity: number;
  workItemsAssisted: number;
  laborRatePerHour: number;
  selectedModulesPrice: number;
};

export const calculateTeamLaborRoi = (inputs: TeamLaborRoiInputs): TeamLaborRoiOutputs => {
  const monthlyVolume = Math.max(0, inputs.monthlyVolume);
  const minutesPerItem = Math.max(0, inputs.minutesPerItem);
  const laborRatePerHour = inputs.laborRatePerHour ?? laborRateConfigs[inputs.currency].default;
  const selectedModulesPrice = automationModules
    .filter((module) => inputs.selectedModuleKeys.includes(module.key))
    .reduce((total, module) => total + module.monthlyPrice[inputs.currency], 0);
  const automationCoverage = Math.min(
    MAX_AUTOMATION_COVERAGE,
    automationModules
      .filter((module) => inputs.selectedModuleKeys.includes(module.key))
      .reduce((total, module) => total + module.coverageContribution, 0),
  );
  const automationInvestment = selectedModulesPrice * companySizeMultipliers[inputs.companySize] * 12;
  const manualHoursPerMonth = (monthlyVolume * minutesPerItem) / 60;
  const hoursSavedPerMonth = manualHoursPerMonth * automationCoverage;
  const annualLaborSavings = hoursSavedPerMonth * laborRatePerHour * 12;
  const netAnnualSavings = annualLaborSavings - automationInvestment;
  const additionalWorkItemsPerMonth = minutesPerItem > 0 ? (hoursSavedPerMonth * 60) / minutesPerItem : 0;
  const capacityIncreasePercentage = monthlyVolume > 0 ? (additionalWorkItemsPerMonth / monthlyVolume) * 100 : 0;
  const equivalentFteCapacity = hoursSavedPerMonth / PRODUCTIVE_HOURS_PER_FTE_MONTH;

  return {
    manualHoursPerMonth,
    automationCoverage,
    hoursSavedPerMonth,
    annualLaborSavings,
    automationInvestment,
    netAnnualSavings,
    roiPercentage: automationInvestment > 0 ? (netAnnualSavings / automationInvestment) * 100 : null,
    paybackMonths: annualLaborSavings > 0 ? automationInvestment / (annualLaborSavings / 12) : null,
    additionalWorkItemsPerMonth,
    capacityIncreasePercentage,
    equivalentFteCapacity,
    workItemsAssisted: Math.round(additionalWorkItemsPerMonth),
    laborRatePerHour,
    selectedModulesPrice,
  };
};

export const formatCurrency = (amount: number, currency: Currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
