import { useState } from "react";
import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { StatsRow, type DashboardWindowDays } from "@/components/dashboard/StatsRow";
import { ClientServices } from "@/components/dashboard/ClientServices";
import { Sparkline } from "@/components/dashboard/Sparkline";

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
