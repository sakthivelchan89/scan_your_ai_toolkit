import { describe, it, expect } from "vitest";
import { improvePrompt } from "../../src/core/improver.js";

describe("improvePrompt", () => {
  it("improves a vague prompt", () => {
    const result = improvePrompt("Write me some code");
    expect(result.scoreAfter).toBeGreaterThan(result.scoreBefore);
    expect(result.improved.length).toBeGreaterThan(result.original.length);
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it("returns minimal changes for a good prompt", () => {
    const good = `You are a senior TypeScript developer.
## Task
Write a function that validates email addresses.
## Requirements
- Accept a string parameter
- Return { valid: boolean }
## Output Format
TypeScript function with JSDoc.`;

    const result = improvePrompt(good);
    expect(result.scoreAfter).toBeGreaterThanOrEqual(result.scoreBefore);
  });
});
