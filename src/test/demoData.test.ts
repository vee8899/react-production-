import { describe, expect, it } from "vitest";
import { parseDemoLeadsCsv, SAMPLE_LEADS_CSV, summarizeRuns, DEMO_RUNS } from "@/demo/demoData";

describe("demo data", () => {
  it("parses the sample lead import", () => {
    const leads = parseDemoLeadsCsv(SAMPLE_LEADS_CSV);

    expect(leads).toHaveLength(3);
    expect(leads[0]).toMatchObject({
      name: "Alex Morgan",
      email: "alex.morgan@example.test",
      status: "new",
    });
  });

  it("requires an email column and valid email values", () => {
    expect(() => parseDemoLeadsCsv("name\nAlex")).toThrow("email column");
    expect(() => parseDemoLeadsCsv("email\nnot-an-email")).toThrow("valid email");
  });

  it("summarizes seeded runs", () => {
    expect(summarizeRuns(DEMO_RUNS)).toEqual({
      total: 4,
      successful: 3,
      failed: 1,
      records: 47,
    });
  });
});
