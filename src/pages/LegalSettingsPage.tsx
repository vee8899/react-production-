import { useState } from "react";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import { CookiePreferencesForm } from "@/components/legal/CookiePreferenceToggle";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import { useClient } from "@/hooks/useClient";
import { upsertCookiePreferences } from "@/lib/legalConsent";

export default function LegalSettingsPage() {
  const { data: client } = useClient();
  const { data: preferences, error: preferencesError, isLoading } = useCookiePreferences();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSave = async (prefs: {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => {
    if (!client) return;
    setIsSaving(true);
    setSaved(false);
    setSaveError(false);

    try {
      await upsertCookiePreferences(client.id, client.organization_id, prefs);
      setSaved(true);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <section>
          <SectionHeader label="01 — LEGAL SETTINGS" />

          <FadeUp>
            <div className="mt-12 max-w-3xl">
              <div className="flex flex-col gap-3 mb-10">
                <h1 className="text-h1 font-display font-[400] text-primary leading-[1.05]">
                  Legal settings
                </h1>
                <p className="text-base font-sans text-muted font-[300]">
                  Manage your cookie preferences and review legal documents.
                </p>
              </div>

              {isLoading ? (
                <p className="text-label font-sans uppercase tracking-[0.08em] text-muted">
                  Loading...
                </p>
              ) : preferencesError ? (
                <p className="text-label font-sans uppercase tracking-[0.08em] text-red-600">
                  Cookie preferences could not be loaded. Please refresh and try again.
                </p>
              ) : (
                <div className="flex flex-col gap-16">
                  <div>
                    <h2 className="font-display font-normal text-primary text-[clamp(1.5rem,3vw,2rem)] mb-6">
                      Cookie Preferences
                    </h2>
                    <CookiePreferencesForm
                      key={preferences?.id ?? "no-preferences"}
                      preferences={preferences ?? null}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                    {saved && (
                      <p className="mt-4 text-label font-sans uppercase tracking-[0.08em] text-muted">
                        Preferences saved.
                      </p>
                    )}
                    {saveError && (
                      <p className="mt-4 text-label font-sans uppercase tracking-[0.08em] text-red-600">
                        Preferences could not be saved. Please try again.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border pt-8">
                    <h2 className="font-display font-normal text-primary text-[clamp(1.5rem,3vw,2rem)] mb-6">
                      Legal Documents
                    </h2>
                    <div className="flex flex-col gap-4">
                      <a
                        href="/legal/terms"
                        className="text-sm font-sans text-muted font-[300] underline hover:text-primary transition-colors duration-200"
                      >
                        Terms of Service
                      </a>
                      <a
                        href="/legal/privacy"
                        className="text-sm font-sans text-muted font-[300] underline hover:text-primary transition-colors duration-200"
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeUp>
        </section>
      </main>
      <Footer />
    </>
  );
}
