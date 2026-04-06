import { describe, it, expect } from "vitest";
import { recommend } from "../../src/core/recommender.js";
import { compareModels } from "../../src/core/comparer.js";

describe("model-match", () => {
  it("recommends models for a coding task", () => {
    const rec = recommend("coding");
    expect(rec.bestQuality).toBeTruthy();
    expect(rec.bestValue).toBeTruthy();
    expect(rec.suggestion).toBeTruthy();
  });

  it("compares models with costs and quality", () => {
    const results = compareModels("general");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].valueScore).toBeGreaterThan(0);
    expect(results[0].costPerRequest).toBeGreaterThanOrEqual(0);
  });
});
