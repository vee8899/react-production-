import { Link } from "react-router-dom";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import { contactHref } from "@/utils/contact";

const securityGroups = [
  {
    label: "Implemented in the current product",
    items: [
      "Organization-scoped access and tenant data boundaries",
      "Row-level security policies on tenant-owned data",
      "Authenticated client portal access",
      "Service-role-only trusted workflow ingestion",
      "Webhook secret validation for external workflow events",
      "Execution history and organization-scoped audit events",
    ],
  },
  {
    label: "Operational practices",
    items: [
      "Client provisioning through a protected operator flow",
      "Secrets kept outside browser code and workflow exports",
      "Documented deployment and database migration procedures",
      "Workflow errors shown without exposing secret or database details",
    ],
  },
  {
    label: "Deployment-dependent",
    items: [
      "Private n8n deployments can use the included backup and restore procedures",
      "Hosting, retention, access review, and recovery commitments are confirmed for the selected deployment model",
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main className="px-[clamp(24px,5vw,80px)] pb-[clamp(64px,10vw,128px)] pt-32">
        <section className="mx-auto max-w-6xl">
          <SectionHeader label="SECURITY & GOVERNANCE" />
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-[clamp(48px,8vw,128px)]">
            <FadeUp>
              <div>
                <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Built for operational review</p>
                <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-primary">
                  Govern every workflow.
                </h1>
              </div>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="max-w-2xl">
                <p className="text-xl font-light leading-relaxed text-primary">
                  Prime State is designed to keep automation observable, organization-scoped, and reviewable as it runs.
                </p>
                <p className="mt-6 text-sm font-light leading-relaxed text-muted">
                  The controls below describe the current product and documented operating practices. Deployment-specific commitments are confirmed during scoping and security review.
                </p>
              </div>
            </FadeUp>
          </div>

          <div className="mt-20 space-y-12">
            {securityGroups.map((group, index) => (
              <FadeUp key={group.label} delay={index * 0.06}>
                <section className="border-t border-border pt-6" aria-labelledby={`security-group-${index}`}>
                  <h2 id={`security-group-${index}`} className="font-display text-[clamp(1.35rem,2vw,1.75rem)] font-normal text-primary">
                    {group.label}
                  </h2>
                  <div className="mt-6 grid gap-px bg-border sm:grid-cols-2">
                    {group.items.map((item) => (
                      <div key={item} className="bg-background p-5 sm:p-6">
                        <p className="text-sm font-light leading-relaxed text-primary">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </FadeUp>
            ))}
          </div>

          <section className="mt-20 border-t border-border pt-8">
            <div className="max-w-2xl">
              <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Security review</p>
              <h2 className="mt-4 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-normal leading-[1.15] text-primary">
                Need a deeper diligence conversation?
              </h2>
              <p className="mt-5 text-sm font-light leading-relaxed text-muted">
                We can review data flows, access responsibilities, deployment choices, and the controls relevant to your operation during discovery.
              </p>
              <a
                href={contactHref}
                className="mt-7 inline-flex border border-primary bg-primary px-5 py-3 text-label font-sans uppercase tracking-[0.08em] text-background transition-colors duration-200 hover:bg-transparent hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Talk to the team &rarr;
              </a>
              <Link
                to="/"
                className="ml-5 inline-flex text-label font-sans uppercase tracking-[0.08em] text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Back to platform
              </Link>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
