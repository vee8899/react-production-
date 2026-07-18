import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { RunsFeed } from "@/components/dashboard/RunsFeed";
import { RunDetail } from "@/components/dashboard/RunDetail";
import { useParams } from "react-router-dom";
import { useState } from "react";

const activityWindows = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

export default function RecentActivityPage() {
  const { runId } = useParams<{ runId: string }>();
  const { data: client, isLoading, error } = useClient();
  const [windowDays, setWindowDays] = useState<(typeof activityWindows)[number]["days"]>(30);

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label={runId ? "01 - Execution Run" : "01 - Recent Activity"} />
        {isLoading && <p style={{ color: "#6B6762" }}>Loading activity...</p>}
        {error && <p style={{ color: "#A13A32" }}>Failed to load activity. Please refresh.</p>}
        {!isLoading && !error && !client && <p style={{ color: "#6B6762" }}>No client workspace found.</p>}
        {!isLoading && !error && client && (runId ? (
          <p className="mt-8 max-w-2xl text-sm font-light leading-relaxed text-muted">
            Workflow execution detail: status, timing, retries, steps, and affected records for this run. Business-object change history is available separately in Audit Trail.
          </p>
        ) : (
          <>
            <div className="mt-8 flex items-center gap-5 border-b border-border pb-4">
              <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">Showing runs from</span>
              {activityWindows.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setWindowDays(option.days)}
                  className={`text-label font-mono uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${windowDays === option.days ? "text-primary" : "text-muted hover:text-primary"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <RunsFeed limit={100} windowDays={windowDays} />
          </>
        ))}
        {!isLoading && !error && client && runId && <RunDetail runId={runId} />}
      </main>
      <Footer />
    </>
  );
}
