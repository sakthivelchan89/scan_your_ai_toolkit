import { describe, it, expect } from "vitest";
import { computeComplexity } from "../../src/core/complexity.js";
import type { ProbeResult } from "@maiife/probe";

describe("computeComplexity", () => {
  it("scores a rich AI setup highly", () => {
    const rich: ProbeResult = {
      ide: [{ name: "cursor", version: "0.48.2", path: "/test", status: "active" }],
      mcp: [
        { name: "github", transport: "stdio", permissions: ["read"], risk: "low", configSource: "/test" },
        { name: "postgres", transport: "stdio", permissions: ["read", "write"], risk: "high", configSource: "/test" },
        { name: "slack", transport: "stdio", permissions: ["read"], risk: "low", configSource: "/test" },
      ],
      agents: [{ name: "langchain", version: "0.3.14", project: "/test", language: "python" }],
      keys: [{ vendor: "openai", location: "/test", variable: "OPENAI_API_KEY", managed: false }],
      models: [{ runtime: "ollama", port: 11434, models: ["llama3"], status: "running" }],
      deps: [
        { name: "ai", version: "^3.0", project: "/test", category: "vercel-ai-sdk" },
        { name: "openai", version: "^4.0", project: "/test", category: "openai-sdk" },
      ],
    };

    const score = computeComplexity(rich);
    expect(score.total).toBeGreaterThan(60);
    expect(score.level).toMatch(/^(advanced|expert)$/);
  });

  it("scores an empty setup as beginner", () => {
    const empty: ProbeResult = { ide: [], mcp: [], agents: [], keys: [], models: [], deps: [] };
    const score = computeComplexity(empty);
    expect(score.total).toBe(0);
    expect(score.level).toBe("beginner");
  });

  it("scores an IDE-only setup as beginner", () => {
    const basic: ProbeResult = {
      ide: [{ name: "copilot", version: "1.0", path: "/test", status: "active" }],
      mcp: [], agents: [], keys: [], models: [], deps: [],
    };
    const score = computeComplexity(basic);
    expect(score.total).toBeGreaterThan(0);
    expect(score.total).toBeLessThan(30);
    expect(score.level).toBe("beginner");
  });
});
