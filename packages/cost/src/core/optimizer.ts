import type { CostReport, CostOptimization } from "./types.js";

const DOWNGRADE_MAP: Record<string, { target: string; qualityRetention: number; costRatio: number }> = {
  "gpt-4o": { target: "gpt-4o-mini", qualityRetention: 0.90, costRatio: 0.06 },
  "gpt-4-turbo": { target: "gpt-4o", qualityRetention: 0.95, costRatio: 0.25 },
  "claude-opus-4": { target: "claude-sonnet-4", qualityRetention: 0.92, costRatio: 0.20 },
  "o1": { target: "o1-mini", qualityRetention: 0.88, costRatio: 0.20 },
};

export function suggestOptimizations(report: CostReport): CostOptimization[] {
  const suggestions: CostOptimization[] = [];

  for (const model of report.byModel) {
    const downgrade = DOWNGRADE_MAP[model.model];
    if (downgrade && model.costUsd > 10) {
      const projectedCost = model.costUsd * downgrade.costRatio;
      const savings = model.costUsd - projectedCost;
      suggestions.push({
        description: `Downgrade ${model.model} to ${downgrade.target} (${Math.round(downgrade.qualityRetention * 100)}% quality retention for ~$${Math.round(savings)} savings)`,
        currentCost: model.costUsd, projectedCost: Math.round(projectedCost * 100) / 100,
        savingsUsd: Math.round(savings * 100) / 100, savingsPercent: Math.round((savings / model.costUsd) * 100),
        action: `Switch ${Math.round(model.requests * 0.8)} requests/month from ${model.model} to ${downgrade.target}`,
      });
    }
  }

  if (report.byVendor.length === 1 && report.totalCostUsd > 50) {
    suggestions.push({
      description: "All spend on a single vendor — consider diversifying",
      currentCost: report.totalCostUsd, projectedCost: report.totalCostUsd * 0.85,
      savingsUsd: Math.round(report.totalCostUsd * 0.15), savingsPercent: 15,
      action: "Test alternatives with @maiife/model-match",
    });
  }

  if (report.totalRequests > 1000 && !report.byVendor.some((v) => v.vendor === "local")) {
    suggestions.push({
      description: "High request volume with no local models — Ollama could handle simple tasks at $0",
      currentCost: report.totalCostUsd, projectedCost: report.totalCostUsd * 0.70,
      savingsUsd: Math.round(report.totalCostUsd * 0.30), savingsPercent: 30,
      action: "Install Ollama and route simple queries locally",
    });
  }

  return suggestions;
}
