import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import IntegrationsShowcase from "@/components/features/IntegrationsShowcase";
import DashboardMock from "@/components/features/DashboardMock";
import ROICalculator from "@/components/features/ROICalculator";
import FAQ from "@/components/features/FAQ";
import { contactHref } from "@/utils/contact";

const heroWords = ["Modular", "automation", "for operations."];

const services = [
  {
    number: "01",
    name: "Workflow Automation",
    description:
      "Turn repeatable operational work into reliable workflows that run on triggers, schedules, and approvals.",
  },
  {
    number: "02",
    name: "System Integrations",
    description:
      "Connect the systems your team already uses and move approved data between CRMs, spreadsheets, portals, and databases safely.",
  },
  {
    number: "03",
    name: "Intelligent Operations",
    description:
      "Add classification, drafting, enrichment, and decision support where they remove manual effort without obscuring control.",
  },
  {
    number: "04",
    name: "Notifications",
    description:
      "Coordinate email, SMS, webhook, and internal notifications around business events.",
  },
  {
    number: "05",
    name: "Business Insights",
    description:
      "See what ran, what changed, and where a workflow needs attention from one operational view.",
  },
  {
    number: "06",
    name: "Configurable Domain Modules",
    description:
      "Add domain-specific records, rules, and workflows without rebuilding the platform around each new use case.",
  },
  {
    number: "07",
    name: "System Data Synchronization",
    description:
      "Synchronize approved records with field mapping, deduplication, retries, and audit visibility on a schedule or trigger.",
  },
  {
    number: "08",
    name: "Granular Workflow Customization",
    description:
      "Shape triggers, approvals, steps, data movement, and exception paths around the way your team actually operates.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Configure",
    body: "Start with the domain module, systems, rules, and records that define the operation you need to run.",
  },
  {
    number: "02",
    title: "Orchestrate",
    body: "Compose granular workflows with triggers, approvals, integrations, notifications, and exception paths.",
  },
  {
    number: "03",
    title: "Operate",
    body: "See every run, record, failure, and change in one operational view with a complete execution history.",
  },
];

const stats = [
  { value: "Modular", label: "DOMAIN CAPABILITIES" },
  { value: "Configurable", label: "WORKFLOW CONTROL" },
  { value: "Multi-tenant", label: "ORGANIZATION-SCOPED DATA" },
  { value: "Auditable", label: "EXECUTION HISTORY" },
];

const rolloutSteps = [
  {
    title: "Discover",
    body: "Identify repeatable work, systems, records, approvals, and exception paths.",
  },
  {
    title: "Configure",
    body: "Assemble the right modules and shape workflows around the way your operation runs.",
  },
  {
    title: "Validate & operate",
    body: "Test real scenarios, launch with visibility, and keep the workflow ready to adapt.",
  },
];

