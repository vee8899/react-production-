import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import LegalDocumentComponent from "@/components/legal/LegalDocument";
import ConsentCheckbox from "@/components/legal/ConsentCheckbox";
import { useClient } from "@/hooks/useClient";
import { useLegalConsent } from "@/hooks/useLegalConsent";
import {
  submitConsents,
  REQUIRED_DOCUMENTS,
  type LegalDocumentKey,
} from "@/lib/legalConsent";
import { useQueries } from "@tanstack/react-query";
import { fetchLatestDocument } from "@/lib/legalConsent";

const consentSchema = z.object({
  terms_of_service: z.boolean().refine((v) => v, "You must accept the Terms of Service"),
  privacy_policy: z.boolean().refine((v) => v, "You must accept the Privacy Policy"),
  ai_usage_disclosure: z.boolean().refine((v) => v, "You must accept the AI Usage Disclosure"),
});

type ConsentForm = z.infer<typeof consentSchema>;

export default function LegalConsentPage() {
  const { data: client } = useClient();
  const { data: consentStatus, isLoading: consentLoading } = useLegalConsent();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const documentResults = useQueries({
    queries: REQUIRED_DOCUMENTS.map((key) => ({
      queryKey: ["legal-document", key],
      queryFn: () => fetchLatestDocument(key),
    })),
  });

  const documents = documentResults.map((r) => r.data).filter(Boolean);
  const isLoading = consentLoading || documentResults.some((r) => r.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsentForm>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      terms_of_service: false,
      privacy_policy: false,
      ai_usage_disclosure: false,
    },
  });

  const onSubmit = async (data: ConsentForm) => {
    if (!client) return;
    setSubmitError(null);

    const acceptedKeys = REQUIRED_DOCUMENTS.filter((key) => data[key as keyof ConsentForm]);

    try {
      await submitConsents(client.id, client.organization_id, acceptedKeys);
      navigate("/dashboard", { replace: true });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="LEGAL CONSENT" />
          <div className="mt-12">
            <p className="text-label font-sans uppercase tracking-[0.08em] text-muted">
              Loading...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const allAlreadyConsented = consentStatus && Object.values(consentStatus).every(Boolean);
  if (allAlreadyConsented) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <section>
          <SectionHeader label="LEGAL CONSENT" />

          <FadeUp>
            <div className="mt-12 max-w-3xl">
              <div className="flex flex-col gap-3 mb-10">
                <h1 className="text-h1 font-display font-[400] text-primary leading-[1.05]">
                  Review and accept
                </h1>
                <p className="text-base font-sans text-muted font-[300]">
                  Please review and accept the following documents to continue.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-10"
              >
                {documents.map((doc) => {
                  if (!doc) return null;
                  const docKey = doc.document_key as LegalDocumentKey;
                  const isConsented = consentStatus?.[docKey] ?? false;
                  return (
                    <div key={doc.document_key} className="border-t border-border pt-8">
                      <LegalDocumentComponent document={doc} />
                      {!isConsented && (
                        <div className="mt-6">
                          <ConsentCheckbox
                            documentKey={docKey}
                            register={register}
                            error={errors[docKey as keyof ConsentForm]?.message}
                          />
                        </div>
                      )}
                      {isConsented && (
                        <p className="mt-6 text-label font-sans uppercase tracking-[0.08em] text-muted">
                          Already accepted
                        </p>
                      )}
                    </div>
                  );
                })}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0F0E0D] text-[#FEFDFC] text-label font-sans uppercase tracking-[0.08em] py-3 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                  style={{ borderRadius: 0 }}
                >
                  {isSubmitting ? "Submitting..." : "Accept and continue"}
                </button>

                {submitError && (
                  <p className="text-label font-sans uppercase tracking-[0.08em] text-muted text-center">
                    {submitError}
                  </p>
                )}
              </form>
            </div>
          </FadeUp>
        </section>
      </main>
      <Footer />
    </>
  );
}
