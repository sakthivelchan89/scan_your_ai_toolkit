import { analyzePrompt } from "../core/analyzer.js";
import { improvePrompt } from "../core/improver.js";
import { trackScore, getScoreTrend } from "../core/tracker.js";

export async function promptScoreAnalyze(params: { prompt: string; track?: boolean; project?: string }) {
  const analysis = analyzePrompt(params.prompt);
  if (params.track !== false) {
    trackScore({ prompt: params.prompt, score: analysis.totalScore, grade: analysis.grade, project: params.project });
  }
  return analysis;
}

export async function promptScoreImprove(params: { prompt: string }) {
  return improvePrompt(params.prompt);
}

export async function promptScoreTrack(params: { project?: string; days?: number }) {
  return getScoreTrend(params.project, params.days ?? 30);
}
