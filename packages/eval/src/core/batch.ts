import type { BatchResult, Rubric, EvalResult, JudgeFn } from "./types.js";
import { evalScore } from "./scorer.js";

export async function evalBatch(params: {
  outputs: string[]; rubric: Rubric; context?: string; judge?: JudgeFn;
}): Promise<BatchResult> {
  const results = await Promise.all(
    params.outputs.map((output) =>
      evalScore({ output, rubric: params.rubric, context: params.context, judge: params.judge })
    )
  );

  const scores = results.map((r) => r.totalScore);
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const min = scores.length > 0 ? Math.min(...scores) : 0;
  const max = scores.length > 0 ? Math.max(...scores) : 0;
  const variance = scores.length > 0 ? scores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / scores.length : 0;
  const stdDev = Math.sqrt(variance);
  const outliers = results.filter((r) => Math.abs(r.totalScore - avg) > 1.5 * stdDev);

  return {
    rubric: params.rubric.name, count: results.length, avgScore: Math.round(avg),
    minScore: min, maxScore: max, stdDev: Math.round(stdDev * 10) / 10, results, outliers,
  };
}
