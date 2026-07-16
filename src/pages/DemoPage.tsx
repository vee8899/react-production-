import { useMemo, useState } from "react";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  DEMO_LEADS,
  DEMO_RUNS,
  DEMO_TENANT,
  summarizeRuns,
  type DemoLead,
  type DemoRun,
} from "@/demo/demoData";

const featureLabels: Record<string, string> = {
  lead_follow_up: "Lead follow-up",
  appointment_scheduling: "Appointment scheduling",
  listing_notifications: "Listing notifications",
  crm_sync: "CRM sync",
};

type SimulationState = "idle" | "processing" | "success" | "error";

type DemoScenario = "new_lead" | "listing_change" | "appointment_booked" | "workflow_failure";

const scenarioLabels: Record<DemoScenario, string> = {
  new_lead: "New lead received",
  listing_change: "Listing status changed",
  appointment_booked: "Appointment booked",
  workflow_failure: "Workflow failure",
};

export default function DemoPage() {
  const [leads, setLeads] = useState<DemoLead[]>(DEMO_LEADS);
  const [runs, setRuns] = useState<DemoRun[]>(DEMO_RUNS);
  const [state, setState] = useState<SimulationState>("idle");
  const [message, setMessage] = useState("Choose an external event to simulate.");
  const [lastScenario, setLastScenario] = useState<DemoScenario | null>(null);
  const metrics = useMemo(() => summarizeRuns(runs), [runs]);

  const simulateEvent = (scenario: DemoScenario) => {
    setState("processing");
    setLastScenario(scenario);
    setMessage(`${scenarioLabels[scenario]}...`);

    window.setTimeout(() => {
      const failed = scenario === "workflow_failure";
      const newLead: DemoLead = {
        id: `demo-event-${Date.now()}`,
        name: "Taylor Brooks",
        email: "taylor.brooks@example.test",
        source: scenario === "new_lead" ? "Website form" : "Demo event",
        status: "new",
      };
      const run: DemoRun = {
        id: `demo-run-${Date.now()}`,
        featureKey: failed ? "listing_notifications" : scenario === "new_lead" ? "lead_follow_up" : scenario === "listing_change" ? "listing_notifications" : "appointment_scheduling",
        workflowName: scenarioLabels[scenario],
        status: failed ? "error" : "success",
        ranAt: new Date().toISOString(),
        recordsProcessed: failed ? 0 : 1,
        recordsFailed: failed ? 1 : 0,
        durationMs: failed ? 3840 : 1280,
      };
      if (scenario === "new_lead") setLeads((current) => [newLead, ...current]);
      setRuns((current) => [run, ...current]);
      setState(failed ? "error" : "success");
      setMessage(failed ? "The simulated run failed and needs attention. No external actions were taken." : "The simulated event was processed. No external actions were taken.");
    }, 700);
  };

  const resetDemo = () => {
    setLeads(DEMO_LEADS);
    setRuns(DEMO_RUNS);
    setLastScenario(null);
    setState("idle");
    setMessage("Choose an external event to simulate.");
  };

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <section>
          <SectionHeader label="DEMO WORKSPACE" />
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">{DEMO_TENANT.label}</p>
              <h1 className="mt-3 text-h1 font-display font-[400] text-primary leading-[1.05]">{DEMO_TENANT.name}</h1>
              <p className="mt-4 max-w-xl text-base font-sans font-[300] leading-relaxed text-muted">
                Explore seeded workflow history, then simulate the external events that normally trigger your automations.
              </p>
            </div>
            <span className="w-fit border border-border px-3 py-2 text-label font-mono uppercase tracking-[0.08em] text-muted">
              Simulation only
            </span>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader label="01 - WORKFLOW SUMMARY" />
          <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
            {[
              ["Runs", metrics.total],
              ["Successful", metrics.successful],
              ["Needs attention", metrics.failed],
              ["Records processed", metrics.records],
            ].map(([label, value]) => (
              <div key={label} className="bg-background p-5 md:p-7">
                <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">{label}</p>
                <p className="mt-3 text-3xl font-display font-[400] text-primary">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader label="02 - SIMULATE A NEW RUN" />
          <div className="grid gap-10 md:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-display font-[400] text-primary">Simulate an incoming event</h2>
              <p className="mt-3 max-w-xl text-base font-sans font-[300] leading-relaxed text-muted">
                In production, these events arrive from connected systems, webhooks, schedules, or integrations. Here they are simulated safely in this browser session so you can see the downstream workflow result.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {(Object.keys(scenarioLabels) as DemoScenario[]).map((scenario) => (
                  <button
                    key={scenario}
                    type="button"
                    onClick={() => simulateEvent(scenario)}
                    disabled={state === "processing"}
                    className="border border-border px-5 py-3 text-label font-sans uppercase tracking-[0.08em] text-primary disabled:opacity-50"
                  >
                    {scenarioLabels[scenario]}
                  </button>
                ))}
              </div>
              <p className={`mt-4 text-label font-mono uppercase tracking-[0.05em] ${state === "error" ? "text-red-600" : "text-muted"}`} role="status">
                {message}
              </p>
            </div>
            <div className="border-l border-border pl-6 text-sm font-sans font-[300] leading-relaxed text-muted">
              <p className="font-medium text-primary">Safe by design</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>No Supabase writes</li>
                <li>No n8n requests</li>
                <li>No email, SMS, or webhook actions</li>
                <li>Resettable browser-only state</li>
              </ul>
            </div>
          </div>
          {lastScenario && state !== "processing" && (
            <div className="mt-8 border-t border-border pt-6 text-sm font-sans text-muted">
              Latest simulation: <span className="text-primary">{scenarioLabels[lastScenario]}</span> entered the workflow system and produced a dashboard run.
            </div>
          )}
        </section>

        <section className="mt-20">
          <SectionHeader label="03 - RECENT ACTIVITY" />
          <div className="space-y-0">
            {runs.map((run) => (
              <div key={run.id} className="flex flex-col gap-2 border-b border-border py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">{featureLabels[run.featureKey] ?? run.featureKey}</p>
                  <p className="mt-1 text-base font-sans font-[300] text-primary">{run.workflowName}</p>
                </div>
                <div className="flex gap-5 text-label font-mono uppercase tracking-[0.05em] text-muted">
                  <span>{run.recordsProcessed} records</span>
                  <span className={run.status === "success" ? "text-muted" : "text-red-600"}>{run.status}</span>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={resetDemo} className="mt-6 text-label font-sans uppercase tracking-[0.08em] text-muted underline underline-offset-4 hover:text-primary">
            Reset demo workspace
          </button>
        </section>

        <section className="mt-20">
          <SectionHeader label="04 - DEMO LEADS" />
          <div className="space-y-0">
            {leads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-sans font-[300] text-primary">{lead.name}</p>
                  <p className="text-sm font-sans font-[300] text-muted">{lead.email}</p>
                </div>
                <span className="text-label font-mono uppercase tracking-[0.05em] text-muted">{lead.status} / {lead.source}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
