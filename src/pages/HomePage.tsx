import { Link } from "react-router-dom";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { contactHref } from "@/utils/contact";

const capabilities = [
  ["Workflow Automation", "Turn repeatable work into dependable processes."],
  ["System Integrations", "Move approved data across the tools your team already uses."],
  ["Intelligent Operations", "Add enrichment, drafting, and decision support with control."],
  ["Notifications", "Keep people informed when work needs action."],
  ["Business Insights", "See what ran, what changed, and where attention is needed."],
  ["Domain Modules", "Add records and rules for operations such as real estate."],
  ["Data Synchronization", "Map, deduplicate, and reconcile records across systems."],
  ["Workflow Customization", "Shape approvals, exceptions, and routing around reality."],
];

const examples = [
  ["Lead follow-up", "Capture, deduplicate, route, follow up, and record the outcome."],
  ["System synchronization", "Keep CRM, spreadsheet, and portal records aligned with mapped fields and retries."],
  ["Document generation", "Populate versioned templates, route approvals, and deliver the result."],
  ["Operational coordination", "Connect appointments, listings, notifications, and exception handling."],
];

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <section className="flex min-h-[78svh] flex-col justify-end px-[clamp(24px,5vw,80px)] pb-[clamp(64px,10vw,128px)]">
          <div className="mx-auto w-full max-w-[1280px]">
            <SectionHeader label="MANAGED OPERATIONS LAYER" />
            <h1 className="mt-10 max-w-[900px] font-display text-[clamp(3rem,8vw,8rem)] font-normal leading-[0.92] tracking-[-0.04em] text-primary">Encode how your enterprise works.</h1>
            <p className="mt-8 max-w-[680px] text-[clamp(1.1rem,2vw,1.5rem)] font-light leading-relaxed text-primary">We configure, connect, and operate resilient workflows across the systems your team already uses—so repeatable work moves with visibility and control.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={contactHref} className="border border-primary bg-primary px-5 py-3 text-label uppercase tracking-[0.08em] text-background transition-colors hover:bg-transparent hover:text-primary">Discuss your operation →</a>
              <Link to="/security" className="border border-border px-5 py-3 text-label uppercase tracking-[0.08em] text-primary transition-colors hover:border-primary">Review governance</Link>
            </div>
          </div>
        </section>

        <section className="bg-[#F2F0ED] px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,144px)]">
          <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div><SectionHeader label="THE PROBLEM" /><h2 className="mt-10 font-display text-[clamp(1.8rem,4vw,3.5rem)] font-normal leading-[1.05] text-primary">Your team should not be the integration layer.</h2></div>
            <div className="grid gap-px bg-border sm:grid-cols-2">
              {["Manual handoffs between systems", "Duplicate and inconsistent records", "Missed follow-ups and approvals", "Exceptions no one can see", "Reports assembled by hand", "Automation that nobody owns"].map((item) => <div key={item} className="bg-background p-5 text-sm font-light leading-relaxed text-primary">{item}</div>)}
            </div>
          </div>
        </section>

        <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,160px)]">
          <div className="mx-auto max-w-[1280px]"><SectionHeader label="WORKFLOW EXAMPLES" /><p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-muted">Start with the operational bottleneck that costs your team the most time. We configure the process, connect the tools, and remain accountable for how it runs.</p><div className="mt-10 grid gap-px bg-border md:grid-cols-2">{examples.map(([title, body], index) => <div key={title} className="bg-background p-6 sm:p-8"><span className="font-mono text-xs text-muted">0{index + 1}</span><h3 className="mt-6 font-display text-2xl font-normal text-primary">{title}</h3><p className="mt-4 text-sm font-light leading-relaxed text-muted">{body}</p></div>)}</div></div>
        </section>

        <section className="bg-[#F2F0ED] px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,144px)]"><div className="mx-auto max-w-[1280px]"><SectionHeader label="MODULAR CAPABILITIES" /><div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">{capabilities.map(([title, body]) => <div key={title} className="bg-background p-5 sm:p-6"><h3 className="font-display text-xl font-normal text-primary">{title}</h3><p className="mt-3 text-sm font-light leading-relaxed text-muted">{body}</p></div>)}</div></div></section>

        <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,144px)]"><div className="mx-auto max-w-[1280px]"><SectionHeader label="HOW WE ENGAGE" /><div className="mt-10 grid gap-px bg-border md:grid-cols-3">{[["Platform", "The connected, observable workflow layer."], ["Implementation", "Process design, integrations, rules, approvals, and launch testing."], ["Operations", "Monitoring, exception handling, maintenance, and continuous improvement."]].map(([title, body]) => <div key={title} className="bg-background p-6 sm:p-8"><h3 className="font-display text-2xl font-normal text-primary">{title}</h3><p className="mt-4 text-sm font-light leading-relaxed text-muted">{body}</p></div>)}</div><p className="mt-5 max-w-2xl text-xs leading-relaxed text-muted">Engagements are scoped around workflows, connected systems, record volume, exception complexity, and support requirements. Pricing is discussed directly rather than presented as a self-service checkout.</p></div></section>

        <section className="bg-primary px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)] text-background"><div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><SectionHeader label="CONTROL AND VISIBILITY" /><h2 className="mt-10 max-w-2xl font-display text-[clamp(2rem,5vw,4.5rem)] font-normal leading-[1]">Automation you can review, govern, and trust.</h2><p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-background/70">Organization-scoped access, secret-isolated connections, retries, audit trails, workflow steps, and visible exception paths keep your operation understandable.</p></div><Link to="/security" className="shrink-0 border border-background px-5 py-3 text-label uppercase tracking-[0.08em] text-background transition-colors hover:bg-background hover:text-primary">Security controls →</Link></div></section>

        <section className="px-[clamp(24px,5vw,80px)] py-[clamp(80px,12vw,180px)]"><div className="mx-auto max-w-[900px] text-center"><SectionHeader label="START WITH THE OPERATION" /><h2 className="mt-10 font-display text-[clamp(2rem,5vw,4.5rem)] font-normal leading-[1] text-primary">Bring us the process your team has outgrown.</h2><p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-muted">We will identify the repeatable work, systems, approvals, and exceptions that should become your next resilient workflow.</p><a href={contactHref} className="mt-8 inline-flex border border-primary bg-primary px-5 py-3 text-label uppercase tracking-[0.08em] text-background transition-colors hover:bg-transparent hover:text-primary">Request a scoped conversation →</a></div></section>
      </main>
      <Footer />
    </>
  );
}
