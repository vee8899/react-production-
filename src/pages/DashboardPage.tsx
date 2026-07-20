import { useState } from "react";
import { Link } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { StatsRow, type DashboardWindowDays } from "@/components/dashboard/StatsRow";
import { ClientServices } from "@/components/dashboard/ClientServices";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { RunsFeed } from "@/components/dashboard/RunsFeed";
import { AuditTrail } from "@/components/dashboard/AuditTrail";

export default function DashboardPage() {
  const { data: client, isLoading: clientLoading, error: clientError } = useClient();
  const [windowDays, setWindowDays] = useState<DashboardWindowDays>(30);

  if (clientLoading) {
    return <DashboardState label="LOADING..." />;
  }

  if (clientError) {
    return <DashboardState label="Failed to load data. Please refresh." />;
  }

  if (!client) {
    return <DashboardState label="No data yet. Automations will appear here once workflows run." />;
  }

  if (!client.organization_id) {
    return <DashboardState label="Your organization setup is incomplete. Please contact the team to finish provisioning." />;
  }

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <section>
          <SectionHeader label="01 - Dashboard" />
          <div className="mt-12">
            <StatsRow windowDays={windowDays} onWindowDaysChange={setWindowDays} />
            <Sparkline windowDays={windowDays} />
          </div>
        </section>

        <section className="mt-24">
          <SectionHeader label="02 - Your Services" />
          <div className="mt-8">
            <ClientServices clientId={client.id} organizationId={client.organization_id} />
          </div>
        </section>

        <section className="mt-24">
          <SectionHeader label="03 - Execution & Audit" />
          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
            <details className="group border border-border bg-background p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <span>
                  <span className="block font-display text-2xl font-normal text-primary">Execution history</span>
                  <span className="mt-2 block text-sm font-light leading-relaxed text-muted">Today’s workflow runs, with the full history available in Recent Activity.</span>
                </span>
                <span className="font-mono text-lg text-muted transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="mt-6 border-t border-border pt-2">
                <div className="mb-3 flex justify-end">
                  <Link to="/activity" className="text-label font-mono uppercase tracking-[0.08em] text-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    View all &rarr;
                  </Link>
                </div>
                <RunsFeed limit={50} windowDays={1} />
              </div>
            </details>
            <details className="group border border-border bg-background p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <span>
                  <span className="block font-display text-2xl font-normal text-primary">Audit trail</span>
                  <span className="mt-2 block text-sm font-light leading-relaxed text-muted">A tenant-scoped record of workflow and business-object changes.</span>
                </span>
                <span className="font-mono text-lg text-muted transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="mt-6 border-t border-border pt-6">
                <div className="mb-3 flex justify-end">
                  <Link to="/audit" className="text-label font-mono uppercase tracking-[0.08em] text-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    View all &rarr;
                  </Link>
                </div>
                <AuditTrail />
              </div>
            </details>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

const DashboardState = ({ label }: { label: string }) => (
  <>
    <Nav />
    <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
      <SectionHeader label="01 - Dashboard" />
      <div style={{ color: "#6B6762", fontSize: "0.75rem", letterSpacing: "0.08em" }}>{label}</div>
    </main>
    <Footer />
  </>
);