export default function HomePage() {
  return (
    <>
      <Nav />

      <section className="relative min-h-[100svh] flex flex-col justify-end px-[clamp(24px,5vw,80px)] pb-[clamp(64px,10vw,128px)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] right-[8%] w-[320px] h-[320px] rounded-full border border-border/40" />
          <div className="absolute top-[20%] right-[18%] w-[200px] h-[200px] rounded-full border border-border/30" />
          <div className="absolute top-[5%] left-[5%] w-px h-[40%] bg-border/20" />
          <div className="absolute top-[5%] left-[8%] w-px h-[30%] bg-border/15" />
        </div>

        <motion.span
          className="relative z-10 mb-4 text-label font-mono uppercase tracking-[0.08em] text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Modular enterprise automation platform
        </motion.span>

        <h1 className="relative z-10 text-hero font-display font-normal text-primary leading-[0.95] tracking-[-0.03em]">
          {heroWords.map((word, i) => (
            <motion.span
              key={word}
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
                delay: i * 0.1,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.div
          className="relative z-10 mt-8 max-w-[620px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <p className="max-w-[560px] text-base font-light leading-relaxed text-muted sm:text-lg">
            A configurable platform for building, running, and governing the workflows that keep your business moving.
            Add domain modules, shape every step, and keep a complete record of what happened.
          </p>
          <a
            href={contactHref}
            className="mt-7 inline-flex items-center border border-primary bg-primary px-5 py-3 text-label font-sans uppercase tracking-[0.08em] text-background transition-colors duration-200 hover:bg-transparent hover:text-primary"
          >
            Talk to the team &rarr;
          </a>
        </motion.div>

        <motion.div
          className="absolute bottom-[clamp(48px,8vh,96px)] right-[clamp(24px,5vw,80px)] flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">
            Scroll
          </span>
          <motion.span
            className="block w-px h-12 bg-border"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      <section
        id="platform"
        className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]"
      >
        <SectionHeader label="01 - PLATFORM FOUNDATION" />
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-[clamp(48px,6vw,96px)]">
          <FadeUp>
            <div>
              <h2 className="font-display font-normal text-primary leading-[1.15] text-[clamp(1.5rem,3vw,2.5rem)]">
                One automation foundation. Configured for your operation.
              </h2>
              <p className="mt-6 max-w-[680px] font-sans text-primary leading-[1.5] font-light text-[clamp(1.25rem,2.5vw,1.75rem)]">
                Prime State combines reusable automation infrastructure with configurable domain modules, so enterprise teams can automate specific operations without forcing every process into the same template.
              </p>
              <p className="mt-5 max-w-[560px] text-sm font-light leading-relaxed text-muted">
                Each organization operates in its own tenant boundary. Every workflow can be shaped around your approvals, data, and exceptions—and every execution is available for review.
              </p>
            </div>
          </FadeUp>

          <div className="space-y-10">
            <div className="grid gap-px bg-border md:grid-cols-3">
              {processSteps.map((step, i) => (
                <FadeUp key={step.number} delay={i * 0.08}>
                  <div className="h-full bg-background p-5 sm:p-6">
                    <span className="text-label font-mono uppercase tracking-[0.05em] text-muted">
                      {step.number}
                    </span>
                    <h3 className="font-display font-normal text-primary mt-4 mb-4 text-[clamp(1.35rem,2vw,1.75rem)]">
                      {step.title}
                    </h3>
                    <div className="w-full h-px bg-border" />
                    <p className="mt-4 text-sm font-sans text-muted font-light leading-[1.6]">
                      {step.body}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-8 lg:grid-cols-4 lg:gap-y-0 lg:gap-0">
              {stats.map((stat, i) => (
                <FadeUp key={stat.label} delay={i * 0.05}>
                  <div className="flex min-w-0 h-full flex-col gap-3 lg:pr-6 lg:border-r lg:border-border lg:last:border-r-0 lg:last:pr-0">
                    <span className="block break-words font-mono text-primary leading-none text-[clamp(1.35rem,2.5vw,2.25rem)]">
                      {stat.value}
                    </span>
                    <span className="block max-w-[14rem] break-words text-label font-sans uppercase tracking-[0.08em] text-muted">
                      {stat.label}
                    </span>
                  </div>
                </FadeUp>
              ))}
            </div>

          </div>

          <div className="lg:col-span-2 border-t border-border pt-8">
            <div className="max-w-2xl">
              <h3 className="font-display text-[clamp(1.35rem,2vw,1.75rem)] font-normal leading-[1.15] text-primary">
                A managed rollout around your operation.
              </h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-muted">
                You bring the workflow context, system access, and approval requirements. Prime State configures and tests the agreed automation, then launches it with the visibility needed to operate it.
              </p>
            </div>
            <div className="mt-8 grid gap-px bg-border md:grid-cols-3">
              {rolloutSteps.map((step) => (
                <div key={step.title} className="bg-background p-5 sm:p-6">
                  <h4 className="font-display text-xl font-normal text-primary">{step.title}</h4>
                  <p className="mt-3 text-sm font-light leading-relaxed text-muted">{step.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Scope is shaped by the workflows, integrations, data volume, and exception complexity involved.
            </p>
          </div>
        </div>
      </section>

      <section
        id="modules"
        className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]"
      >
        <SectionHeader label="02 - MODULAR CAPABILITIES" />
        <div className="mt-12 border-t border-border">
          {services.map((service, i) => (
            <FadeUp key={service.number} delay={i * 0.05}>
              <div className="min-h-20 py-5 border-b border-border flex items-center">
                <div className="flex items-baseline gap-8">
                  <span className="text-label font-mono uppercase tracking-[0.05em] text-muted w-8 shrink-0">
                    {service.number}
                  </span>
                  <div>
                    <span className="font-display font-normal text-primary text-[clamp(1.5rem,3vw,2.5rem)]">
                      {service.name}
                    </span>
                    <p className="mt-1 text-sm font-sans text-muted font-light max-w-2xl leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <DashboardMock />
      <IntegrationsShowcase />
      <ROICalculator />
      <section id="security" className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,144px)]">
        <SectionHeader label="06 - SECURITY & GOVERNANCE" />
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(48px,8vw,128px)]">
          <FadeUp>
            <div>
              <h2 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-normal leading-[1.15] text-primary">
                Automation you can review, govern, and trust.
              </h2>
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-muted">
                The platform is designed so each organization operates within its own access boundary, while workflow activity and changes remain visible for operational review.
              </p>
              <Link
                to="/security"
                className="mt-7 inline-flex border border-primary px-5 py-3 text-label font-sans uppercase tracking-[0.08em] text-primary transition-colors duration-200 hover:bg-primary hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Review security controls &rarr;
              </Link>
            </div>
          </FadeUp>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["01", "Access", "Organization-scoped access"],
              ["02", "Data", "RLS-protected tenant data"],
              ["03", "Identity", "Authenticated client portal"],
              ["04", "Integrations", "Secret-isolated connections"],
              ["05", "Operations", "Complete execution history"],
              ["06", "Governance", "Audit logs for changes"],
            ].map(([number, label, item]) => (
              <div key={item} className="border border-border bg-background p-5 transition-colors duration-200 hover:border-primary sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-label font-mono tracking-[0.08em] text-muted">{number}</span>
                  <span className="text-label font-sans uppercase tracking-[0.08em] text-muted">{label}</span>
                </div>
                <p className="mt-8 max-w-[16rem] font-display text-xl font-normal leading-[1.15] text-primary">{item}</p>
                <div className="mt-8 h-px w-8 bg-primary" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <FAQ />

      <Footer />
    </>
  );
}
