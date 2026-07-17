import FadeUp from "@/components/motion/FadeUp";

const statItems = [
  { value: "8", label: "Runs" },
  { value: "75%", label: "Success" },
  { value: "75", label: "Records" },
  { value: "4s", label: "Avg Duration" },
];

const serviceItems = [
  { name: "Workflow Automation", status: "Active", color: "#16794C" },
  { name: "System Integrations", status: "Active", color: "#16794C" },
  { name: "Agentic Operations", status: "Active", color: "#16794C" },
  { name: "Notifications", status: "Active", color: "#16794C" },
];

const workflowItems = [
  { name: "Lead enrichment assistant", status: "Healthy", dot: "#6B8F7A", time: "3 min ago" },
  { name: "Listing notification", status: "Degraded", dot: "#A66A00", time: "1 day ago" },
  { name: "CRM synchronization", status: "Healthy", dot: "#6B8F7A", time: "15 min ago" },
];

export default function DashboardMock() {
  return (
    <section className="bg-[#F2F0ED] px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
      <FadeUp>
        <div className="mx-auto max-w-[1100px] border border-border bg-[#FEFDFC] p-[clamp(20px,3vw,40px)]">
          {/* Mock nav bar */}
          <div className="flex items-center justify-between pb-5 border-b border-border">
            <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
              PRIMESTATE SYSTEMS
            </span>
            <div className="flex items-center gap-6">
              <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#0F0E0D" }}>Dashboard</span>
              <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Workflows</span>
              <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>Sign Out</span>
            </div>
          </div>

          {/* Mock section header */}
          <div className="mt-8">
            <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
              01 — Dashboard
            </span>
          </div>

          {/* Mock stats row */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            {statItems.map((item) => (
              <div key={item.label}>
                <span className="block font-mono leading-none" style={{ color: "#0F0E0D", fontSize: "clamp(1.5rem, 3vw, 3rem)" }}>
                  {item.value}
                </span>
                <span className="block text-label font-sans uppercase tracking-[0.08em] mt-1" style={{ color: "#6B6762" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Mock sparkline area */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
                Run Activity
              </span>
              <div className="flex gap-1">
                {[3, 5, 2, 4, 6, 3, 5, 7, 4, 6, 8, 5, 7, 9].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: `${(h / 9) * 32}px`,
                      background: "#0F0E0D",
                      opacity: 0.3 + h / 9 * 0.5,
                      borderRadius: "1px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mock services */}
          <div className="mt-8">
            <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
              02 — Your Services
            </span>
            <div className="mt-4 grid grid-cols-4 gap-px bg-[#D7D3CC]">
              {serviceItems.map((item) => (
                <div key={item.name} className="bg-[#F7F5F1] p-4">
                  <p className="text-label font-sans uppercase tracking-[0.08em]" style={{ color: "#6B6762", fontSize: "0.65rem" }}>
                    {item.name}
                  </p>
                  <p className="mt-2 font-mono text-xs uppercase" style={{ color: item.color }}>
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mock workflow rows */}
          <div className="mt-8">
            <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
              03 — Workflows
            </span>
            <div className="mt-4 space-y-0">
              {workflowItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.dot, display: "inline-block", flexShrink: 0 }} />
                    <span className="font-sans font-light text-sm" style={{ color: "#0F0E0D" }}>{item.name}</span>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.05em]" style={{ color: "#6B6762" }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Label */}
          <div className="mt-8 pt-5 border-t border-border text-center">
            <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
              Live client dashboard
            </span>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
