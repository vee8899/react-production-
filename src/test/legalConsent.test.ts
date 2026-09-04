import { describe, expect, it } from "vitest";
import { hasCompleteRequiredConsent, REQUIRED_DOCUMENTS } from "@/lib/legalConsent";

describe("legal consent requirements", () => {
  it("lists terms of service and privacy policy as the required legal documents", () => {
    expect(REQUIRED_DOCUMENTS).toEqual(["terms_of_service", "privacy_policy"]);
  });

  it("rejects missing or declined required consent", () => {
    expect(hasCompleteRequiredConsent(undefined)).toBe(false);
    expect(hasCompleteRequiredConsent({ terms_of_service: true })).toBe(false);
    expect(hasCompleteRequiredConsent({ terms_of_service: true, privacy_policy: false })).toBe(false);
  });

  it("accepts consent only when every required document is approved", () => {
    expect(hasCompleteRequiredConsent({ terms_of_service: true, privacy_policy: true })).toBe(true);
  });
});
