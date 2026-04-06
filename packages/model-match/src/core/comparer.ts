import type { ModelProfile, MatchResult } from "./types.js";

export const MODEL_PROFILES: ModelProfile[] = [
  { name: "gpt-4o", vendor: "openai", costPer1MInput: 2.50, costPer1MOutput: 10.00, avgLatencyMs: 800, strengths: ["general", "coding", "analysis"] },
  { name: "gpt-4o-mini", vendor: "openai", costPer1MInput: 0.15, costPer1MOutput: 0.60, avgLatencyMs: 400, strengths: ["general", "simple-tasks"] },
  { name: "claude-sonnet-4", vendor: "anthropic", costPer1MInput: 3.00, costPer1MOutput: 15.00, avgLatencyMs: 900, strengths: ["coding", "analysis", "writing"] },
  { name: "claude-haiku-3.5", vendor: "anthropic", costPer1MInput: 0.80, costPer1MOutput: 4.00, avgLatencyMs: 300, strengths: ["simple-tasks", "classification"] },
  { name: "gemini-2.0-flash", vendor: "google", costPer1MInput: 0.10, costPer1MOutput: 0.40, avgLatencyMs: 350, strengths: ["general", "simple-tasks", "fast"] },
];

export function compareModels(task: string, avgTokens: number = 1000): MatchResult[] {
  return MODEL_PROFILES.map((model) => {
    const costPerRequest = (model.costPer1MInput * avgTokens / 1000000) + (model.costPer1MOutput * (avgTokens * 0.5) / 1000000);
    let qualityScore = 70;
    if (model.strengths.includes(task)) qualityScore += 20;
    if (model.costPer1MInput > 1.00) qualityScore += 10;
    const valueScore = costPerRequest > 0 ? Math.round((qualityScore / (costPerRequest * 1000)) * 10) / 10 : qualityScore;
    return { model: model.name, qualityScore: Math.min(100, qualityScore), costPerRequest: Math.round(costPerRequest * 10000) / 10000, latencyMs: model.avgLatencyMs, valueScore };
  }).sort((a, b) => b.valueScore - a.valueScore);
}
