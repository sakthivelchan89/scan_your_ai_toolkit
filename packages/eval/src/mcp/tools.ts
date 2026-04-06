import { evalScore } from "../core/scorer.js";
import { evalBatch } from "../core/batch.js";
import { evalCompare } from "../core/compare.js";
import { getRubric, listRubrics } from "../core/rubrics/index.js";

export async function evalScoreTool(params: { output: string; rubric: string; context?: string }) {
  const rubric = getRubric(params.rubric);
  if (!rubric) throw new Error(`Unknown rubric: ${params.rubric}. Available: ${listRubrics().join(", ")}`);
  return evalScore({ output: params.output, rubric, context: params.context });
}

export async function evalBatchTool(params: { outputs: string[]; rubric: string }) {
  const rubric = getRubric(params.rubric);
  if (!rubric) throw new Error(`Unknown rubric: ${params.rubric}`);
  return evalBatch({ outputs: params.outputs, rubric });
}

export async function evalCompareTool(params: { baseline: string[]; candidate: string[]; rubric: string }) {
  const rubric = getRubric(params.rubric);
  if (!rubric) throw new Error(`Unknown rubric: ${params.rubric}`);
  return evalCompare({ baselineOutputs: params.baseline, candidateOutputs: params.candidate, rubric });
}
