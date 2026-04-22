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

interface AppDef {
  name: string;
  winPath(localAppData: string): string;
  macPath(): string;
}

const APP_DEFS: AppDef[] = [
  {
    name: "cursor",
    winPath: (localAppData) =>
      path.join(localAppData, "Programs", "cursor", "resources", "app", "package.json"),
    macPath: () => "/Applications/Cursor.app/Contents/Resources/app/package.json",
  },
  {
    name: "windsurf",
    winPath: (localAppData) =>
      path.join(localAppData, "Programs", "windsurf", "resources", "app", "package.json"),
    macPath: () => "/Applications/Windsurf.app/Contents/Resources/app/package.json",
  },
];

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

function readAppVersion(pkgJsonPath: string): string {
  try {
    const raw = fs.readFileSync(pkgJsonPath, "utf-8") as string;
    const pkg = JSON.parse(raw);
    return typeof pkg.version === "string" ? pkg.version : "unknown";
  } catch {
    return "unknown";
  }
}

export function createIDEScanner(): Scanner<IDEFinding> {
  return {
    name: "ide",
    async scan(_config: ScanConfig): Promise<IDEFinding[]> {
      const home = os.homedir();
      const platform = os.platform();
      const localAppData = process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local");
      const dirs = getExtensionDirs(home);
      const seen = new Set<string>();
      const findings: IDEFinding[] = [];

      // Extension scan
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

      // App-level detection for Cursor + Windsurf
      for (const app of APP_DEFS) {
        if (seen.has(app.name)) continue;
        const pkgPath = platform === "win32"
          ? app.winPath(localAppData)
          : platform === "darwin"
          ? app.macPath()
          : null;
        if (pkgPath === null || !fs.existsSync(pkgPath)) continue;
        seen.add(app.name);
        findings.push({
          name: app.name,
          version: readAppVersion(pkgPath),
          path: path.dirname(path.dirname(path.dirname(pkgPath))), // install dir
          status: "active",
        });
      }

      return findings;
    },
  };
}
