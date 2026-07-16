import { describe, expect, it } from "vitest";
import { summarizeRuns, DEMO_RUNS } from "@/demo/demoData";

describe("demo data", () => {
  it("summarizes seeded runs", () => {
    expect(summarizeRuns(DEMO_RUNS)).toEqual({
      total: 4,
      successful: 3,
      failed: 1,
      records: 47,
    });
  });
});
