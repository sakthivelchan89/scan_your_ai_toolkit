import { describe, it, expect } from "vitest";
import { renderMarkdown, renderTable } from "../../src/core/renderer.js";
import type { WeeklyReport } from "../../src/core/types.js";

const mockReport: WeeklyReport = {
  period: "week",
  startDate: "2026-03-28",
  endDate: "2026-04-04",
  totalInteractions: 42,
  totalMinutes: 360,
  toolBreakdown: [
    { tool: "claude", count: 25, minutes: 200, percentage: 60 },
    { tool: "chatgpt", count: 17, minutes: 160, percentage: 40 },
  ],
  taskBreakdown: [
    { task: "coding", count: 30, minutes: 250, percentage: 71 },
    { task: "writing", count: 12, minutes: 110, percentage: 29 },
  ],
  mostProductiveDay: null,
  previousWeekDelta: null,
  tip: "Try chain-of-thought prompting",
};

describe("renderer", () => {
  it("renders markdown report", () => {
    const md = renderMarkdown(mockReport);
    expect(md).toContain("AI Week in Review");
    expect(md).toContain("42");
    expect(md).toContain("claude");
    expect(md).toContain("chain-of-thought");
  });

  it("renders table report", () => {
    const table = renderTable(mockReport);
    expect(table).toContain("42 interactions");
    expect(table).toContain("claude");
  });
});
