import { estimateCostOpenAI } from "./adapters/openai.js";
import { estimateCostAnthropic } from "./adapters/anthropic.js";
import { estimateCostCohere } from "./adapters/cohere.js";
import { estimateCostGoogle } from "./adapters/google.js";

const VENDOR_PREFIXES: Record<string, (model: string, input: number, output: number) => number> = {
  "gpt-": estimateCostOpenAI,
  "o1": estimateCostOpenAI,
  "o3": estimateCostOpenAI,
  "o4": estimateCostOpenAI,
  "claude-": estimateCostAnthropic,
  "command": estimateCostCohere,
  "gemini-": estimateCostGoogle,
};

/**
 * Estimate the cost (USD) for a given model + token counts.
 * Auto-detects vendor from model name prefix.
 * Pass explicit vendor to disambiguate if needed.
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  vendor?: "openai" | "anthropic" | "cohere" | "google",
): number {
  if (vendor === "openai") return estimateCostOpenAI(model, inputTokens, outputTokens);
  if (vendor === "anthropic") return estimateCostAnthropic(model, inputTokens, outputTokens);
  if (vendor === "cohere") return estimateCostCohere(model, inputTokens, outputTokens);
  if (vendor === "google") return estimateCostGoogle(model, inputTokens, outputTokens);

  for (const [prefix, fn] of Object.entries(VENDOR_PREFIXES)) {
    if (model.startsWith(prefix)) return fn(model, inputTokens, outputTokens);
  }
  return 0;
}
