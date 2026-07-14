import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { useClient } from "@/hooks/useClient";
import { useOrganizationOnboarding } from "@/hooks/useOrganizationOnboarding";
import { getStepDefinition } from "@/lib/onboarding";

export default function OnboardingPage() {
  const { data: client, isLoading: clientLoading } = useClient();
  const onboardingQuery = useOrganizationOnboarding(client?.organization_id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (clientLoading || onboardingQuery.isLoading) return <OnboardingState label="LOADING ONBOARDING..." />;
  if (onboardingQuery.error || !client || !onboardingQuery.data) return <OnboardingState label="Unable to load onboarding. Please refresh." />;

  const { onboarding, steps, subscriptions, integrations } = onboardingQuery.data;
  const completed = steps.filter((step) => step.status === "complete").length;
  const canSubmit = steps.length > 0 && completed === steps.length && ["draft", "in_progress"].includes(onboarding.status);

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="01 - ONBOARDING" />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">{onboarding.status.replaceAll("_", " ")}</p>
            <h1 className="mt-4 text-h1 font-display font-[400] text-primary leading-[1.05]">Set up your operating model.</h1>
            <p className="mt-5 max-w-xl text-base font-sans font-[300] leading-relaxed text-muted">Complete the checklist so we can scope workflows around your tools, workload, and subscribed modules. You can save your progress and return later.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border-t border-primary pt-3"><p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Subscribed modules</p><p className="mt-2 text-sm font-sans font-[300] text-primary">{subscriptions.filter((item) => item.feature_key.startsWith("module.")).map((item) => item.feature_key.replace("module.", "")).join(", ") || "No vertical modules provisioned"}</p></div>
              <div className="border-t border-primary pt-3"><p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Integration status</p><p className="mt-2 text-sm font-sans font-[300] text-primary">{integrations.length ? `${integrations.filter((item) => item.status === "connected").length}/${integrations.length} connected` : "No integrations configured yet"}</p></div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              {steps.map((step) => {
                const definition = getStepDefinition(step.step_key);
                const value = drafts[step.id] ?? (typeof step.data === "object" && step.data && "notes" in step.data ? String(step.data.notes ?? "") : "");
                return (
                  <article key={step.id} className="border border-[#E0DDDA] bg-[#F7F5F1] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-[400] text-primary">{definition.label}</h2>
                        <p className="mt-2 text-sm font-sans font-[300] leading-relaxed text-muted">{definition.description}</p>
                      </div>
                      <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">{step.status.replaceAll("_", " ")}</span>
                    </div>
                    <textarea value={value} onChange={(event) => setDrafts((current) => ({ ...current, [step.id]: event.target.value }))} placeholder="Add notes or context" className="mt-5 min-h-24 w-full resize-y border-b border-[#CFCAC5] bg-transparent p-0 pb-2 text-sm font-sans font-[300] text-primary outline-none focus:border-primary" />
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button type="button" onClick={() => onboardingQuery.saveStep.mutate({ stepId: step.id, status: "in_progress", data: { notes: value } })} className="border border-primary px-4 py-2 text-label font-sans uppercase tracking-[0.08em] text-primary disabled:opacity-50" disabled={onboardingQuery.saveStep.isPending}>Save</button>
                      <button type="button" onClick={() => onboardingQuery.saveStep.mutate({ stepId: step.id, status: "complete", data: { notes: value } })} className="bg-primary px-4 py-2 text-label font-sans uppercase tracking-[0.08em] text-background disabled:opacity-50" disabled={onboardingQuery.saveStep.isPending}>Mark complete</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="self-start border-t border-primary pt-5 lg:sticky lg:top-24">
            <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Progress</p>
            <p className="mt-3 font-display text-4xl text-primary">{completed}/{steps.length}</p>
            <p className="mt-2 text-sm font-sans font-[300] text-muted">Checklist items complete</p>
            <button type="button" onClick={() => onboardingQuery.submit.mutate()} disabled={!canSubmit || onboardingQuery.submit.isPending} className="mt-8 w-full bg-primary px-4 py-3 text-label font-sans uppercase tracking-[0.08em] text-background disabled:cursor-not-allowed disabled:opacity-40">{onboardingQuery.submit.isPending ? "Submitting..." : "Submit for review"}</button>
            {onboarding.status === "submitted" && <p className="mt-4 text-sm font-sans font-[300] text-muted">Submitted for review. Your implementation team will follow up with launch details.</p>}
            <Link to="/dashboard" className="mt-6 inline-block text-label font-sans uppercase tracking-[0.08em] text-muted underline underline-offset-4">Back to dashboard</Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

const OnboardingState = ({ label }: { label: string }) => (
  <>
    <Nav />
    <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]"><SectionHeader label="01 - ONBOARDING" /><p className="text-label font-sans uppercase tracking-[0.08em] text-muted">{label}</p></main>
    <Footer />
  </>
);
