import type { LegalDocumentKey } from "@/lib/legalConsent";
import { DOCUMENT_LABELS, DOCUMENT_ROUTES } from "@/lib/legalConsent";
import type { UseFormRegister } from "react-hook-form";

type ConsentCheckboxProps = {
  documentKey: LegalDocumentKey;
  register: UseFormRegister<Record<LegalDocumentKey, boolean>>;
  error?: string;
};

export default function ConsentCheckbox({
  documentKey,
  register,
  error,
}: ConsentCheckboxProps) {
  const label = DOCUMENT_LABELS[documentKey];
  const route = DOCUMENT_ROUTES[documentKey];

  return (
    <div>
      <label className="flex gap-3 text-sm font-sans text-muted font-[300] leading-6">
        <input
          type="checkbox"
          {...register(documentKey)}
          className="mt-1 size-4 accent-[#0F0E0D]"
        />
        <span>
          I have read and agree to the{" "}
          <a href={route} target="_blank" rel="noopener noreferrer" className="underline">
            {label}
          </a>.
        </span>
      </label>
      {error && (
        <p className="mt-[var(--space-xs)] text-label font-sans uppercase tracking-[0.08em] text-muted">
          {error}
        </p>
      )}
    </div>
  );
}
