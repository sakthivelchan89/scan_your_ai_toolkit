import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ExtensionFinding, Scanner, ScanConfig } from "../types.js";

const AI_TERMS = [
  "github copilot", "copilot", "codeium", "tabnine", "claude", "chatgpt",
  "gemini", "amazon q", "continue", "cody", "supermaven", "cursor", "windsurf",
];

function matchesAITool(name: string): boolean {
  const lower = name.toLowerCase();
  return AI_TERMS.some((term) => lower.includes(term));
}

function readManifestJson(manifestPath: string): { name?: string; version?: string } | null {
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8") as string;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function compareVersionDirs(a: string, b: string): number {
  // Version dirs look like "1.245.0_0" — compare numeric segments
  const parseSegments = (s: string) =>
    s.replace(/_\d+$/, "").split(".").map(Number);
  const segsA = parseSegments(a);
  const segsB = parseSegments(b);
  for (let i = 0; i < Math.max(segsA.length, segsB.length); i++) {
    const diff = (segsA[i] ?? 0) - (segsB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function scanBrowserExtDir(
  extDir: string,
  host: ExtensionFinding["host"]
): ExtensionFinding[] {
  if (!fs.existsSync(extDir)) return [];
  const findings: ExtensionFinding[] = [];

  let extIds: string[];
  try {
    extIds = fs.readdirSync(extDir) as string[];
  } catch {
    return [];
  }

  for (const extId of extIds) {
    const extPath = path.join(extDir, extId);
    let versions: string[];
    try {
      versions = fs.readdirSync(extPath) as string[];
    } catch {
      continue;
    }

    const latestVersion = [...versions].sort(compareVersionDirs).at(-1);
    if (!latestVersion) continue;

    const manifestPath = path.join(extPath, latestVersion, "manifest.json");
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = readManifestJson(manifestPath);
    if (!manifest?.name || !matchesAITool(manifest.name)) continue;

    findings.push({
      name: manifest.name,
      version: manifest.version ?? "unknown",
      host,
      extensionId: extId,
      profilePath: extDir,
    });
  }

  return findings;
}

function findVsixManifests(dir: string, depth: number): string[] {
  if (depth === 0) return [];
  if (!fs.existsSync(dir)) return [];

  let entries: string[];
  try {
    entries = fs.readdirSync(dir) as string[];
  } catch {
    return [];
  }

  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (entry === "extension.vsixmanifest") {
      results.push(fullPath);
    } else {
      results.push(...findVsixManifests(fullPath, depth - 1));
    }
  }
  return results;
}

function parseVsixManifest(manifestPath: string): ExtensionFinding | null {
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8") as string;
    const nameMatch = raw.match(/<DisplayName[^>]*>([^<]+)<\/DisplayName>/);
    const idMatch = raw.match(/<Identity[^>]*Id="([^"]+)"/);
    const versionMatch = raw.match(/<Identity[^>]*Version="([^"]+)"/);
    if (!nameMatch) return null;
    const name = nameMatch[1].trim();
    if (!matchesAITool(name)) return null;
    return {
      name,
      version: versionMatch?.[1] ?? "unknown",
      host: "visual-studio",
      extensionId: idMatch?.[1] ?? "unknown",
      profilePath: path.dirname(manifestPath),
    };
  } catch {
    return null;
  }
}

function getBrowserDirs(
  home: string,
  platform: string
): Array<{ dir: string; host: ExtensionFinding["host"] }> {
  if (platform === "darwin") {
    const appSupport = path.join(home, "Library", "Application Support");
    return [
      { dir: path.join(appSupport, "Google", "Chrome", "Default", "Extensions"), host: "chrome" },
      { dir: path.join(appSupport, "Microsoft Edge", "Default", "Extensions"), host: "edge" },
      { dir: path.join(appSupport, "BraveSoftware", "Brave-Browser", "Default", "Extensions"), host: "brave" },
    ];
  }
  if (platform === "linux") {
    return [
      { dir: path.join(home, ".config", "google-chrome", "Default", "Extensions"), host: "chrome" },
      { dir: path.join(home, ".config", "microsoft-edge", "Default", "Extensions"), host: "edge" },
      { dir: path.join(home, ".config", "BraveSoftware", "Brave-Browser", "Default", "Extensions"), host: "brave" },
    ];
  }
  // win32
  const localAppData = process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local");
  return [
    { dir: path.join(localAppData, "Google", "Chrome", "User Data", "Default", "Extensions"), host: "chrome" },
    { dir: path.join(localAppData, "Microsoft", "Edge", "User Data", "Default", "Extensions"), host: "edge" },
    { dir: path.join(localAppData, "BraveSoftware", "Brave-Browser", "User Data", "Default", "Extensions"), host: "brave" },
  ];
}

export function createExtensionsScanner(): Scanner<ExtensionFinding> {
  return {
    name: "extensions",
    async scan(_config: ScanConfig): Promise<ExtensionFinding[]> {
      const home = os.homedir();
      const platform = os.platform();
      const findings: ExtensionFinding[] = [];

      for (const { dir, host } of getBrowserDirs(home, platform)) {
        findings.push(...scanBrowserExtDir(dir, host));
      }

      if (platform === "win32") {
        const localAppData = process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local");
        const vsRoot = path.join(localAppData, "Microsoft", "VisualStudio");
        const manifests = findVsixManifests(vsRoot, 6);
        for (const manifestPath of manifests) {
          const finding = parseVsixManifest(manifestPath);
          if (finding) findings.push(finding);
        }
      }

      return findings;
    },
  };
}
