import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { MCPServerFinding, Scanner, ScanConfig } from "../types.js";
import type { RiskLevel } from "@maiife-ai-pub/shared";

interface MCPServerEntry {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
}

interface MCPConfig {
  mcpServers?: Record<string, MCPServerEntry>;
}

function inferRisk(name: string, entry: MCPServerEntry): RiskLevel {
  const combined = [name, ...(entry.args ?? [])].join(" ").toLowerCase();
  if (/postgres|mysql|database|sqlite/.test(combined)) return "high";
  if (/filesystem|file/.test(combined)) return "medium";
  if (/github|git/.test(combined)) return "medium";
  return "low";
}

function inferPermissions(name: string, entry: MCPServerEntry): string[] {
  const combined = [name, ...(entry.args ?? [])].join(" ").toLowerCase();
  const perms = ["read"];
  if (/write|create|postgres/.test(combined)) perms.push("write");
  if (/admin|delete|drop/.test(combined)) perms.push("admin");
  return perms;
}

function getConfigPaths(home: string, projectPath: string): Array<{ file: string; source: string }> {
  const platform = os.platform();
  const paths: Array<{ file: string; source: string }> = [];

  // Claude Desktop
  if (platform === "win32") {
    const appData = process.env.APPDATA ?? path.join(home, "AppData", "Roaming");
    paths.push({
      file: path.join(appData, "Claude", "claude_desktop_config.json"),
      source: "claude-desktop",
    });
  } else if (platform === "darwin") {
    paths.push({
      file: path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      source: "claude-desktop",
    });
  } else {
    paths.push({
      file: path.join(home, ".config", "Claude", "claude_desktop_config.json"),
      source: "claude-desktop",
    });
  }

  // Cursor
  paths.push({
    file: path.join(home, ".cursor", "mcp.json"),
    source: "cursor",
  });

  // Project .mcp.json
  paths.push({
    file: path.join(projectPath, ".mcp.json"),
    source: "project",
  });

  return paths;
}

function parseConfig(file: string, source: string): MCPServerFinding[] {
  try {
    const raw = fs.readFileSync(file, "utf-8") as string;
    const config: MCPConfig = JSON.parse(raw);
    if (!config.mcpServers) return [];
    return Object.entries(config.mcpServers).map(([name, entry]) => ({
      name,
      transport: entry.url ? "sse" : "stdio",
      command: entry.command,
      args: entry.args,
      permissions: inferPermissions(name, entry),
      risk: inferRisk(name, entry),
      configSource: source,
    }));
  } catch {
    return [];
  }
}

export function createMCPScanner(): Scanner<MCPServerFinding> {
  return {
    name: "mcp",
    async scan(config: ScanConfig): Promise<MCPServerFinding[]> {
      const home = os.homedir();
      const configPaths = getConfigPaths(home, config.path);
      const findings: MCPServerFinding[] = [];

      for (const { file, source } of configPaths) {
        if (!fs.existsSync(file)) continue;
        findings.push(...parseConfig(file, source));
      }

      return findings;
    },
  };
}
