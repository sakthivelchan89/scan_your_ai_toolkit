import { createOpenAIAdapter, createAnthropicAdapter, createLocalAdapter } from "../core/adapters/index.js";
import { generateReport } from "../core/report.js";
import { suggestOptimizations } from "../core/optimizer.js";
import type { UsageRecord } from "../core/types.js";

const adapters = [createOpenAIAdapter(), createAnthropicAdapter(), createLocalAdapter()];

function parseDays(period: string): number {
  const match = period.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

export async function costReport(params: { period?: string; keys?: Record<string, string> }) {
  const days = parseDays(params.period ?? "last-30d");
  const allRecords: UsageRecord[] = [];
  for (const adapter of adapters) {
    const key = params.keys?.[adapter.name] ?? process.env[`${adapter.name.toUpperCase()}_API_KEY`] ?? "";
    if (key) { const records = await adapter.fetchUsage(key, days); allRecords.push(...records); }
  }
  return generateReport(allRecords, params.period ?? "last-30d");
}

export async function costOptimize(params: { period?: string; keys?: Record<string, string> }) {
  const report = await costReport(params);
  return { report, optimizations: suggestOptimizations(report) };
}
