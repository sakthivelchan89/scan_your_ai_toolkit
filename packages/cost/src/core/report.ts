import type { UsageRecord, CostReport } from "./types.js";

export function generateReport(records: UsageRecord[], period: string): CostReport {
  const totalCostUsd = records.reduce((sum, r) => sum + r.costUsd, 0);
  const totalRequests = records.reduce((sum, r) => sum + r.requests, 0);
  const totalTokens = records.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);

  const vendorMap = new Map<string, { costUsd: number; requests: number }>();
  for (const r of records) {
    const existing = vendorMap.get(r.vendor) ?? { costUsd: 0, requests: 0 };
    existing.costUsd += r.costUsd; existing.requests += r.requests;
    vendorMap.set(r.vendor, existing);
  }
  const byVendor = [...vendorMap.entries()].map(([vendor, data]) => ({
    vendor, ...data, percentage: totalCostUsd > 0 ? Math.round((data.costUsd / totalCostUsd) * 100) : 0,
  })).sort((a, b) => b.costUsd - a.costUsd);

  const modelMap = new Map<string, { vendor: string; costUsd: number; requests: number }>();
  for (const r of records) {
    const key = `${r.vendor}:${r.model}`;
    const existing = modelMap.get(key) ?? { vendor: r.vendor, costUsd: 0, requests: 0 };
    existing.costUsd += r.costUsd; existing.requests += r.requests;
    modelMap.set(key, existing);
  }
  const byModel = [...modelMap.entries()].map(([key, data]) => ({
    model: key.split(":")[1], ...data,
  })).sort((a, b) => b.costUsd - a.costUsd);

  const dayMap = new Map<string, number>();
  for (const r of records) dayMap.set(r.date, (dayMap.get(r.date) ?? 0) + r.costUsd);
  const dailyTrend = [...dayMap.entries()]
    .map(([date, costUsd]) => ({ date, costUsd: Math.round(costUsd * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const dates = records.map((r) => r.date).sort();

  return {
    period, startDate: dates[0] ?? new Date().toISOString().split("T")[0],
    endDate: dates[dates.length - 1] ?? new Date().toISOString().split("T")[0],
    totalCostUsd: Math.round(totalCostUsd * 100) / 100, totalRequests, totalTokens, byVendor, byModel, dailyTrend,
  };
}
