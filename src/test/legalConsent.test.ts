import { describe, expect, it } from "vitest";
import { hasCompleteRequiredConsent, REQUIRED_DOCUMENTS } from "@/lib/legalConsent";

describe("legal consent requirements", () => {
  it("requires every current legal document", () => {
    expect(REQUIRED_DOCUMENTS).toEqual(["terms_of_service", "privacy_policy"]);
    expect(hasCompleteRequiredConsent(undefined)).toBe(false);
    expect(hasCompleteRequiredConsent({ terms_of_service: true })).toBe(false);
    expect(hasCompleteRequiredConsent({ terms_of_service: true, privacy_policy: false })).toBe(false);
    expect(hasCompleteRequiredConsent({ terms_of_service: true, privacy_policy: true })).toBe(true);
  });
});
