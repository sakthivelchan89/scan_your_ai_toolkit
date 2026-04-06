import { describe, it, expect } from "vitest";
import { analyzeSubscriptions } from "../../src/core/analyzer.js";
import type { Subscription } from "../../src/core/types.js";

describe("analyzeSubscriptions", () => {
  it("detects waste from unused subscriptions", () => {
    const subs: Subscription[] = [
      { name: "GitHub Copilot", vendor: "github", monthlyCost: 10, usageLast30d: 200, category: "subscription" },
      { name: "ChatGPT Plus", vendor: "openai", monthlyCost: 20, usageLast30d: 2, category: "subscription" },
      { name: "Claude Pro", vendor: "anthropic", monthlyCost: 20, usageLast30d: 0, category: "subscription" },
    ];
    const report = analyzeSubscriptions(subs);
    expect(report.totalMonthlyCost).toBe(50);
    expect(report.wasteItems.length).toBe(2);
    expect(report.totalWaste).toBe(40);
  });

  it("detects overlapping tools", () => {
    const subs: Subscription[] = [
      { name: "GitHub Copilot", vendor: "github", monthlyCost: 10, usageLast30d: 100, category: "subscription" },
      { name: "Cursor Pro", vendor: "cursor", monthlyCost: 20, usageLast30d: 100, category: "subscription" },
    ];
    const report = analyzeSubscriptions(subs);
    expect(report.overlaps.length).toBe(1);
    expect(report.overlaps[0].tools).toContain("GitHub Copilot");
    expect(report.overlaps[0].tools).toContain("Cursor Pro");
  });
});
