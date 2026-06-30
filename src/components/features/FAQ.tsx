import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

const faqItems = [
  {
    q: "Is my client data secure?",
    a: "Yes. All data is stored in an isolated database with row-level security — meaning each client can only ever access their own data. Workflows run on private infrastructure and no client data is shared across accounts or stored in third-party automation platforms.",
  },
  {
    q: "Do I need to change the tools I already use?",
    a: "No. We connect to the tools you already have — Gmail, WhatsApp, Google Sheets, Outlook, Slack, Telegram, and more. There is no migration, no new software to learn, and no disruption to your existing workflow. We build around how you already work.",
  },
  {
    q: "How much time can I realistically save per month?",
    a: "Most real estate clients save between 40 and 120 hours per month depending on lead volume and how many manual tasks are automated. Follow-up sequences, message sending, and data entry are typically the highest-impact areas. Use the calculator above to estimate your specific savings.",
  },
  {
    q: "What real estate tasks can actually be automated?",
    a: "Lead follow-up sequences, listing alerts to buyers, WhatsApp and email communication, appointment reminders, CRM data entry, document generation, and daily reporting. If it happens more than once and follows a pattern, it can be automated.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)] bg-[#FEFDFC]">
      <div className="max-w-[800px] mx-auto">
        <SectionHeader label="09 — FAQ" />

        <div className="mt-12">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;

            return (
              <div key={i}>
                {/* Hairline divider */}
                <div className="w-full h-px bg-[#E0DDDA]" />

                <button
                  onClick={() => toggle(i)}
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
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
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

          {/* Final hairline divider */}
          <div className="w-full h-px bg-[#E0DDDA]" />
        </div>
      </div>
    </section>
  );
}