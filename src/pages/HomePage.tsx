import { motion } from "framer-motion";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import IntegrationsOrbit from "@/components/features/IntegrationsOrbit";
import ROICalculator from "@/components/features/ROICalculator";
import FAQ from "@/components/features/FAQ";

const heroWords = ["Automating", "Real Estate.", "End to End."];

const services = [
  {
    number: "01",
    name: "Lead Follow-Up",
    description:
      "We build email and SMS sequences that respond when a new lead arrives.",
  },
  {
    number: "02",
    name: "Listing Notifications",
    description:
      "Matching-property alerts tailored to your listing source and audience.",
  },
  {
    number: "03",
    name: "Client Communication",
    description:
      "Scheduled updates, check-ins, and document requests sent automatically at the right time.",
  },
  {
    number: "04",
    name: "CRM Sync",
    description:
      "Connect your CRM, inbox, and calendar around the way your team already works.",
  },
  {
    number: "05",
    name: "Document Generation",
    description:
      "Generate documents and reports from the data sources you approve.",
  },
  {
    number: "06",
    name: "Appointment Scheduling",
    description:
      "Booking flows that confirm, remind, and follow up around your availability rules.",
  },
  {
    number: "07",
    name: "Data Pipelines",
    description:
      "Move approved data between tools, portals, spreadsheets, and databases on a schedule or trigger.",
  },
  {
    number: "08",
    name: "Custom Workflows",
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
        <SectionHeader label="01 - WHAT WE DO" />
        <FadeUp>
          <p className="font-sans text-primary max-w-[800px] mt-12 leading-[1.5] font-light text-[clamp(1.25rem,2.5vw,1.75rem)]">
            We build automation systems for real estate professionals, agents,
            brokerages, and property managers, that eliminate manual work from
            their operations. Every workflow is custom built, connected to their
            existing tools, and monitored through a client dashboard.
          </p>
        </FadeUp>
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

      <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
        <SectionHeader label="03 - PROCESS" />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-[clamp(32px,5vw,80px)]">
          {processSteps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.08}>
              <div>
                <span className="text-label font-mono uppercase tracking-[0.05em] text-muted">
                  {step.number}
                </span>
                <h3 className="font-display font-normal text-primary mt-4 mb-4 text-[clamp(1.5rem,2.5vw,2rem)]">
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
      </section>

      <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
        <SectionHeader label="04 - BY THE NUMBERS" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 mt-12">
          {stats.map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.05}>
              <div className="flex flex-col gap-3 md:pr-8 md:border-r md:border-border md:last:border-r-0 md:last:pr-0">
                <span
                  className="font-mono text-primary block leading-none tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                >
                  {stat.value}
                </span>
                <span className="text-label font-sans uppercase tracking-[0.08em] text-muted block">
                  {stat.label}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <IntegrationsOrbit />
      <ROICalculator />
      <FAQ />

      <Footer />
    </>
  );
}
