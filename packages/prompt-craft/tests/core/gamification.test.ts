import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordScore, getLevelName, checkBadges } from "../../src/core/gamification.js";
import * as store from "../../src/core/store.js";

vi.mock("../../src/core/store.js");

describe("gamification", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("records a score and gains XP", () => {
    const mockStore = { profile: { level: 1, xp: 0, streak: 0, totalScored: 0, avgScore: 0, badges: [], scoreHistory: [] }, createdAt: "2026-01-01" };
    vi.spyOn(store, "loadCraftStore").mockReturnValue(mockStore);
    const saveSpy = vi.spyOn(store, "saveCraftStore").mockImplementation(() => {});
    const result = recordScore(75);
    expect(result.xpGained).toBeGreaterThan(0);
    expect(result.profile.totalScored).toBe(1);
    expect(result.profile.xp).toBeGreaterThan(0);
    expect(saveSpy).toHaveBeenCalled();
  });

  it("levels up when XP threshold reached", () => {
    const mockStore = { profile: { level: 1, xp: 90, streak: 0, totalScored: 9, avgScore: 60, badges: [], scoreHistory: [] }, createdAt: "2026-01-01" };
    vi.spyOn(store, "loadCraftStore").mockReturnValue(mockStore);
    vi.spyOn(store, "saveCraftStore").mockImplementation(() => {});
    const result = recordScore(80);
    expect(result.profile.level).toBeGreaterThanOrEqual(2);
    expect(result.leveledUp).toBe(true);
  });

  it("returns correct level names", () => {
    expect(getLevelName(1)).toBe("Beginner");
    expect(getLevelName(6)).toBe("Practitioner");
    expect(getLevelName(11)).toBe("Advanced");
    expect(getLevelName(16)).toBe("Expert");
  });

  it("awards first-score badge", () => {
    const badges = checkBadges({ level: 1, xp: 10, streak: 0, totalScored: 1, avgScore: 75, badges: [], scoreHistory: [{ date: "2026-04-04", score: 75 }] });
    expect(badges.some((b) => b.id === "first-score")).toBe(true);
  });
});
