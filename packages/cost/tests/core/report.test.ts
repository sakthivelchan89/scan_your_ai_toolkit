import { describe, it, expect } from "vitest";
import { generateReport } from "../../src/core/report.js";
import type { UsageRecord } from "../../src/core/types.js";

describe("generateReport", () => {
  it("generates a cost report from usage records", () => {
    const records: UsageRecord[] = [
      { vendor: "openai", model: "gpt-4o", date: "2026-04-01", inputTokens: 100000, outputTokens: 50000, requests: 50, costUsd: 0.75 },
      { vendor: "openai", model: "gpt-4o-mini", date: "2026-04-01", inputTokens: 500000, outputTokens: 200000, requests: 200, costUsd: 0.20 },
      { vendor: "anthropic", model: "claude-sonnet-4", date: "2026-04-01", inputTokens: 200000, outputTokens: 100000, requests: 80, costUsd: 2.10 },
      { vendor: "openai", model: "gpt-4o", date: "2026-04-02", inputTokens: 80000, outputTokens: 40000, requests: 40, costUsd: 0.60 },
    ];
    const report = generateReport(records, "last-7d");
    expect(report.totalCostUsd).toBeCloseTo(3.65, 1);
    expect(report.totalRequests).toBe(370);
    expect(report.byVendor.length).toBe(2);
    expect(report.byModel.length).toBe(3);
    expect(report.dailyTrend.length).toBe(2);
  });

  it("handles empty records", () => {
    const report = generateReport([], "last-7d");
    expect(report.totalCostUsd).toBe(0);
    expect(report.byVendor).toHaveLength(0);
  });
});
