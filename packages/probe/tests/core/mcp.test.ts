import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import { createMCPScanner } from "../../src/core/scanners/mcp.js";
import type { ScanConfig } from "../../src/core/types.js";

vi.mock("node:fs");
vi.mock("node:os");

const config: ScanConfig = {
  scope: "full",
  categories: ["mcp"],
  path: "/project",
  includeProjectDeps: true,
};

function normPath(p: unknown): string {
  return String(p).replace(/\\/g, "/");
}

const claudeConfig = JSON.stringify({
  mcpServers: {
    "postgres-db": {
      command: "npx",
      args: ["@modelcontextprotocol/server-postgres"],
    },
    "github-mcp": {
      command: "npx",
      args: ["@modelcontextprotocol/server-github"],
    },
  },
});

describe("MCPScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(os.platform).mockReturnValue("linux");
    vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  it("parses Claude Desktop config and infers risk/transport", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).includes("claude_desktop_config.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(claudeConfig as any);

    const scanner = createMCPScanner();
    const findings = await scanner.scan(config);

    expect(findings.length).toBeGreaterThanOrEqual(2);

    const pg = findings.find((f) => f.name === "postgres-db");
    expect(pg).toBeDefined();
    expect(pg!.transport).toBe("stdio");
    expect(pg!.risk).toBe("high");
    expect(pg!.permissions).toContain("read");
    expect(pg!.permissions).toContain("write");

    const gh = findings.find((f) => f.name === "github-mcp");
    expect(gh!.risk).toBe("medium");
  });

  it("infers sse transport when url is present", async () => {
    const sseConfig = JSON.stringify({
      mcpServers: {
        "remote-server": {
          url: "https://mcp.example.com",
        },
      },
    });

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).includes("claude_desktop_config.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(sseConfig as any);

    const scanner = createMCPScanner();
    const findings = await scanner.scan(config);

    expect(findings[0].transport).toBe("sse");
  });

  it("returns empty when no config files exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const scanner = createMCPScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(0);
  });

  it("parses project .mcp.json", async () => {
    const projectMcp = JSON.stringify({
      mcpServers: {
        "file-server": {
          command: "node",
          args: ["filesystem-server.js"],
        },
      },
    });

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).endsWith(".mcp.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(projectMcp as any);

    const scanner = createMCPScanner();
    const findings = await scanner.scan(config);

    expect(findings[0].name).toBe("file-server");
    expect(findings[0].risk).toBe("medium");
  });
});
