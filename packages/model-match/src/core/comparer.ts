import type { ModelProfile, MatchResult } from "./types.js";

// Updated April 2026
export const MODEL_PROFILES: ModelProfile[] = [
  { name: "gpt-4.1", vendor: "openai", costPer1MInput: 2.00, costPer1MOutput: 8.00, avgLatencyMs: 700, strengths: ["general", "coding", "analysis", "long-context"] },
  { name: "gpt-4.1-mini", vendor: "openai", costPer1MInput: 0.40, costPer1MOutput: 1.60, avgLatencyMs: 350, strengths: ["general", "simple-tasks", "fast"] },
  { name: "gpt-4o", vendor: "openai", costPer1MInput: 2.50, costPer1MOutput: 10.00, avgLatencyMs: 800, strengths: ["general", "coding", "analysis", "vision"] },
  { name: "gpt-4o-mini", vendor: "openai", costPer1MInput: 0.15, costPer1MOutput: 0.60, avgLatencyMs: 400, strengths: ["general", "simple-tasks"] },
  { name: "o3-mini", vendor: "openai", costPer1MInput: 1.10, costPer1MOutput: 4.40, avgLatencyMs: 2000, strengths: ["reasoning", "math", "coding"] },
  { name: "claude-opus-4-5", vendor: "anthropic", costPer1MInput: 15.00, costPer1MOutput: 75.00, avgLatencyMs: 1200, strengths: ["coding", "analysis", "writing", "reasoning"] },
  { name: "claude-sonnet-4-5", vendor: "anthropic", costPer1MInput: 3.00, costPer1MOutput: 15.00, avgLatencyMs: 900, strengths: ["coding", "analysis", "writing", "general"] },
  { name: "claude-haiku-4-5", vendor: "anthropic", costPer1MInput: 0.80, costPer1MOutput: 4.00, avgLatencyMs: 300, strengths: ["simple-tasks", "classification", "fast"] },
  { name: "gemini-2.5-pro", vendor: "google", costPer1MInput: 1.25, costPer1MOutput: 10.00, avgLatencyMs: 900, strengths: ["general", "coding", "analysis", "long-context"] },
  { name: "gemini-2.5-flash", vendor: "google", costPer1MInput: 0.075, costPer1MOutput: 0.30, avgLatencyMs: 350, strengths: ["general", "simple-tasks", "fast"] },
  { name: "gemini-2.0-flash", vendor: "google", costPer1MInput: 0.10, costPer1MOutput: 0.40, avgLatencyMs: 300, strengths: ["general", "simple-tasks", "fast", "vision"] },
];

let _liveProfiles: ModelProfile[] | null = null;

/**
 * Fetch live model catalog from Maiife API or OpenAI/Anthropic.
 * Falls back to static MODEL_PROFILES if unavailable.
 *
 * @param maiifUrl  Maiife /v1/models endpoint (org-scoped, policy-filtered)
 * @param apiKey    Bearer token for the endpoint
 */
export async function refreshModelProfiles(maiifUrl?: string, apiKey?: string): Promise<ModelProfile[]> {
  const url = maiifUrl ?? process.env.MAIIFE_API_URL;
  const key = apiKey ?? process.env.MAIIFE_API_KEY;
  if (!url || !key) return MODEL_PROFILES;

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/v1/models`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return MODEL_PROFILES;
    const json = await res.json() as { data?: Array<{ id: string; vendor?: string; pricing?: { inputPer1M: number; outputPer1M: number } }> };
    if (!json.data?.length) return MODEL_PROFILES;
    _liveProfiles = json.data.map((m): ModelProfile => ({
      name: m.id,
      vendor: m.vendor ?? "unknown",
      costPer1MInput: m.pricing?.inputPer1M ?? 1.00,
      costPer1MOutput: m.pricing?.outputPer1M ?? 4.00,
      avgLatencyMs: 800,
      strengths: ["general"],
    }));
    return _liveProfiles;
  } catch {
    return MODEL_PROFILES;
  }
}

export function getModelProfiles(): ModelProfile[] {
  return _liveProfiles ?? MODEL_PROFILES;
}

export function compareModels(task: string, avgTokens: number = 1000): MatchResult[] {
  return getModelProfiles().map((model) => {
    const costPerRequest = (model.costPer1MInput * avgTokens / 1000000) + (model.costPer1MOutput * (avgTokens * 0.5) / 1000000);
    let qualityScore = 70;
    if (model.strengths.includes(task)) qualityScore += 20;
    if (model.costPer1MInput > 1.00) qualityScore += 10;
    const valueScore = costPerRequest > 0 ? Math.round((qualityScore / (costPerRequest * 1000)) * 10) / 10 : qualityScore;
    return { model: model.name, qualityScore: Math.min(100, qualityScore), costPerRequest: Math.round(costPerRequest * 10000) / 10000, latencyMs: model.avgLatencyMs, valueScore };
  }).sort((a, b) => b.valueScore - a.valueScore);
}
