import * as fs from "node:fs";
import * as childProcess from "node:child_process";
import type { ParsedMCPServer } from "@maiife-ai-pub/mcp-audit";
import type { ServerHealth, HealthCheck, HealthStatus } from "./types.js";

function checkCommandExists(command: string): HealthCheck {
  try {
    const whichCmd = process.platform === "win32" ? "where" : "which";
    childProcess.execSync(`${whichCmd} ${command}`, { stdio: "pipe" });
    return { name: "command_exists", passed: true, details: `${command} found in PATH` };
  } catch {
    return { name: "command_exists", passed: false, details: `${command} not found in PATH` };
  }
}

function checkNpxPackage(args: string[]): HealthCheck {
  const pkgArg = args.find((a) => a.startsWith("@") || (!a.startsWith("-") && a !== "-y"));
  if (!pkgArg) return { name: "npx_package", passed: true, details: "No package to verify" };
  try {
    childProcess.execSync(`npm view ${pkgArg} version`, { stdio: "pipe", timeout: 5000 });
    return { name: "npx_package", passed: true, details: `${pkgArg} available on npm` };
  } catch {
    return { name: "npx_package", passed: false, details: `${pkgArg} not found on npm` };
  }
}

function checkEnvVars(env: Record<string, string>): HealthCheck {
  const emptyVars = Object.entries(env)
    .filter(([_, val]) => !val || val.trim() === "")
    .map(([key]) => key);
  if (emptyVars.length === 0) {
    return { name: "env_vars", passed: true, details: "All env vars set" };
  }
  return { name: "env_vars", passed: false, details: `Empty/missing env vars: ${emptyVars.join(", ")}` };
}

function checkConfigPath(configSource: string): HealthCheck {
  if (fs.existsSync(configSource)) {
    return { name: "config_path", passed: true, details: `Config file exists: ${configSource}` };
  }
  return { name: "config_path", passed: false, details: `Config file missing: ${configSource}` };
}

function deriveStatus(checks: HealthCheck[]): HealthStatus {
  const failedCount = checks.filter((c) => !c.passed).length;
  if (failedCount === 0) return "healthy";
  const commandFailed = checks.some((c) => c.name === "command_exists" && !c.passed);
  if (commandFailed) return "dead";
  if (failedCount >= 2) return "dead";
  return "degraded";
}

function deriveSuggestions(server: ParsedMCPServer, checks: HealthCheck[]): string[] {
  const suggestions: string[] = [];
  for (const check of checks) {
    if (check.passed) continue;
    if (check.name === "command_exists") {
      suggestions.push(`Install ${server.command} or verify it's in your PATH`);
    }
    if (check.name === "npx_package") {
      suggestions.push(`Package may be renamed or unpublished — check npm registry`);
    }
    if (check.name === "env_vars") {
      const emptyVars = Object.entries(server.env)
        .filter(([_, v]) => !v || v.trim() === "")
        .map(([k]) => k);
      for (const v of emptyVars) {
        suggestions.push(`Set ${v} in your shell profile or MCP config env`);
      }
    }
    if (check.name === "config_path") {
      suggestions.push(`Config file missing — recreate or update path in your MCP client`);
    }
  }
  return suggestions;
}

export async function checkServer(server: ParsedMCPServer): Promise<ServerHealth> {
  const checks: HealthCheck[] = [];
  if (server.command) {
    checks.push(checkCommandExists(server.command));
    if (server.command === "npx" && server.args.length > 0) {
      checks.push(checkNpxPackage(server.args));
    }
  }
  if (Object.keys(server.env).length > 0) {
    checks.push(checkEnvVars(server.env));
  }
  checks.push(checkConfigPath(server.configSource));
  const status = deriveStatus(checks);
  const suggestions = deriveSuggestions(server, checks);
  return { name: server.name, status, checks, configSource: server.configSource, suggestions };
}
