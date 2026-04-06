import type { CompareResult, Rubric, JudgeFn } from "./types.js";
import { evalBatch } from "./batch.js";

export async function evalCompare(params: {
  baselineOutputs: string[]; candidateOutputs: string[]; rubric: Rubric; judge?: JudgeFn;
}): Promise<CompareResult> {
  const baseline = await evalBatch({ outputs: params.baselineOutputs, rubric: params.rubric, judge: params.judge });
  const candidate = await evalBatch({ outputs: params.candidateOutputs, rubric: params.rubric, judge: params.judge });

  const delta = candidate.avgScore - baseline.avgScore;
  const combinedStdDev = Math.sqrt(baseline.stdDev ** 2 + candidate.stdDev ** 2) || 1;
  const zScore = Math.abs(delta) / combinedStdDev;
  const pValue = Math.max(0.001, Math.round((1 - Math.min(1, zScore / 3)) * 1000) / 1000);

  return {
    rubric: params.rubric.name,
    baseline: { avgScore: baseline.avgScore, count: baseline.count },
    candidate: { avgScore: candidate.avgScore, count: candidate.count },
    delta: Math.round(delta * 10) / 10,
    winner: Math.abs(delta) < 3 ? "tie" : delta > 0 ? "candidate" : "baseline",
    pValue, significant: pValue < 0.05,
  };
}
