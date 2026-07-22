import { useClient } from "@/hooks/useClient";
import { useIntegrations } from "@/hooks/useIntegrations";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { IntegrationCard } from "@/components/dashboard/IntegrationCard";

export default function IntegrationsPage() {
  const { data: client, isLoading: clientLoading, error: clientError } = useClient();
  const { data: integrations, isLoading: integrationsLoading, error: integrationsError } = useIntegrations(client?.organization_id);

  const isLoading = clientLoading || integrationsLoading;

  if (isLoading) {
    return (
      <PageShell>
        <SectionHeader label="03 - Connected Tools" />
        <p className="text-label uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Loading...</p>
      </PageShell>
    );
  }

  if (clientError || integrationsError) {
    return (
      <PageShell>
        <SectionHeader label="03 - Connected Tools" />
        <p style={{ color: "#A13A32" }}>Failed to load connected tools. Please refresh.</p>
      </PageShell>
    );
  }

  if (!client) {
    return (
      <PageShell>
        <SectionHeader label="03 - Connected Tools" />
        <p style={{ color: "#6B6762" }}>No client workspace found.</p>
      </PageShell>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <PageShell>
        <SectionHeader label="03 - Connected Tools" />
        <p className="mt-12 max-w-lg text-sm font-sans font-light leading-relaxed" style={{ color: "#6B6762" }}>
          No tools are connected yet. Integrations will appear here as workflows are configured and connected to your systems.
        </p>
      </PageShell>
    );
  }

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <section>
          <SectionHeader label="03 - Connected Tools" />

          <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
            {connectedCount}/{integrations.length} connected
          </p>

          <div className="mt-10 grid gap-px bg-[#D7D3CC] sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                provider={integration.provider}
                name={integration.name}
                status={integration.status}
                connectionHealth={integration.connection_health}
                lastSyncAt={integration.last_sync_at}
                configuration={integration.configuration}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <>
    <Nav />
    <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
      {children}
    </main>
    <Footer />
  </>
);
