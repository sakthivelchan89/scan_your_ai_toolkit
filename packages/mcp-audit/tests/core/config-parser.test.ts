import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseAllMCPConfigs } from "../../src/core/config-parser.js";
import * as fs from "node:fs";

vi.mock("node:fs");

describe("MCP Config Parser", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("parses Claude Desktop config format", () => {
    const config = JSON.stringify({
      mcpServers: {
        github: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-github"],
          env: { GITHUB_TOKEN: "ghp_xxx" },
        },
      },
    });
    vi.spyOn(fs, "existsSync").mockImplementation((p) =>
      String(p).includes("AppData") && String(p).includes("claude_desktop_config.json")
    );
    vi.spyOn(fs, "readFileSync").mockReturnValue(config);
    const servers = parseAllMCPConfigs();
    expect(servers).toHaveLength(1);
    expect(servers[0].name).toBe("github");
    expect(servers[0].transport).toBe("stdio");
  });

  it("returns empty when no configs found", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    expect(parseAllMCPConfigs()).toHaveLength(0);
  });

  it("parses SSE transport when url is present", () => {
    const config = JSON.stringify({
      mcpServers: {
        remote: {
          url: "https://example.com/mcp",
          env: {},
        },
      },
    });
    vi.spyOn(fs, "existsSync").mockImplementation((p) => String(p).includes("claude_desktop_config.json"));
    vi.spyOn(fs, "readFileSync").mockReturnValue(config);
    const servers = parseAllMCPConfigs();
    expect(servers[0].transport).toBe("sse");
  });

  it("handles malformed JSON gracefully", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("{ not valid json }");
    expect(parseAllMCPConfigs()).toHaveLength(0);
  });

  it("parses a specific config path", () => {
    const config = JSON.stringify({
      mcpServers: {
        myserver: { command: "node", args: ["server.js"], env: {} },
      },
    });
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(config);
    const servers = parseAllMCPConfigs("/custom/path/mcp.json");
    expect(servers).toHaveLength(1);
    expect(servers[0].configSource).toBe("/custom/path/mcp.json");
  });
});
