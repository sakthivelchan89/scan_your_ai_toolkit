import { describe, it, expect } from "vitest";
import { suggestOptimizations } from "../../src/core/optimizer.js";
import type { CostReport } from "../../src/core/types.js";

describe("suggestOptimizations", () => {
  it("suggests model downgrades when applicable", () => {
    const report: CostReport = {
      period: "last-30d", startDate: "2026-03-01", endDate: "2026-03-30",
      totalCostUsd: 150, totalRequests: 5000, totalTokens: 10000000,
      byVendor: [{ vendor: "openai", costUsd: 150, requests: 5000, percentage: 100 }],
      byModel: [
        { model: "gpt-4o", vendor: "openai", costUsd: 120, requests: 4000 },
        { model: "gpt-4o-mini", vendor: "openai", costUsd: 30, requests: 1000 },
      ],
      dailyTrend: [],
    };
    const opts = suggestOptimizations(report);
    expect(opts.length).toBeGreaterThan(0);
    expect(opts.some((o) => o.description.toLowerCase().includes("downgrade") || o.description.toLowerCase().includes("mini"))).toBe(true);
  });
});
