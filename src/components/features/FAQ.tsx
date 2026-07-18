import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

const faqItems = [
  {
    q: "Is my client data secure?",
    a: "Each client workspace is designed with database access controls so users only see their own records. We configure credentials and hosting for the workflow you approve, and document where your data is processed before launch.",
  },
  {
    q: "Do I need to change the tools I already use?",
    a: "Usually not. We assess the tools and permissions you already have, then build around the integrations that fit your workflow. Supported connections depend on the systems and access available for your project.",
  },
  {
    q: "How much time can I realistically save per month?",
    a: "The result depends on lead volume, approval steps, and the tools involved. We estimate the manual work in discovery, then measure the workflow after launch so you can judge the impact from your own data.",
  },
  {
    q: "What industry-specific work can actually be automated?",
    a: "The platform handles reusable workflow patterns such as follow-up, system sync, notifications, document generation, reporting, and AI-assisted operations. Vertical modules add industry records and rules—for example, leads, listings, and appointments in real estate.",
  },
  {
    q: "How much control do we have over a workflow?",
    a: "Workflows can be shaped around your triggers, approvals, data movement, notifications, exception paths, and business rules. The platform provides reusable infrastructure while each workflow remains specific to the operation it supports.",
  },
  {
    q: "How do tenant boundaries and audit history work?",
    a: "Each organization operates in its own tenant boundary, with access scoped to its organization. Workflow runs retain execution status, timing, records, steps, outputs, and related audit events so teams can investigate what happened and why.",
  },
  {
    q: "How is your engagement model structured?",
    a: "Each engagement starts with a discovery phase to map your existing operations and identify the workflows that will deliver the most value. From there we propose a scope, timeline, and pricing model that fits your team — whether that is a single workflow or a full operational platform. You only pay for what is scoped and approved."
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)] bg-[#FEFDFC]">
      <div className="max-w-[800px] mx-auto">
        <SectionHeader label="07 - FAQ" />

        <div className="mt-12">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.q}>
                <div className="w-full h-px bg-[#E0DDDA]" />
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-start justify-between py-6 text-left cursor-pointer"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <span
                    className="font-serif font-normal text-primary leading-snug pr-4"
                    style={{ fontSize: "1.25rem", color: "#0F0E0D" }}
                  >
                    {item.q}
                  </span>
                  <span
                    className="font-mono text-lg leading-none flex-shrink-0 mt-0.5"
                    style={{ color: "#6B6762" }}
                    aria-hidden="true"
                  >
                    {isOpen ? "-" : "+"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p
                        className="font-sans font-light leading-relaxed pb-6"
                        style={{ fontSize: "1rem", color: "#6B6762" }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <div className="w-full h-px bg-[#E0DDDA]" />
        </div>
      </div>
    </section>
  );
}
