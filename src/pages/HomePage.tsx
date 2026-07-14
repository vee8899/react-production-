import { motion } from "framer-motion";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import IntegrationsShowcase from "@/components/features/IntegrationsShowcase";
import ROICalculator from "@/components/features/ROICalculator";
import FAQ from "@/components/features/FAQ";

const heroWords = ["Automating", "Operations.", "End to End."];

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
      "Connect the systems your team already uses and move approved data between them safely.",
  },
  {
    number: "03",
    name: "Agentic Operations",
    description:
      "Add agentic capabilities where classification, drafting, enrichment, or decision support can remove manual effort.",
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
    name: "Modular Industry Workflows",
    description:
      "Add vertical modules for the records and processes that make your industry unique.",
  },
  {
    number: "07",
    name: "System Data synchronization",
    description:
      "Move approved data between tools, portals, spreadsheets, and databases on a schedule or trigger.",
  },
  {
    number: "08",
    name: "Custom Business Solutions",
    description:
      "For repeatable work that does not fit a template, we design a dedicated workflow.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Discovery",
    body: "We map your current operations and identify every manual task that can be automated.",
  },
  {
    number: "02",
    title: "Build",
    body: "We connect your tools and build workflows tailored to how you work. No templates.",
  },
  {
    number: "03",
    title: "Monitor",
    body: "Supported workflows report their activity to a client dashboard, so you can see what ran and when.",
  },
];

const stats = [
  { value: "Custom", label: "BUILT AROUND YOUR TOOLS" },
  { value: "Scoped", label: "TO YOUR WORKFLOW" },
  { value: "Visible", label: "ACTIVITY IN CLIENT DASHBOARD" },
  { value: "Supported", label: "FROM DISCOVERY TO HANDOFF" },
];

export default function HomePage() {
  return (
    <>
      <Nav />

      <section className="relative min-h-[100svh] flex flex-col justify-end px-[clamp(24px,5vw,80px)] pb-[clamp(64px,10vw,128px)]">
        <motion.span
          className="mb-4 text-label font-mono uppercase tracking-[0.08em] text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Private client automation studio
        </motion.span>

        <h1 className="text-hero font-display font-normal text-primary leading-[0.95] tracking-[-0.03em]">
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
        id="work"
        className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]"
      >
        <SectionHeader label="01 - OPERATING MODEL" />
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-[clamp(48px,6vw,96px)]">
          <FadeUp>
            <div>
              <h2 className="font-display font-normal text-primary leading-[1.15] text-[clamp(1.5rem,3vw,2.5rem)]">
                Automation infrastructure for the way your team already works.
              </h2>
              <p className="mt-6 max-w-[680px] font-sans text-primary leading-[1.5] font-light text-[clamp(1.25rem,2.5vw,1.75rem)]">
                We build automation systems for teams that want less manual work, more throughput, and better operational visibility.
              </p>
              <p className="mt-5 max-w-[560px] text-sm font-light leading-relaxed text-muted">
                Every workflow connects to your existing tools, stores the records it affects, and reports its activity through a client dashboard.
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

            <div className="grid grid-cols-2 gap-6 border-t border-border pt-8 md:grid-cols-4 md:gap-0">
              {stats.map((stat, i) => (
                <FadeUp key={stat.label} delay={i * 0.05}>
                  <div className="flex h-full flex-col gap-3 md:pr-6 md:border-r md:border-border md:last:border-r-0 md:last:pr-0">
                    <span className="font-mono text-primary block leading-none text-[clamp(1.5rem,3vw,2.5rem)]">
                      {stat.value}
                    </span>
                    <span className="text-label font-sans uppercase tracking-[0.08em] text-muted block">
                      {stat.label}
                    </span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]"
      >
        <SectionHeader label="02 - SERVICES" />
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

      <IntegrationsShowcase />
      <ROICalculator />
      <FAQ />

      <Footer />
    </>
  );
}
