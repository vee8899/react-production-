import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { supabase } from "@/api/supabase/client";
import { useClient } from "@/hooks/useClient";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useRuns } from "@/hooks/useRuns";

const eventLabels = {
  new_lead: "New lead received",
  listing_change: "Listing status changed",
  appointment_booked: "Appointment booked",
  workflow_failure: "Workflow failure",
} as const;

type DemoEvent = keyof typeof eventLabels;

const featureLabels: Record<string, string> = {
  lead_follow_up: "Lead follow-up",
  appointment_scheduling: "Appointment scheduling",
  listing_notifications: "Listing notifications",
  crm_sync: "CRM sync",
};

export default function DemoPage() {
  const { data: client, isLoading: clientLoading, error: clientError } = useClient();
  const queryClient = useQueryClient();
  const [activeEvent, setActiveEvent] = useState<DemoEvent | null>(null);
  const [message, setMessage] = useState("Choose an external event to simulate.");

  const { data: metrics } = useDashboardMetrics(client?.organization_id, client?.id);
  const { data: runs } = useRuns(client?.id, 10, client?.organization_id);
  const { data: leads } = useQuery({
    queryKey: ["demo-leads", client?.organization_id],
    enabled: !!client?.organization_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("real_estate")
        .from("leads")
        .select("id, first_name, last_name, email, status, source_system, created_at")
        .eq("organization_id", client!.organization_id)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const simulateEvent = async (event: DemoEvent) => {
    setActiveEvent(event);
    setMessage(`${eventLabels[event]}...`);

    const { error } = await supabase.functions.invoke("demo-event", {
      body: { event },
    });

    if (error) {
      setActiveEvent(null);
      setMessage(error.message || "The demo event could not be processed.");
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["runs", client?.id] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics", client?.organization_id] }),
      queryClient.invalidateQueries({ queryKey: ["demo-leads", client?.organization_id] }),
    ]);
    setActiveEvent(null);
    setMessage(`${eventLabels[event]} was processed through the demo workspace.`);
  };

  if (clientLoading) return <DemoState label="LOADING DEMO WORKSPACE..." />;
  if (clientError || !client) return <DemoState label="DEMO WORKSPACE NOT AVAILABLE. SIGN IN WITH THE DEMO USER." />;

  const totalRuns = metrics?.totalRuns ?? 0;
  const successRate = totalRuns ? Math.round(((metrics?.successfulRuns ?? 0) / totalRuns) * 100) : 0;

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <section>
          <SectionHeader label="DEMO WORKSPACE" />
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Authenticated demo tenant</p>
              <h1 className="mt-3 text-h1 font-display font-[400] text-primary leading-[1.05]">{client.company_name}</h1>
              <p className="mt-4 max-w-xl text-base font-sans font-[300] leading-relaxed text-muted">
                This is the real client portal backed by the demo tenant. Events normally arrive from connected systems, schedules, or webhooks.
              </p>
            </div>
            <span className="w-fit border border-border px-3 py-2 text-label font-mono uppercase tracking-[0.08em] text-muted">
              Database-backed demo
            </span>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader label="01 - WORKFLOW SUMMARY" />
          <div className="grid grid-cols-2 gap-x-10 gap-y-10 xl:grid-cols-4">
            {[
              ["Runs · 30 days", totalRuns],
              ["Success rate", `${successRate}%`],
              ["Records processed", metrics?.totalRecords ?? 0],
              ["Avg. duration", `${Math.round((metrics?.avgDurationMs ?? 0) / 1000)}s`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-4xl font-mono text-primary">{value}</p>
                <p className="mt-2 text-label font-sans uppercase tracking-[0.08em] text-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader label="02 - EXTERNAL EVENT SIMULATOR" />
          <div className="grid gap-10 md:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-display font-[400] text-primary">Simulate an incoming event</h2>
              <p className="mt-3 max-w-xl text-base font-sans font-[300] leading-relaxed text-muted">
                These controls stand in for a connected website, CRM, listing portal, calendar, or webhook. Each event writes real demo records and a workflow run to Supabase.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {(Object.keys(eventLabels) as DemoEvent[]).map((event) => (
                  <button
                    key={event}
                    type="button"
                    onClick={() => void simulateEvent(event)}
                    disabled={!!activeEvent}
                    className="border border-border px-5 py-3 text-label font-sans uppercase tracking-[0.08em] text-primary disabled:opacity-50"
                  >
                    {activeEvent === event ? "Processing..." : eventLabels[event]}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-label font-mono uppercase tracking-[0.05em] text-muted" role="status">{message}</p>
            </div>
            <div className="border-l border-border pl-6 text-sm font-sans font-[300] leading-relaxed text-muted">
              <p className="font-medium text-primary">Safe demo boundary</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Dedicated demo organization only</li>
                <li>Real RLS and authenticated portal reads</li>
                <li>No external email, SMS, or webhook delivery</li>
                <li>Events use the same workflow-ingestion RPC as n8n</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionHeader label="03 - RECENT ACTIVITY" />
          <div className="space-y-0">
            {(runs ?? []).map((run) => (
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
        </section>

        <section className="mt-20">
          <SectionHeader label="04 - RECENT LEADS" />
          <div className="space-y-0">
            {(leads ?? []).map((lead) => (
              <div key={lead.id} className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-sans font-[300] text-primary">{[lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.email}</p>
                  <p className="text-sm font-sans font-[300] text-muted">{lead.email}</p>
                </div>
                <span className="text-label font-mono uppercase tracking-[0.05em] text-muted">{lead.status} / {lead.source_system}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function DemoState({ label }: { label: string }) {
  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="DEMO WORKSPACE" />
        <p className="mt-12 text-label font-mono uppercase tracking-[0.08em] text-muted">{label}</p>
      </main>
      <Footer />
    </>
  );
}
