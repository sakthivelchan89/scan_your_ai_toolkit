import { describe, it, expect, vi } from "vitest";
import { generateDigest } from "../../src/core/digest.js";
import * as store from "../../src/core/store.js";
import type { JournalEntry } from "../../src/core/types.js";

vi.mock("../../src/core/store.js");

describe("generateDigest", () => {
  it("generates a weekly digest with tool and task breakdowns", () => {
    const entries: JournalEntry[] = [
      { id: "1", timestamp: new Date().toISOString(), tool: "claude", taskType: "coding", durationMinutes: 60 },
      { id: "2", timestamp: new Date().toISOString(), tool: "claude", taskType: "writing", durationMinutes: 30 },
      { id: "3", timestamp: new Date().toISOString(), tool: "chatgpt", taskType: "coding", durationMinutes: 20 },
    ];
    vi.spyOn(store, "getEntries").mockReturnValue(entries);

    const digest = generateDigest("week");
    expect(digest.totalEntries).toBe(3);
    expect(digest.totalMinutes).toBe(110);
    expect(digest.topTool).toBe("claude");
    expect(digest.topTask).toBe("coding");
    expect(digest.toolBreakdown.length).toBe(2);
    expect(digest.taskBreakdown.length).toBe(2);
    expect(digest.insights.length).toBeGreaterThan(0);
  });

  it("handles empty entries", () => {
    vi.spyOn(store, "getEntries").mockReturnValue([]);
    const digest = generateDigest("week");
    expect(digest.totalEntries).toBe(0);
    expect(digest.topTool).toBe("none");
  });
});
