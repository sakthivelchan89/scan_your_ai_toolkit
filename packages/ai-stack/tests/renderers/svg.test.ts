import { describe, it, expect } from "vitest";
import { renderSVG } from "../../src/renderers/svg.js";
import type { AIStackProfile } from "../../src/core/types.js";

const mockProfile: AIStackProfile = {
  generatedAt: "2026-04-04T10:00:00Z",
  categories: [
    { name: "Coding", emoji: "💻", items: [{ name: "Cursor", type: "ide" }, { name: "Copilot", type: "ide" }] },
    { name: "MCP Servers", emoji: "🔌", items: [{ name: "github", type: "mcp" }, { name: "postgres", type: "mcp" }] },
  ],
  complexity: {
    total: 65,
    breakdown: { toolDiversity: 15, mcpServers: 20, agentUsage: 15, sdkBreadth: 15 },
    level: "advanced",
  },
  stats: { totalTools: 6, mcpServerCount: 2, agentFrameworkCount: 1, localModelCount: 0, apiKeyCount: 1 },
};

describe("renderSVG", () => {
  it("produces valid SVG with profile data", () => {
    const svg = renderSVG(mockProfile);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("My AI Stack");
    expect(svg).toContain("65");
    expect(svg).toContain("Cursor");
    expect(svg).toContain("maiife");
  });

  it("includes viewBox for 1200x630 social card", () => {
    const svg = renderSVG(mockProfile);
    expect(svg).toContain('viewBox="0 0 1200 630"');
  });
});
