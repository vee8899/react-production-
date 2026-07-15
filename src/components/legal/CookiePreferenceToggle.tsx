import type { CookiePreference } from "@/lib/legalConsent";

type CookiePreferenceToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function CookiePreferenceToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: CookiePreferenceToggleProps) {
  return (
    <label className="flex items-start gap-3 text-sm font-sans text-muted font-[300] leading-6">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 accent-[#0F0E0D]"
      />
      <div>
        <span className="text-primary">{label}</span>
        {disabled && (
          <span className="ml-2 text-label font-mono uppercase tracking-[0.05em] text-muted">
            Required
          </span>
        )}
        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>
    </label>
  );
}

type CookiePreferencesFormProps = {
  preferences: CookiePreference | null;
  onSave: (prefs: { functional: boolean; analytics: boolean; marketing: boolean }) => void;
  isSaving: boolean;
};

export function CookiePreferencesForm({
  preferences,
  onSave,
  isSaving,
}: CookiePreferencesFormProps) {
  const [functional, setFunctional] = useState(preferences?.functional ?? false);
  const [analytics, setAnalytics] = useState(preferences?.analytics ?? false);
  const [marketing, setMarketing] = useState(preferences?.marketing ?? false);

  return (
    <div className="flex flex-col gap-6">
      <CookiePreferenceToggle
        label="Essential"
        description="Required for authentication and security. Cannot be disabled."
        checked={true}
        disabled
        onChange={() => {}}
      />
      <CookiePreferenceToggle
        label="Functional"
        description="Enables UI preferences and remembered settings."
        checked={functional}
        onChange={setFunctional}
      />
      <CookiePreferenceToggle
        label="Analytics"
        description="Enables usage analytics if analytics tooling is added."
        checked={analytics}
        onChange={setAnalytics}
      />
      <CookiePreferenceToggle
        label="Marketing"
        description="Enables marketing tracking if marketing tooling is added."
        checked={marketing}
        onChange={setMarketing}
      />
      <button
        type="button"
        disabled={isSaving}
        onClick={() => onSave({ functional, analytics, marketing })}
        className="w-full bg-[#0F0E0D] text-[#FEFDFC] text-label font-sans uppercase tracking-[0.08em] py-3 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
        style={{ borderRadius: 0 }}
      >
        {isSaving ? "Saving..." : "Save preferences"}
      </button>
    </div>
  );
}

import { useState } from "react";
