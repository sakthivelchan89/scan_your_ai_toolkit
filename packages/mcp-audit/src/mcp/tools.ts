import { parseAllMCPConfigs } from "../core/config-parser.js";
import { auditAll, scoreServer } from "../core/scorer.js";

export async function mcpAuditScan(params: { configPath?: string; servers?: string }) {
  const allServers = parseAllMCPConfigs(params.configPath);
  const filtered = params.servers
    ? allServers.filter((s) => params.servers!.split(",").includes(s.name))
    : allServers;
  return auditAll(filtered, params.configPath ?? "auto-detected");
}

export async function mcpAuditScore(params: { serverName: string; configPath?: string }) {
  const allServers = parseAllMCPConfigs(params.configPath);
  const server = allServers.find((s) => s.name === params.serverName);
  if (!server) throw new Error(`Server "${params.serverName}" not found in MCP configs`);
  return scoreServer(server);
}
