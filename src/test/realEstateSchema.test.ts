import { describe, expect, it } from "vitest";
import {
  appointmentStatuses,
  auditActions,
  leadStatuses,
  listingStatuses,
  workflowEntityTypes,
} from "@/lib/realEstateContract";

describe("real-estate workflow operations schema contract", () => {
  it("exports the three supported workflow entity types", () => {
    expect(workflowEntityTypes).toEqual(["lead", "listing", "appointment"]);
  });

  it("includes the supported lifecycle state for each real-estate entity", () => {
    expect(leadStatuses).toContain("qualified");
    expect(listingStatuses).toContain("under_contract");
    expect(appointmentStatuses).toContain("no_show");
  });

  it("exports the complete audit-action contract", () => {
    expect(auditActions).toEqual(["created", "updated", "synced", "status_changed", "deleted"]);
  });

  it("does not treat properties as workflow entities", () => {
    expect(workflowEntityTypes).not.toContain("property");
  });
});
