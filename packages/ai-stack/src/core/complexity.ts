import type { ProbeResult } from "@maiife-ai-pub/probe";
import type { ComplexityScore } from "./types.js";

function levelFromScore(score: number): ComplexityScore["level"] {
  if (score >= 75) return "expert";
  if (score >= 50) return "advanced";
  if (score >= 25) return "practitioner";
  return "beginner";
}

export function computeComplexity(result: ProbeResult): ComplexityScore {
  const categoriesUsed = [
    result.ide.length > 0,
    result.mcp.length > 0,
    result.agents.length > 0,
    result.models.length > 0,
    result.deps.length > 0,
    result.keys.length > 0,
  ].filter(Boolean).length;
  const toolDiversity = Math.min(25, Math.round((categoriesUsed / 6) * 25));

  const mcpCount = result.mcp.length;
  const mcpServers = Math.min(25, mcpCount <= 0 ? 0 : mcpCount === 1 ? 8 : mcpCount <= 3 ? 15 : mcpCount <= 6 ? 20 : 25);

  const agentCount = result.agents.length;
  const modelCount = result.models.length;
  const agentUsage = Math.min(25, (agentCount * 10) + (modelCount * 8));

  const sdkCount = result.deps.length;
  const sdkBreadth = Math.min(25, sdkCount * 8);

  const total = toolDiversity + mcpServers + agentUsage + sdkBreadth;

  return {
    total,
    breakdown: { toolDiversity, mcpServers, agentUsage, sdkBreadth },
    level: levelFromScore(total),
  };
}
