import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { IDEFinding, Scanner, ScanConfig } from "../types.js";

const EXTENSION_PREFIXES: Record<string, string> = {
  "github.copilot": "github-copilot",
  "continue.continue": "continue",
  "sourcegraph.cody-ai": "cody",
  "codeium.windsurf": "windsurf",
};

function getExtensionDirs(home: string): string[] {
  return [
    path.join(home, ".vscode", "extensions"),
    path.join(home, ".cursor", "extensions"),
    path.join(home, ".vscode-insiders", "extensions"),
  ];
}

function matchExtension(dirName: string): { name: string; version: string } | null {
  for (const [prefix, name] of Object.entries(EXTENSION_PREFIXES)) {
    if (dirName.startsWith(prefix + "-")) {
      const version = dirName.slice(prefix.length + 1);
      return { name, version };
    }
  }
  return null;
}

export function createIDEScanner(): Scanner<IDEFinding> {
  return {
    name: "ide",
    async scan(_config: ScanConfig): Promise<IDEFinding[]> {
      const home = os.homedir();
      const dirs = getExtensionDirs(home);
      const seen = new Set<string>();
      const findings: IDEFinding[] = [];

      for (const extDir of dirs) {
        if (!fs.existsSync(extDir)) continue;
        const entries = fs.readdirSync(extDir) as string[];
        for (const entry of entries) {
          const match = matchExtension(entry);
          if (!match) continue;
          if (seen.has(match.name)) continue;
          seen.add(match.name);
          findings.push({
            name: match.name,
            version: match.version,
            path: path.join(extDir, entry),
            status: "active",
          });
        }
      }

      return findings;
    },
  };
}
