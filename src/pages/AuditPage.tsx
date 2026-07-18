import { useState } from "react";
import { Link } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { AuditTrail } from "@/components/dashboard/AuditTrail";

const auditWindows = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

export default function AuditPage() {
  const { data: client, isLoading, error } = useClient();
  const [windowDays, setWindowDays] = useState<(typeof auditWindows)[number]["days"]>(30);

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="01 - Audit Trail" />
        {isLoading && <p className="text-label uppercase tracking-[0.08em] text-muted">Loading audit trail...</p>}
        {error && <p className="text-label uppercase tracking-[0.08em] text-muted">Audit trail is unavailable. Please refresh.</p>}
        {!isLoading && !error && !client && <p className="text-label uppercase tracking-[0.08em] text-muted">No client workspace found.</p>}
        {!isLoading && !error && client && (
          <section className="mt-12 max-w-4xl">
            <p className="max-w-2xl text-sm font-light leading-relaxed text-muted">
              Audit Trail records business-object and workflow changes by organization. Use Recent Activity for the execution details of a workflow run.
            </p>
            <div className="flex flex-wrap items-center gap-5 border-b border-border pb-4">
              <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">Showing events from</span>
              {auditWindows.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setWindowDays(option.days)}
                  className={`text-label font-mono uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${windowDays === option.days ? "text-primary" : "text-muted hover:text-primary"}`}
                >
                  {option.label}
                </button>
              ))}
              <Link to="/dashboard" className="ml-auto text-label font-mono uppercase tracking-[0.08em] text-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                Back to dashboard
              </Link>
            </div>
            <div className="mt-8">
              <AuditTrail limit={100} windowDays={windowDays} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
