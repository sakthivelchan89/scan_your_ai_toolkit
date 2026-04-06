import { parseAllMCPConfigs } from "@maiife-ai-pub/mcp-audit";
import { checkServer } from "../core/checker.js";
import { suggestFixes } from "../core/fixer.js";
import type { DoctorReport, HealthStatus } from "../core/types.js";

export async function mcpDoctorCheckup(params: { configPath?: string; server?: string }): Promise<DoctorReport> {
  const servers = parseAllMCPConfigs(params.configPath);
  const filtered = params.server ? servers.filter((s) => s.name === params.server) : servers;
  const healthResults = await Promise.all(filtered.map(checkServer));
  const count = (status: HealthStatus) => healthResults.filter((h) => h.status === status).length;
  return {
    timestamp: new Date().toISOString(),
    servers: healthResults,
    summary: { healthy: count("healthy"), degraded: count("degraded"), dead: count("dead"), stale: count("stale"), total: healthResults.length },
  };
}

export async function mcpDoctorFix(params: { configPath?: string }) {
  const report = await mcpDoctorCheckup(params);
  const fixes = suggestFixes(report.servers);
  return { report, fixes };
}

export async function mcpDoctorStatus(params: { configPath?: string }) {
  const report = await mcpDoctorCheckup(params);
  return report.servers.map((s) => ({ name: s.name, status: s.status, issues: s.checks.filter((c) => !c.passed).length }));
}
