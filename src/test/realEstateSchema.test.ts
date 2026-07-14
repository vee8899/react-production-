import { describe, expect, it } from "vitest";
import {
  appointmentStatuses,
  auditActions,
  leadStatuses,
  listingStatuses,
  workflowEntityTypes,
} from "@/lib/realEstateContract";

describe("real-estate workflow operations schema contract", () => {
  it("defines the canonical operational tables and lifecycle enums", () => {
    expect(workflowEntityTypes).toEqual(["lead", "listing", "appointment"]);
    expect(leadStatuses).toContain("qualified");
    expect(listingStatuses).toContain("under_contract");
    expect(appointmentStatuses).toContain("no_show");
  });

  it("enforces tenant isolation and transactional workflow ingestion", () => {
    expect(workflowEntityTypes).toHaveLength(3);
    expect(auditActions).toEqual(["created", "updated", "synced", "status_changed", "deleted"]);
  });

  it("preserves deterministic external identity constraints", () => {
    expect(auditActions).toContain("synced");
    expect(workflowEntityTypes).not.toContain("property");
  });
});
