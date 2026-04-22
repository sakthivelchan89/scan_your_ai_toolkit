import { analyzePrompt } from "./analyzer.js";
import type { PromptAnalysis } from "./types.js";

export interface GateResult {
  allow: boolean;
  score: number;
  grade: PromptAnalysis["grade"];
  analysis: PromptAnalysis;
  /** Human-readable reason when allow=false */
  reason?: string;
}

export interface PromptGate {
  /** Check a prompt against the threshold. Returns allow=false if below minimum score. */
  check(prompt: string): GateResult;
  /** Convenience: throws if prompt is blocked (useful in middleware). */
  assert(prompt: string): void;
}

/**
 * Create a prompt quality gate for use in proxy middleware.
 *
 * @param minScore  Minimum acceptable score (0-100). Default: 40.
 * @param warnOnly  If true, allow=true but result.reason is still set (warn-only mode). Default: false.
 *
 * Usage in Maiife proxy (7th policy type: prompt_quality):
 *   const gate = createPromptGate({ minScore: policy.minScore, warnOnly: policy.action === "warn" });
 *   const result = gate.check(request.prompt);
 *   if (!result.allow) return policyDenyResponse(result.reason);
 */
export function createPromptGate(options: { minScore?: number; warnOnly?: boolean } = {}): PromptGate {
  const minScore = options.minScore ?? 40;
  const warnOnly = options.warnOnly ?? false;

  return {
    check(prompt: string): GateResult {
      const analysis = analyzePrompt(prompt);
      const blocked = analysis.totalScore < minScore;
      const reason = blocked
        ? `Prompt quality score ${analysis.totalScore}/100 is below minimum ${minScore}. Issues: ${analysis.suggestions.slice(0, 2).join("; ") || analysis.antiPatterns.slice(0, 2).join("; ") || "See analysis"}`
        : undefined;

      return {
        allow: warnOnly ? true : !blocked,
        score: analysis.totalScore,
        grade: analysis.grade,
        analysis,
        reason,
      };
    },

    assert(prompt: string): void {
      const result = this.check(prompt);
      if (!result.allow) throw new Error(result.reason ?? "Prompt blocked by quality gate");
    },
  };
}
