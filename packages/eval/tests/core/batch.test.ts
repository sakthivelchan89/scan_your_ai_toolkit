import { describe, it, expect } from "vitest";
import { evalBatch } from "../../src/core/batch.js";
import { getRubric } from "../../src/core/rubrics/index.js";

describe("evalBatch", () => {
  it("scores multiple outputs and returns stats", async () => {
    const rubric = getRubric("code-review")!;
    const outputs = [
      "Good use of types. Consider adding error handling for the edge case on line 42. The naming convention is consistent.",
      "lgtm",
      "This PR refactors the auth module. I noticed: 1) Missing null check in validateToken, 2) The error message on line 88 leaks internal details, 3) Good test coverage overall. Suggested fix for #1: add `if (!token) return null` before line 23.",
    ];
    const result = await evalBatch({ outputs, rubric });
    expect(result.count).toBe(3);
    expect(result.avgScore).toBeGreaterThan(0);
    expect(result.results.length).toBe(3);
    expect(result.minScore).toBeLessThanOrEqual(result.maxScore);
  });
});
