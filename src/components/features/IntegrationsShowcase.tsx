import type { ReactNode } from "react";
import { FaEnvelope, FaSlack } from "react-icons/fa";
import {
  SiGmail,
  SiGooglecalendar,
  SiGoogledocs,
  SiGooglesheets,
  SiTelegram,
  SiWhatsapp,
} from "react-icons/si";
import SectionHeader from "@/components/ui/SectionHeader";

type Integration = {
  name: string;
  role: string;
  icon: ReactNode;
};

type IntegrationGroup = {
  title: string;
  description: string;
  integrations: Integration[];
};

const iconClassName = "h-5 w-5 shrink-0 text-primary";

const integrationGroups: IntegrationGroup[] = [
  {
    title: "Communication",
    description: "Route messages, approvals, and alerts across the channels your team already checks.",
    integrations: [
      { name: "Gmail", role: "Email intake and follow-up", icon: <SiGmail className={iconClassName} /> },
      { name: "Outlook", role: "Shared inbox workflows", icon: <FaEnvelope className={iconClassName} /> },
      { name: "WhatsApp", role: "Client message updates", icon: <SiWhatsapp className={iconClassName} /> },
      { name: "Telegram", role: "Operational alerts", icon: <SiTelegram className={iconClassName} /> },
      { name: "Slack", role: "Internal notifications", icon: <FaSlack className={iconClassName} /> },
    ],
  },
  {
    title: "Workspace",
    description: "Keep scheduling, documents, and spreadsheets connected to the workflows around them.",
    integrations: [
      { name: "Google Calendar", role: "Scheduling triggers", icon: <SiGooglecalendar className={iconClassName} /> },
      { name: "Google Sheets", role: "Structured work data", icon: <SiGooglesheets className={iconClassName} /> },
      { name: "Google Docs", role: "Document generation", icon: <SiGoogledocs className={iconClassName} /> },
    ],
  },
];

export default function IntegrationsShowcase() {
  return (
    <section className="bg-[#FEFDFC] px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)]">
      <div className="mx-auto max-w-[1280px]">
        <SectionHeader label="04 - INTEGRATION LAYER" />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-[clamp(48px,6vw,96px)]">
          <div>
            <h2
              className="font-display font-normal text-primary leading-[1.15]"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              Connect the systems inside the workflow.
            </h2>
            <p className="mt-5 max-w-[560px] text-sm font-light leading-relaxed text-muted">
              Integrations are the connective layer—not the product itself. Route approved data, triggers, documents, and notifications through workflows shaped for your operation.
            </p>
            <div className="mt-8 border border-border bg-surface px-5 py-5 sm:px-6">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                Connected through Studio
              </p>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                Example adapters for your modules. Availability depends on your systems, permissions, and implementation scope.
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-border md:grid-cols-2">
            {integrationGroups.map((group) => (
              <section key={group.title} className="bg-[#FEFDFC] p-5 sm:p-6">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                  {group.title}
                </p>
                <p className="mt-3 min-h-0 text-sm font-light leading-relaxed text-muted md:min-h-16">
                  {group.description}
                </p>
                <div className="mt-6 divide-y divide-border border-y border-border">
                  {group.integrations.map((integration) => (
                    <div key={integration.name} className="flex min-w-0 items-start gap-3 py-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface">
                        {integration.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="break-words text-sm font-normal text-primary">
                          {integration.name}
                        </p>
                        <p className="mt-1 break-words text-xs leading-relaxed text-muted">
                          {integration.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
