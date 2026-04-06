import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentFinding, Scanner, ScanConfig } from "../types.js";

const JS_AGENT_PACKAGES = new Set([
  "langchain",
  "@langchain/core",
  "langgraph",
  "autogen",
  "semantic-kernel",
]);

const PYTHON_AGENT_PACKAGES = new Set([
  "langchain",
  "langgraph",
  "crewai",
  "autogen",
  "haystack",
]);

function parseRequirements(content: string): Array<{ name: string; version: string }> {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .flatMap((line) => {
      const match = line.match(/^([a-zA-Z0-9@/_-]+[a-zA-Z0-9])==(.+)$/);
      if (match) return [{ name: match[1], version: match[2] }];
      const nameOnly = line.match(/^([a-zA-Z0-9@/_-]+[a-zA-Z0-9])/);
      if (nameOnly) return [{ name: nameOnly[1], version: "unknown" }];
      return [];
    });
}

export function createAgentsScanner(): Scanner<AgentFinding> {
  return {
    name: "agents",
    async scan(config: ScanConfig): Promise<AgentFinding[]> {
      const findings: AgentFinding[] = [];
      const pkgPath = path.join(config.path, "package.json");
      const reqPath = path.join(config.path, "requirements.txt");

      // JS: package.json
      if (fs.existsSync(pkgPath)) {
        try {
          const raw = fs.readFileSync(pkgPath, "utf-8") as string;
          const pkg = JSON.parse(raw);
          const allDeps = {
            ...(pkg.dependencies ?? {}),
            ...(pkg.devDependencies ?? {}),
          };
          for (const [name, version] of Object.entries(allDeps)) {
            if (JS_AGENT_PACKAGES.has(name)) {
              findings.push({
                name,
                version: String(version),
                project: config.path,
                language: "javascript",
              });
            }
          }
        } catch {
          // ignore parse errors
        }
      }

      // Python: requirements.txt
      if (fs.existsSync(reqPath)) {
        try {
          const raw = fs.readFileSync(reqPath, "utf-8") as string;
          const deps = parseRequirements(raw);
          for (const { name, version } of deps) {
            if (PYTHON_AGENT_PACKAGES.has(name)) {
              findings.push({
                name,
                version,
                project: config.path,
                language: "python",
              });
            }
          }
        } catch {
          // ignore parse errors
        }
      }

      return findings;
    },
  };
}
