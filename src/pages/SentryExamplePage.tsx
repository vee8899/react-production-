import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import { isSentryConfigured, captureError } from "@/lib/sentry";
import { env } from "@/utils/env";

export default function SentryExamplePage() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleTriggerUnhandledError = () => {
    setLastAction("Triggered unhandled error");
    // Explicitly call an undefined function / throw error as per Sentry verification doc
    const fn = (window as unknown as { myUndefinedFunction?: () => void }).myUndefinedFunction;
    if (typeof fn === "function") {
      fn();
    } else {
      throw new Error("Sentry Test Error: myUndefinedFunction is not defined");
    }
  };

  const handleTriggerManualCapture = () => {
    const error = new Error("Sentry Test Error: Manual exception captured via Sentry API");
    captureError(error, { page: "/sentry-example-page", timestamp: new Date().toISOString() });
    setLastAction("Manually captured exception sent to Sentry");
  };

  const maskedDsn = env.sentry.dsn
    ? env.sentry.dsn.replace(/(https:\/\/[^@]+@)[^/]+/, "$1ingest.sentry.io")
    : "Not configured";

  return (
    <>
      <Nav />
      <main className="px-[clamp(24px,5vw,80px)] pb-[clamp(64px,10vw,128px)] pt-32">
        <section className="mx-auto max-w-4xl">
          <SectionHeader label="SENTRY INTEGRATION VERIFICATION" />
          
          <FadeUp>
            <div className="mt-8">
              <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">
                Diagnostics & Verification
              </p>
              <h1 className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] font-normal leading-[1.05] tracking-[-0.03em] text-primary">
                Sentry Verification Page
              </h1>
              <p className="mt-4 text-base font-light text-muted max-w-2xl">
                This page allows you to verify that Sentry error monitoring and performance tracing are correctly configured for React Router and browser events.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="mt-10 border border-border p-6 rounded-lg bg-background">
              <h2 className="text-lg font-medium text-primary mb-4">Current Configuration Status</h2>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="border-b border-border/50 pb-2">
                  <dt className="text-muted font-mono text-xs uppercase tracking-wider">Status</dt>
                  <dd className="mt-1 font-semibold text-primary">
                    {isSentryConfigured ? (
                      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Configured & Active
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">DSN Missing</span>
                    )}
                  </dd>
                </div>

                <div className="border-b border-border/50 pb-2">
                  <dt className="text-muted font-mono text-xs uppercase tracking-wider">Environment</dt>
                  <dd className="mt-1 font-mono text-primary">{env.sentry.environment}</dd>
                </div>

                <div className="border-b border-border/50 pb-2 sm:col-span-2">
                  <dt className="text-muted font-mono text-xs uppercase tracking-wider">Configured DSN</dt>
                  <dd className="mt-1 font-mono text-xs text-primary truncate">{maskedDsn}</dd>
                </div>

                <div className="border-b border-border/50 pb-2 sm:col-span-2">
                  <dt className="text-muted font-mono text-xs uppercase tracking-wider">Traces Sample Rate</dt>
                  <dd className="mt-1 font-mono text-primary">{env.sentry.tracesSampleRate}</dd>
                </div>
              </dl>
            </div>
          </FadeUp>

          <FadeUp delay={0.14}>
            <div className="mt-8 border border-border p-6 rounded-lg bg-background space-y-6">
              <h2 className="text-lg font-medium text-primary">Test Error Generators</h2>
              <p className="text-sm font-light text-muted">
                Click a button below to generate a test error event. Unhandled errors will trigger the React Error Boundary and automatically submit events to Sentry.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerUnhandledError}
                  className="border border-primary bg-primary px-5 py-3 text-label font-sans uppercase tracking-[0.08em] text-background transition-colors duration-200 hover:bg-transparent hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Trigger Uncaught Exception
                </button>

                <button
                  type="button"
                  onClick={handleTriggerManualCapture}
                  className="border border-primary bg-transparent px-5 py-3 text-label font-sans uppercase tracking-[0.08em] text-primary transition-colors duration-200 hover:bg-primary hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Capture Exception Manually
                </button>
              </div>

              {lastAction && (
                <div className="mt-4 p-4 border border-border bg-muted/10 rounded text-xs font-mono text-primary">
                  Last Action: {lastAction}
                </div>
              )}
            </div>
          </FadeUp>

          <section className="mt-12 border-t border-border pt-8">
            <Link
              to="/"
              className="inline-flex text-label font-sans uppercase tracking-[0.08em] text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              &larr; Back to platform
            </Link>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
