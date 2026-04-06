import { runScan } from "../core/scanner.js";
import {
  createIDEScanner,
  createMCPScanner,
  createAgentsScanner,
  createKeysScanner,
  createModelsScanner,
  createDepsScanner,
} from "../core/scanners/index.js";
import type { ScanConfig, ScanCategory, ScanScope, ProbeResult } from "../core/types.js";
import type { RiskLevel } from "@maiife-ai-pub/shared";

const ALL_SCANNERS = {
  ide: createIDEScanner(),
  mcp: createMCPScanner(),
  agents: createAgentsScanner(),
  keys: createKeysScanner(),
  models: createModelsScanner(),
  deps: createDepsScanner(),
};

function computeRiskLevel(result: ProbeResult): RiskLevel {
  const totalFindings =
    result.ide.length + result.mcp.length + result.agents.length +
    result.keys.length + result.models.length + result.deps.length;

  const hasHighRiskMCP = result.mcp.some((m) => m.risk === "high" || m.risk === "critical");
  const hasUnmanagedKeys = result.keys.some((k) => !k.managed);

  if (hasHighRiskMCP && hasUnmanagedKeys) return "critical";
  if (hasHighRiskMCP || hasUnmanagedKeys) return "high";
  if (totalFindings > 5) return "medium";
  return "low";
}

function generateRecommendations(result: ProbeResult): string[] {
  const recs: string[] = [];
  const unmanagedKeys = result.keys.filter((k) => !k.managed);
  if (unmanagedKeys.length > 0) {
    recs.push(`${unmanagedKeys.length} API key(s) in plaintext .env files — rotate through a key manager`);
  }
  const highRiskMCP = result.mcp.filter((m) => m.risk === "high" || m.risk === "critical");
  if (highRiskMCP.length > 0) {
    recs.push(`${highRiskMCP.length} MCP server(s) with elevated permissions — review and constrain`);
  }
  if (result.agents.length > 0 && result.deps.length === 0) {
    recs.push(`${result.agents.length} agent framework(s) with no observability SDK — add tracing`);
  }
  return recs;
}

export async function probeScan(params: {
  scope?: string;
  categories?: string;
  path?: string;
  includeProjectDeps?: boolean;
}): Promise<{
  findings: ProbeResult;
  summary: { totalFindings: number; riskLevel: RiskLevel; recommendations: string[] };
}> {
  const categories = params.categories
    ? (params.categories.split(",") as ScanCategory[])
    : (["ide", "mcp", "agents", "keys", "models", "deps"] as ScanCategory[]);

  const config: ScanConfig = {
    scope: (params.scope as ScanScope) ?? "full",
    categories,
    path: params.path ?? process.cwd(),
    includeProjectDeps: params.includeProjectDeps ?? true,
  };

  const result = await runScan(config, ALL_SCANNERS);

  const totalFindings =
    result.ide.length + result.mcp.length + result.agents.length +
    result.keys.length + result.models.length + result.deps.length;

  return {
    findings: result,
    summary: {
      totalFindings,
      riskLevel: computeRiskLevel(result),
      recommendations: generateRecommendations(result),
    },
  };
}
