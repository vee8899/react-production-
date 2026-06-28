import { motion } from "framer-motion";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import ProjectCard from "@/components/ui/ProjectCard";
import FadeUp from "@/components/motion/FadeUp";

const heroWords = ["Automating", "Real Estate.", "End to End."];

const services = [
  {
    number: "01",
    name: "Lead Follow-Up",
    description:
      "Automated email and SMS sequences triggered the moment a lead comes in. No manual outreach.",
  },
  {
    number: "02",
    name: "Listing Notifications",
    description:
      "Instant alerts to buyers and tenants when a matching property hits the market.",
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
      "Keep your CRM, inbox, and calendar in sync without touching a single field manually.",
  },
  {
    number: "05",
    name: "Document Generation",
    description:
      "Auto-generate contracts, proposals, and reports from your existing data.",
  },
  {
    number: "06",
    name: "Appointment Scheduling",
    description:
      "Automated booking flows that confirm, remind, and follow up without back-and-forth.",
  },
  {
    number: "07",
    name: "Data Pipelines",
    description:
      "Move data between your tools — portals, spreadsheets, databases — on a schedule or trigger.",
  },
  {
    number: "08",
    name: "Custom Workflows",
    description:
      "Anything that happens more than once in your business can be automated. We build it.",
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
    body: "Every automation runs through our dashboard. You see what ran, when, and how many records were processed.",
  },
];

const projects = [
  { name: "Lead Engine", category: "Brokerage Automation", year: "2026" },
  { name: "Tenant Portal Sync", category: "Property Management", year: "2025" },
  { name: "Listing Alert System", category: "Agent Automation", year: "2025" },
  { name: "Contract Autopilot", category: "Document Automation", year: "2024" },
];

const stats = [
  { value: "10,000+", label: "Records automated monthly" },
  { value: "98%", label: "Workflow success rate" },
  { value: "40hrs", label: "Saved per client per month" },
  { value: "< 1s", label: "Average workflow response time" },
];

export default function HomePage() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <section className="min-h-[100svh] flex flex-col px-[clamp(24px,5vw,80px)] pt-[50vh] pb-[clamp(64px,10vw,128px)]">
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

        {/* Sub-label */}
        <motion.span
          className="mt-6 text-label font-mono uppercase tracking-[0.08em] text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Private client automation studio
        </motion.span>

        {/* Scroll indicator */}
        <motion.div
          className="self-end mt-16 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">
            Scroll
          </span>
          <motion.span
            className="block w-px h-6 bg-muted"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* Section 01 — What We Do */}
      <section id="work" className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
        <SectionHeader label="01 — What We Do" />
        <FadeUp>
          <p className="text-h1 font-display text-primary max-w-3xl mt-12 leading-[1.05] tracking-[-0.02em]">
            We build automation systems for real estate professionals — agents,
            brokerages, and property managers — that eliminate manual work from
            their operations. Every workflow is custom built, connected to their
            existing tools, and monitored in real time.
          </p>
        </FadeUp>
      </section>

      {/* Section 02 — Services */}
      <section id="services" className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
        <SectionHeader label="02 — Services" />
        <div className="mt-12 space-y-0">
          {services.map((service, i) => (
            <FadeUp key={service.number} delay={i * 0.05}>
              <div className="py-5 border-b border-border">
                <div className="flex items-baseline gap-4">
                  <span className="text-label font-mono uppercase tracking-[0.05em] text-muted w-8 shrink-0">
                    {service.number}
                  </span>
                  <div>
                    <span className="text-h2 font-display text-primary">
                      {service.name}
                    </span>
                    <p className="mt-2 text-base font-sans text-muted font-light max-w-2xl leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Section 03 — Process */}
      <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
        <SectionHeader label="03 — Process" />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-12">
          {processSteps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.08}>
              <div>
                <span className="text-label font-mono uppercase tracking-[0.05em] text-muted">
                  {step.number}
                </span>
                <h3 className="text-h2 font-display text-primary mt-3">
                  {step.title}
                </h3>
                <div className="w-full h-px bg-border my-4" />
                <p className="text-base font-sans text-muted font-light leading-relaxed">
                  {step.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Section 04 — Work */}
      <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
        <SectionHeader label="04 — Work" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-16 mt-12">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.name}
              name={project.name}
              category={project.category}
              year={project.year}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Section 05 — Stats */}
      <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
        <SectionHeader label="05 — By the Numbers" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
          {stats.map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.05}>
              <div>
                <span className="text-hero font-mono text-primary block leading-none">
                  {stat.value}
                </span>
                <span className="text-label font-sans uppercase tracking-[0.08em] text-muted mt-2 block">
                  {stat.label}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}