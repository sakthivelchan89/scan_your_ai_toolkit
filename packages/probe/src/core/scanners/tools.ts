import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ToolFinding, Scanner, ScanConfig } from "../types.js";

interface ToolDef {
  name: string;
  label: string;
  category: "desktop" | "cli";
  kind: "file" | "dir";
  /** Returns path of file or dir to check for existence */
  getDetectPath(platform: string, env: NodeJS.ProcessEnv, home: string): string;
  /** If set, detectPath is a file — read it for summary */
  summarize?(detectPath: string): ToolFinding["configSummary"];
}

const TOOLS: ToolDef[] = [
  {
    name: "claude-desktop",
    label: "Claude Desktop",
    category: "desktop",
    kind: "file",
    getDetectPath(platform, env, home) {
      if (platform === "win32") {
        if (!env.APPDATA) return "";
        return path.join(env.APPDATA, "Claude", "claude_desktop_config.json");
      }
      if (platform === "darwin") {
        return path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
      }
      return "";
    },
    summarize(configPath) {
      try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(raw);
        return { mcpCount: Object.keys(config.mcpServers ?? {}).length };
      } catch {
        return {};
      }
    },
  },
  {
    name: "claude-code",
    label: "Claude Code",
    category: "cli",
    kind: "file",
    getDetectPath(platform, env, home) {
      if (platform === "win32") {
        if (!env.USERPROFILE) return "";
        return path.join(env.USERPROFILE, ".claude", "settings.json");
      }
      return path.join(home, ".claude", "settings.json");
    },
    summarize(settingsPath) {
      try {
        const raw = fs.readFileSync(settingsPath, "utf-8");
        const settings = JSON.parse(raw);
        const hooks = settings.hooks ?? {};
        const hooksCount = Object.values(hooks).flat().length;
        const baseDir = path.dirname(settingsPath);
        const skillsDir = path.join(baseDir, "skills");
        const memoryDir = path.join(baseDir, "memory");
        const skillsCount = fs.existsSync(skillsDir)
          ? (fs.readdirSync(skillsDir) as string[]).length
          : 0;
        const memoryFiles = fs.existsSync(memoryDir)
          ? (fs.readdirSync(memoryDir) as string[]).length
          : 0;
        return { hooksCount, skillsCount, memoryFiles };
      } catch {
        return {};
      }
    },
  },
  {
    name: "chatgpt-desktop",
    label: "ChatGPT",
    category: "desktop",
    kind: "dir",
    getDetectPath(platform, env, home) {
      if (platform === "win32") {
        if (!env.APPDATA) return "";
        return path.join(env.APPDATA, "OpenAI", "ChatGPT");
      }
      if (platform === "darwin") {
        return path.join(home, "Library", "Application Support", "ChatGPT");
      }
      return "";
    },
  },
  {
    name: "gemini-cli",
    label: "Gemini CLI",
    category: "cli",
    kind: "dir",
    getDetectPath(platform, env, home) {
      if (platform === "win32") {
        if (!env.USERPROFILE) return "";
        return path.join(env.USERPROFILE, ".gemini");
      }
      return path.join(home, ".gemini");
    },
  },
  {
    name: "amazon-q",
    label: "Amazon Q",
    category: "cli",
    kind: "dir",
    getDetectPath(platform, env, home) {
      if (platform === "win32") {
        if (!env.USERPROFILE) return "";
        return path.join(env.USERPROFILE, ".aws", "amazonq");
      }
      return path.join(home, ".aws", "amazonq");
    },
  },
];

export function createToolsScanner(): Scanner<ToolFinding> {
  return {
    name: "tools",
    async scan(_config: ScanConfig): Promise<ToolFinding[]> {
      const platform = os.platform();
      const home = os.homedir();
      const env = process.env;
      const findings: ToolFinding[] = [];

      for (const tool of TOOLS) {
        const detectPath = tool.getDetectPath(platform, env, home);
        if (!fs.existsSync(detectPath)) continue;

        const configPath = tool.kind === "file" ? detectPath : undefined;
        const configSummary = tool.summarize ? tool.summarize(detectPath) : {};

        findings.push({
          name: tool.name,
          label: tool.label,
          category: tool.category,
          configPath,
          configSummary,
        });
      }

      return findings;
    },
  };
}
