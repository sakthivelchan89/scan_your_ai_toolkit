import type { VendorAdapter, UsageRecord } from "../types.js";

// Prices per 1M tokens (USD) — updated April 2026
const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4.1": { input: 2.00, output: 8.00 },
  "gpt-4.1-mini": { input: 0.40, output: 1.60 },
  "gpt-4.1-nano": { input: 0.10, output: 0.40 },
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
  "o1": { input: 15.00, output: 60.00 },
  "o1-mini": { input: 3.00, output: 12.00 },
  "o3": { input: 10.00, output: 40.00 },
  "o3-mini": { input: 1.10, output: 4.40 },
  "o4-mini": { input: 1.10, output: 4.40 },
};

function lookupPricing(model: string): { input: number; output: number } | null {
  if (OPENAI_PRICING[model]) return OPENAI_PRICING[model];
  // prefix match: "gpt-4o-2024-11-20" → "gpt-4o"
  for (const [key, price] of Object.entries(OPENAI_PRICING)) {
    if (model.startsWith(key)) return price;
  }
  return null;
}

export function estimateCostOpenAI(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = lookupPricing(model);
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export function createOpenAIAdapter(): VendorAdapter {
  return {
    name: "openai",
    async fetchUsage(apiKey: string, days: number): Promise<UsageRecord[]> {
      if (!apiKey) return [];
      try {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - days * 86400;
        const url = `https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&end_time=${endTime}&bucket_width=1d&limit=180`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) return [];
        const json = await res.json() as {
          data?: Array<{
            start_time: number;
            results: Array<{
              model_id: string;
              input_tokens: number;
              output_tokens: number;
              num_model_requests: number;
            }>;
          }>;
        };
        const records: UsageRecord[] = [];
        for (const bucket of json.data ?? []) {
          const date = new Date(bucket.start_time * 1000).toISOString().split("T")[0];
          for (const r of bucket.results ?? []) {
            const costUsd = estimateCostOpenAI(r.model_id, r.input_tokens, r.output_tokens);
            records.push({
              vendor: "openai", model: r.model_id, date,
              inputTokens: r.input_tokens, outputTokens: r.output_tokens,
              requests: r.num_model_requests,
              costUsd: Math.round(costUsd * 10000) / 10000,
            });
          }
        }
        return records;
      } catch {
        return [];
      }
    },
  };
}

export { OPENAI_PRICING };
