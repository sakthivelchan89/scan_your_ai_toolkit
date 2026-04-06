import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { ParsedMCPServer } from "./types.js";

interface RawMCPServerConfig {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
}

interface RawMCPConfigFile {
  mcpServers?: Record<string, RawMCPServerConfig>;
}

function parseConfigFile(filePath: string): ParsedMCPServer[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const config: RawMCPConfigFile = JSON.parse(raw);
    if (!config.mcpServers) return [];
    return Object.entries(config.mcpServers).map(([name, server]) => ({
      name,
      command: server.command,
      args: server.args ?? [],
      url: server.url,
      env: server.env ?? {},
      transport: server.url ? "sse" as const : "stdio" as const,
      configSource: filePath,
    }));
  } catch {
    return [];
  }
}

export function parseAllMCPConfigs(configPath?: string): ParsedMCPServer[] {
  if (configPath) return parseConfigFile(configPath);
  const home = os.homedir();
  const paths = [
    path.join(home, "AppData", "Roaming", "Claude", "claude_desktop_config.json"),
    path.join(home, ".config", "Claude", "claude_desktop_config.json"),
    path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
    path.join(home, ".cursor", "mcp.json"),
    path.join(process.cwd(), ".mcp.json"),
  ];
  const all: ParsedMCPServer[] = [];
  for (const p of paths) all.push(...parseConfigFile(p));
  return all;
}
