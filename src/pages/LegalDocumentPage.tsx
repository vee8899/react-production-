import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeUp from "@/components/motion/FadeUp";
import LegalDocumentComponent from "@/components/legal/LegalDocument";
import { useLegalDocument } from "@/hooks/useLegalDocument";
import type { LegalDocumentKey } from "@/lib/legalConsent";
import { DOCUMENT_LABELS } from "@/lib/legalConsent";

type LegalDocumentPageProps = {
  documentKey: LegalDocumentKey;
};

export default function LegalDocumentPage({ documentKey }: LegalDocumentPageProps) {
  const { data: document, isLoading, error } = useLegalDocument(documentKey);

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <section>
          <SectionHeader label={`LEGAL — ${DOCUMENT_LABELS[documentKey].toUpperCase()}`} />

          {isLoading && (
            <div className="mt-12">
              <p className="text-label font-sans uppercase tracking-[0.08em] text-muted">
                Loading...
              </p>
            </div>
          )}

          {error && (
            <div className="mt-12">
              <p className="text-label font-sans uppercase tracking-[0.08em] text-muted">
                Failed to load document. Please refresh.
              </p>
            </div>
          )}

          {!isLoading && !error && !document && (
            <div className="mt-12">
              <p className="text-label font-sans uppercase tracking-[0.08em] text-muted">
                Document not available.
              </p>
            </div>
          )}

          {!isLoading && !error && document && (
            <FadeUp>
              <div className="mt-12 max-w-3xl">
                <LegalDocumentComponent document={document} />
              </div>
            </FadeUp>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
