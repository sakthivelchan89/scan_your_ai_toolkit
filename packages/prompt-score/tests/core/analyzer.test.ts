import { describe, it, expect } from "vitest";
import { analyzePrompt } from "../../src/core/analyzer.js";

describe("analyzePrompt", () => {
  it("scores a vague prompt poorly", () => {
    const result = analyzePrompt("Write me some code");
    expect(result.totalScore).toBeLessThan(40);
    expect(result.grade).toMatch(/^[DF]$/);
    expect(result.antiPatterns.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("scores a well-structured prompt highly", () => {
    const result = analyzePrompt(`You are a senior TypeScript developer.

## Task
Write a function that validates email addresses using RFC 5322 regex.

## Requirements
- Accept a single string parameter
- Return { valid: boolean; reason?: string }
- Handle edge cases: empty string, null, unicode

## Output Format
Return only the TypeScript function with JSDoc comments.

## Examples
Input: "user@example.com" → { valid: true }
Input: "not-an-email" → { valid: false, reason: "missing @ symbol" }`);

    expect(result.totalScore).toBeGreaterThan(70);
    expect(result.grade).toMatch(/^[AB]$/);
    expect(result.dimensions.length).toBe(6);
  });

  it("detects anti-patterns", () => {
    const result = analyzePrompt("Do everything perfectly and make no mistakes. Be creative but also be precise.");
    expect(result.antiPatterns.some((a) => a.includes("contradict"))).toBe(true);
  });

  it("handles empty prompt", () => {
    const result = analyzePrompt("");
    expect(result.totalScore).toBe(0);
    expect(result.grade).toBe("F");
  });
});
