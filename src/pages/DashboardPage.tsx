import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RunsFeed } from "@/components/dashboard/RunsFeed";

export default function DashboardPage() {
  const {
    data: client,
    isLoading: clientLoading,
    error: clientError,
  } = useClient();

  const isLoading = clientLoading;

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 — Dashboard" />
          <div style={{ color: '#6B6762', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
            LOADING...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (clientError) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 — Dashboard" />
          <div style={{ color: '#6B6762', fontSize: '0.75rem' }}>
            Failed to load data. Please refresh.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Empty state (no client row yet) ───────────────────────────────
  if (!client) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 — Dashboard" />
          <div style={{ color: '#6B6762', fontSize: '1rem' }}>
            No data yet. Automations will appear here once workflows run.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Data state ────────────────────────────────────────────────────
  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="01 — Dashboard" />

        {/* Stats row */}
        <div className="mt-12">
          <StatsRow />
        </div>

        {/* Recent activity */}
        <div className="mt-24">
          <SectionHeader label="02 — Recent Activity" />
          <div className="mt-8">
            <RunsFeed />
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-24">
          <SectionHeader label="03 — Quick Actions" />
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {["New Workflow", "Export Report", "Invite User", "View Logs"].map(
              (action) => (
                <span
                  key={action}
                  className="text-label font-sans uppercase tracking-[0.08em] text-muted hover:text-primary transition-colors duration-200 cursor-pointer"
                >
                  {action} &rarr;
                </span>
              )
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}