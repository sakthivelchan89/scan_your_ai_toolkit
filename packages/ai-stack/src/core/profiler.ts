import type { ProbeResult } from "@maiife-ai-pub/probe";
import type { AIStackProfile, StackCategory, StackItem } from "./types.js";
import { computeComplexity } from "./complexity.js";

function buildCategories(result: ProbeResult): StackCategory[] {
  const categories: StackCategory[] = [];

  if (result.ide.length > 0) {
    categories.push({
      name: "Coding",
      emoji: "💻",
      items: result.ide.map((f) => ({ name: f.name, version: f.version, type: "ide" as const })),
    });
  }

  if (result.mcp.length > 0) {
    categories.push({
      name: "MCP Servers",
      emoji: "🔌",
      items: result.mcp.map((f) => ({ name: f.name, type: "mcp" as const })),
    });
  }

  if (result.agents.length > 0) {
    categories.push({
      name: "Agents",
      emoji: "🤖",
      items: result.agents.map((f) => ({ name: f.name, version: f.version, type: "agent" as const })),
    });
  }

  if (result.models.length > 0) {
    categories.push({
      name: "Local Models",
      emoji: "🏠",
      items: result.models.map((f) => ({ name: f.runtime, type: "model" as const })),
    });
  }

  if (result.deps.length > 0) {
    categories.push({
      name: "AI SDKs",
      emoji: "📦",
      items: result.deps.map((f) => ({ name: f.name, version: f.version, type: "sdk" as const })),
    });
  }

  return categories;
}

export function buildProfile(result: ProbeResult): AIStackProfile {
  const categories = buildCategories(result);
  const totalTools =
    result.ide.length + result.mcp.length + result.agents.length +
    result.models.length + result.deps.length +
    result.keys.length;

  return {
    generatedAt: new Date().toISOString(),
    categories,
    complexity: computeComplexity(result),
    stats: {
      totalTools,
      mcpServerCount: result.mcp.length,
      agentFrameworkCount: result.agents.length,
      localModelCount: result.models.length,
      apiKeyCount: result.keys.length,
    },
  };
}
