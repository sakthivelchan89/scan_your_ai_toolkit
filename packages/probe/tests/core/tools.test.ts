import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import { createToolsScanner } from "../../src/core/scanners/tools.js";
import type { ScanConfig } from "../../src/core/types.js";

vi.mock("node:fs");
vi.mock("node:os");

const config: ScanConfig = {
  scope: "full",
  categories: ["tools"],
  path: "/project",
  includeProjectDeps: true,
};

function normPath(p: unknown): string {
  return String(p).replace(/\\/g, "/");
}

describe("ToolsScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(os.platform).mockReturnValue("darwin");
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.stubEnv("APPDATA", "/home/user/AppData/Roaming");
    vi.stubEnv("USERPROFILE", "/home/user");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects Claude Desktop on mac when config file exists", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).includes("Application Support/Claude/claude_desktop_config.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ mcpServers: { fs: {}, github: {} } }) as any
    );

    const scanner = createToolsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe("claude-desktop");
    expect(findings[0].label).toBe("Claude Desktop");
    expect(findings[0].category).toBe("desktop");
    expect(findings[0].configSummary.mcpCount).toBe(2);
  });

  it("detects Claude Code on mac when settings.json exists", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const np = normPath(p);
      return np.includes(".claude/settings.json") || np.includes(".claude/skills") || np.includes(".claude/memory");
    });
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if (normPath(p).includes("settings.json")) {
        return JSON.stringify({ hooks: { PreToolUse: ["cmd1", "cmd2"], PostToolUse: ["cmd3"] } }) as any;
      }
      return "" as any;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      if (normPath(p).includes("skills")) return ["skill1", "skill2"] as any;
      if (normPath(p).includes("memory")) return ["mem1.md"] as any;
      return [] as any;
    });

    const scanner = createToolsScanner();
    const findings = await scanner.scan(config);

    const claudeCode = findings.find((f) => f.name === "claude-code");
    expect(claudeCode).toBeDefined();
    expect(claudeCode!.configSummary.hooksCount).toBe(3);
    expect(claudeCode!.configSummary.skillsCount).toBe(2);
    expect(claudeCode!.configSummary.memoryFiles).toBe(1);
  });

  it("detects Claude Desktop on windows when config file exists", async () => {
    vi.mocked(os.platform).mockReturnValue("win32");
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).includes("AppData/Roaming/Claude/claude_desktop_config.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ mcpServers: {} }) as any
    );

    const scanner = createToolsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe("claude-desktop");
    expect(findings[0].configSummary.mcpCount).toBe(0);
  });

  it("detects presence-only tools (no config reading)", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).includes(".gemini")
    );

    const scanner = createToolsScanner();
    const findings = await scanner.scan(config);

    const gemini = findings.find((f) => f.name === "gemini-cli");
    expect(gemini).toBeDefined();
    expect(gemini!.category).toBe("cli");
    expect(gemini!.configSummary).toEqual({});
  });

  it("returns empty when nothing found", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const scanner = createToolsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(0);
  });

  it("reports configPath for file-based detections", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).includes("Application Support/Claude/claude_desktop_config.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ mcpServers: {} }) as any);

    const scanner = createToolsScanner();
    const findings = await scanner.scan(config);

    expect(findings[0].configPath).toContain("claude_desktop_config.json");
  });
});
