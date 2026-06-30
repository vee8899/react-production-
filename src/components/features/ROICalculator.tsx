import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

type SliderConfig = {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
  suffix?: string;
};

const sliders: SliderConfig[] = [
  { label: "Leads per month", min: 10, max: 500, step: 10, default: 80, unit: "leads" },
  { label: "Minutes per follow-up", min: 5, max: 60, step: 5, default: 20, unit: "min" },
  { label: "Staff hourly cost", min: 90, max: 500, step: 10, default: 150, unit: "₹/hr", suffix: "₹" },
  { label: "Messages per day", min: 10, max: 200, step: 10, default: 50, unit: "msgs" },
];

type Output = {
  value: number;
  label: string;
  format: (n: number) => string;
};

function formatHours(n: number) {
  return `${Math.round(n)} hrs`;
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatLeads(n: number) {
  return `${n} leads`;
}

function formatMessages(n: number) {
  return `${n.toLocaleString("en-IN")} msgs`;
}

export default function ROICalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(80);
  const [followUpMins, setFollowUpMins] = useState(20);
  const [staffCost, setStaffCost] = useState(150);
  const [messagesPerDay, setMessagesPerDay] = useState(50);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const hoursPerMonth = (leadsPerMonth * followUpMins) / 60;
  const costSavedPerYear = hoursPerMonth * 12 * staffCost;
  const leadsNotDropped = Math.round(leadsPerMonth * 0.35);
  const messagesAutomated = messagesPerDay * 30;

  const outputs: Output[] = [
    { value: hoursPerMonth, label: "HOURS PER MONTH", format: formatHours },
    { value: costSavedPerYear, label: "COST SAVED PER YEAR", format: formatCurrency },
    { value: leadsNotDropped, label: "NOT DROPPED", format: formatLeads },
    { value: messagesAutomated, label: "AUTOMATED MONTHLY", format: formatMessages },
  ];

  const sliderValues = [leadsPerMonth, followUpMins, staffCost, messagesPerDay];
  const setters = [setLeadsPerMonth, setFollowUpMins, setStaffCost, setMessagesPerDay];

  return (
    <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)] bg-[#F2F0ED]">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader label="08 — ROI CALCULATOR" />

        <h2
          className="font-display font-normal text-primary mt-12 mb-16 text-center mx-auto max-w-[700px] leading-[1.15] tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
        >
          See how much you save.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[clamp(48px,6vw,96px)] gap-y-12">
          {/* Inputs column */}
          <div className="space-y-10">
            {sliders.map((slider, i) => {
              const val = sliderValues[i];
              const setter = setters[i];
              const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;

              return (
                <div key={slider.label}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span
                      className="font-sans font-light text-primary"
                      style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)" }}
                    >
                      {slider.label}
                    </span>
                    <span
                      className="font-mono text-primary tabular-nums"
                      style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
                    >
                      {slider.suffix || ""}{val}
                    </span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={val}
                      onChange={(e) => setter(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {/* Custom track */}
                    <div className="w-full h-1 rounded-full relative" style={{ backgroundColor: "#E0DDDA" }}>
                      <div
                        className="h-full rounded-full absolute left-0 top-0"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "#0F0E0D",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Outputs column */}
          <div className="space-y-10">
            {outputs.map((output) => (
              <div key={output.label}>
                <motion.div
                  key={output.value}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <span
                    className="font-mono text-primary tabular-nums block leading-none mb-2"
                    style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                  >
                    {output.format(output.value)}
                  </span>
                </motion.div>
                <span
                  className="font-mono uppercase tracking-[0.08em] block"
                  style={{ fontSize: "0.75rem", color: "#6B6762" }}
                >
                  {output.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}