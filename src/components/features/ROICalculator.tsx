import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  MAX_AUTOMATION_COVERAGE,
  automationModules,
  calculateTeamLaborRoi,
  companySizeMultipliers,
  currencies,
  formatCurrency,
  laborRateConfigs,
  type CompanySize,
  type Currency,
} from "@/lib/roiCalculator";

type SliderProps = {
  label: string;
  helper: string;
  min: number;
  max: number;
  step: number;
  value: number;
  displayValue: string;
  onChange: (value: number) => void;
};

const Slider = ({ label, helper, min, max, step, value, displayValue, onChange }: SliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label className="font-sans font-light text-primary" style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)" }}>{label}</label>
        <span className="font-mono text-primary tabular-nums" style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}>{displayValue}</span>
      </div>
      <p className="mb-3 max-w-md text-xs leading-relaxed text-muted">{helper}</p>
      <div className="relative flex h-6 items-center">
        <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
        <div className="relative h-1 w-full rounded-full" style={{ backgroundColor: "#E0DDDA" }}>
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: "#0F0E0D" }} />
        </div>
      </div>
    </div>
  );
};

export default function ROICalculator() {
  const [monthlyVolume, setMonthlyVolume] = useState(200);
  const [minutesPerItem, setMinutesPerItem] = useState(15);
  const [selectedModuleKeys, setSelectedModuleKeys] = useState<string[]>(["workflow_automation", "system_integrations", "agentic_operations"]);
  const [companySize, setCompanySize] = useState<CompanySize>("26-100");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [laborRatePerHour, setLaborRatePerHour] = useState(laborRateConfigs.USD.default);
  const [reducedMotion, setReducedMotion] = useState(false);
  const laborRate = laborRateConfigs[currency];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const outputs = calculateTeamLaborRoi({ monthlyVolume, minutesPerItem, selectedModuleKeys, companySize, currency, laborRatePerHour });

  const handleCurrencyChange = (nextCurrency: Currency) => {
    setCurrency(nextCurrency);
    setLaborRatePerHour(laborRateConfigs[nextCurrency].default);
  };

  const toggleModule = (moduleKey: string) => {
    setSelectedModuleKeys((current) => current.includes(moduleKey) ? current.filter((key) => key !== moduleKey) : [...current, moduleKey]);
  };

  return (
    <section className="bg-[#F2F0ED] px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
      <div className="mx-auto max-w-[1280px]">
        <SectionHeader label="04 - BUSINESS VALUE" />
        <h2 className="mx-auto mb-6 mt-12 max-w-[700px] text-center font-display text-primary" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>See what your next workflow could return.</h2>
        <p className="mx-auto mb-16 max-w-[650px] text-center text-sm font-light leading-relaxed text-muted">Select your total workload, handling time, and automation package to estimate potential business value.</p>

        <div className="grid grid-cols-1 gap-x-[clamp(48px,6vw,96px)] gap-y-12 lg:grid-cols-2">
          <div className="space-y-10">
            <ControlGroup label="Workload">
              <Slider label="Monthly work items (entire team)" helper="Total repeatable work processed by the entire team each month, such as leads, invoices, tickets, appointments, or records." min={10} max={2000} step={10} value={monthlyVolume} displayValue={monthlyVolume.toLocaleString("en-US")} onChange={setMonthlyVolume} />
              <Slider label="Average time per work item" helper="Average staff time currently required to complete one work item." min={5} max={120} step={5} value={minutesPerItem} displayValue={`${minutesPerItem} min`} onChange={setMinutesPerItem} />
            </ControlGroup>

            <ControlGroup label="Automation package">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {automationModules.map((module) => (
                  <label key={module.key} className="flex cursor-pointer items-center gap-3 border border-border bg-background px-3 py-3 text-sm text-primary">
                    <input type="checkbox" checked={selectedModuleKeys.includes(module.key)} onChange={() => toggleModule(module.key)} />
                    <span>{module.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">Select the capabilities you want included in the estimated automation package.</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">Coverage from selected modules: <span className="font-mono text-primary">{Math.round(outputs.automationCoverage * 100)}%</span></p>
            </ControlGroup>

            <ControlGroup label="Pricing assumptions">
              <label className="flex items-center justify-between gap-4 text-sm text-primary">
                <span>Enterprise pricing tier</span>
                <select aria-label="Enterprise pricing tier" value={companySize} onChange={(event) => setCompanySize(event.target.value as CompanySize)} className="border border-border bg-background px-3 py-2 font-mono text-sm text-primary outline-none focus:border-primary">
                  {Object.keys(companySizeMultipliers).map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
              <label className="flex items-center justify-between gap-4 text-sm text-primary">
                <span>Currency</span>
                <select aria-label="Currency" value={currency} onChange={(event) => handleCurrencyChange(event.target.value as Currency)} className="border border-border bg-background px-3 py-2 font-mono text-sm text-primary outline-none focus:border-primary">
                  {currencies.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <p className="mb-3 mt-3 text-xs leading-relaxed text-muted">Average labor rate assumption: {formatCurrency(laborRatePerHour, currency)} per hour. Adjust the blended local estimate if needed.</p>
              <Slider label="Average labor rate" helper="Blended hourly labor rate for the team performing this work." min={laborRate.min} max={laborRate.max} step={laborRate.step} value={laborRatePerHour} displayValue={formatCurrency(laborRatePerHour, currency)} onChange={setLaborRatePerHour} />
            </ControlGroup>
          </div>

          <div className="space-y-8">
            <Output value={formatCurrency(outputs.netAnnualSavings, currency)} label="ESTIMATED ANNUAL NET SAVINGS" reducedMotion={reducedMotion} prominent />
            <Output value={outputs.roiPercentage === null ? "-" : `${outputs.roiPercentage.toFixed(0)}%`} label="ESTIMATED ROI" reducedMotion={reducedMotion} />
            <Output value={outputs.paybackMonths === null ? "-" : `${outputs.paybackMonths.toFixed(1)} months`} label="ESTIMATED PAYBACK" reducedMotion={reducedMotion} />
            <Output value={`+${outputs.workItemsAssisted.toLocaleString("en-US")}`} label="ADDITIONAL WORK ITEMS / MONTH" reducedMotion={reducedMotion} />
            <Output value={`+${outputs.capacityIncreasePercentage.toFixed(0)}%`} label="OPERATIONAL CAPACITY" reducedMotion={reducedMotion} />
            <Output value={`+${outputs.equivalentFteCapacity.toFixed(1)} FTE`} label="EQUIVALENT TEAM CAPACITY" reducedMotion={reducedMotion} />
            <Output value={`${outputs.hoursSavedPerMonth.toFixed(0)} hours`} label="SAVED PER MONTH" reducedMotion={reducedMotion} />

            <div className="border-t border-border pt-6 text-xs leading-relaxed text-muted">
              <p>Automation coverage: <span className="font-mono text-primary">{Math.round(outputs.automationCoverage * 100)}%</span></p>
              <p className="mt-2">Based on selected automation modules; coverage is capped at {Math.round(MAX_AUTOMATION_COVERAGE * 100)}%.</p>
              <p className="mt-2">Selected automation investment: <span className="font-mono text-primary">{formatCurrency(outputs.automationInvestment, currency)} / year</span></p>
              <p className="mt-2">Equivalent team capacity uses 173 productive hours per month and represents additional productive capacity, not workforce reduction.</p>
              <p className="mt-2">Illustrative estimate based on configurable platform assumptions and selected modules. Actual results, pricing, adoption, and savings will vary.</p>
            </div>

            <div className="border border-border bg-background px-4 py-4 text-xs leading-relaxed text-muted">
              Most organizations reinvest reclaimed capacity into growth rather than reducing headcount. These estimates represent the additional work your existing team could complete using the selected automation.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const ControlGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-t border-border pt-6 first:border-t-0 first:pt-0">
    <p className="mb-5 font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</p>
    <div className="space-y-6">{children}</div>
  </div>
);

const Output = ({ value, label, reducedMotion, prominent = false }: { value: string; label: string; reducedMotion: boolean; prominent?: boolean }) => (
  <div>
    <motion.div key={value} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      <span className={`mb-2 block font-mono text-primary tabular-nums ${prominent ? "text-[clamp(2.75rem,6vw,5rem)]" : "text-[clamp(2rem,4vw,3.5rem)]"}`} style={{ lineHeight: 1 }}>{value}</span>
    </motion.div>
    <span className="block font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</span>
  </div>
);
