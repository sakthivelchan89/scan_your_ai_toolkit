import type { VendorAdapter, UsageRecord } from "../types.js";

// Prices per 1M tokens (USD) — updated April 2026
const ANTHROPIC_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4": { input: 15.00, output: 75.00 },
  "claude-opus-4-5": { input: 15.00, output: 75.00 },
  "claude-sonnet-4": { input: 3.00, output: 15.00 },
  "claude-sonnet-4-5": { input: 3.00, output: 15.00 },
  "claude-haiku-4-5": { input: 0.80, output: 4.00 },
  "claude-3-5-sonnet": { input: 3.00, output: 15.00 },
  "claude-3-5-haiku": { input: 0.80, output: 4.00 },
  "claude-3-opus": { input: 15.00, output: 75.00 },
  "claude-3-sonnet": { input: 3.00, output: 15.00 },
  "claude-3-haiku": { input: 0.25, output: 1.25 },
};

function lookupPricing(model: string): { input: number; output: number } | null {
  if (ANTHROPIC_PRICING[model]) return ANTHROPIC_PRICING[model];
  // prefix match: "claude-sonnet-4-20250514" → "claude-sonnet-4"
  for (const [key, price] of Object.entries(ANTHROPIC_PRICING)) {
    if (model.startsWith(key)) return price;
  }
  return null;
}

export function estimateCostAnthropic(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = lookupPricing(model);
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export function createAnthropicAdapter(): VendorAdapter {
  return {
    name: "anthropic",
    async fetchUsage(apiKey: string, days: number): Promise<UsageRecord[]> {
      if (!apiKey) return [];
      try {
        // Anthropic usage API: requires admin key with usage:read scope
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(Date.now() - days * 86400_000).toISOString().split("T")[0];
        const url = `https://api.anthropic.com/v1/usage?start_date=${startDate}&end_date=${endDate}`;
        const res = await fetch(url, {
          headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        });
        if (!res.ok) return [];
        const json = await res.json() as {
          data?: Array<{
            usage_period: string;
            model: string;
            input_tokens: number;
            output_tokens: number;
          }>;
        };
        return (json.data ?? []).map((r) => {
          const costUsd = estimateCostAnthropic(r.model, r.input_tokens, r.output_tokens);
          return {
            vendor: "anthropic", model: r.model,
            date: r.usage_period.split("T")[0],
            inputTokens: r.input_tokens, outputTokens: r.output_tokens,
            requests: 0, // Anthropic usage API doesn't return request count per period
            costUsd: Math.round(costUsd * 10000) / 10000,
          };
        });
      } catch {
        return [];
      }
    },
  };
}

export { ANTHROPIC_PRICING };
