import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RunsFeed } from "@/components/dashboard/RunsFeed";
import { ClientServices } from "@/components/dashboard/ClientServices";
import { RealEstateMetrics } from "@/components/dashboard/RealEstateMetrics";
import { useOrganization } from "@/hooks/useOrganization";

export default function DashboardPage() {
  const {
    data: client,
    isLoading: clientLoading,
    error: clientError,
  } = useClient();
  const { data: organization } = useOrganization(client?.organization_id);

  if (clientLoading) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 - Dashboard" />
          <div style={{ color: "#6B6762", fontSize: "0.75rem", letterSpacing: "0.08em" }}>
            LOADING...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (clientError) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 - Dashboard" />
          <div style={{ color: "#6B6762", fontSize: "0.75rem" }}>
            Failed to load data. Please refresh.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!client) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 - Dashboard" />
          <div style={{ color: "#6B6762", fontSize: "1rem" }}>
            No data yet. Automations will appear here once workflows run.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="01 - Dashboard" />

        <div className="mt-12">
          <StatsRow />
        </div>

        <div className="mt-24">
          <SectionHeader label="02 - Your Services" />
          <div className="mt-8">
            <ClientServices clientId={client.id} organizationId={client.organization_id} />
          </div>
        </div>

        {organization?.vertical_key === "real_estate" && (
          <div className="mt-24">
            <SectionHeader label="03 - Real Estate Operations" />
            <div className="mt-8">
              <RealEstateMetrics organizationId={organization.id} />
            </div>
          </div>
        )}

        <div className="mt-24">
          <SectionHeader label={`${organization?.vertical_key === "real_estate" ? "04" : "03"} - Recent Activity`} />
          <div className="mt-8">
            <RunsFeed />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
