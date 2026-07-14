import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RunsFeed } from "@/components/dashboard/RunsFeed";
import { ClientServices } from "@/components/dashboard/ClientServices";
import { RealEstateMetrics } from "@/components/dashboard/RealEstateMetrics";
import { useOrganization } from "@/hooks/useOrganization";
import { useWorkflows } from "@/hooks/useWorkflows";
import { WorkflowRow } from "@/components/dashboard/WorkflowRow";
import { StackingNavbar } from "@/components/dashboard/StackingNavbar";

export default function DashboardPage() {
  const {
    data: client,
    isLoading: clientLoading,
    error: clientError,
  } = useClient();
  const { data: organization } = useOrganization(client?.organization_id);
  const { data: workflows, isLoading: workflowsLoading, error: workflowsError } = useWorkflows(
    client?.id,
    client?.organization_id,
  );

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
        <section className="relative min-h-[clamp(240px,32vw,420px)]">
          <div className="absolute right-0 top-0">
            <StackingNavbar className="" />
          </div>
          <SectionHeader label="01 - Dashboard" />
          <div className="mt-12 pr-0 lg:pr-16">
            <StatsRow />
          </div>
        </section>

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

        <div id="workflows" className="mt-24 scroll-mt-28">
          <SectionHeader label="03 - Workflows" />
          <div className="mt-8">
            {workflowsLoading && (
              <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
                Loading workflows...
              </p>
            )}
            {workflowsError && (
              <p style={{ color: "#A13A32" }}>Unable to load workflows.</p>
            )}
            {!workflowsLoading && !workflowsError && !workflows?.length && (
              <p style={{ color: "#6B6762" }}>Your workflows will appear here once they are configured.</p>
            )}
            {!workflowsLoading && !workflowsError && workflows?.length ? (
              <div className="space-y-0">
                {workflows.map((workflow) => (
                  <WorkflowRow
                    key={workflow.id}
                    name={workflow.name}
                    description={workflow.description}
                    featureType={workflow.feature_type}
                    isActive={workflow.is_active}
                    lastRun={workflow.latestRun}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div id="recent-activity" className="mt-24 scroll-mt-28">
          <SectionHeader label={`${organization?.vertical_key === "real_estate" ? "05" : "04"} - Recent Activity`} />
          <div className="mt-8">
            <RunsFeed />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
