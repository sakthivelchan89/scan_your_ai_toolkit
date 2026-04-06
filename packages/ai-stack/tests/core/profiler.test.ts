import { describe, it, expect } from "vitest";
import { buildProfile } from "../../src/core/profiler.js";
import type { ProbeResult } from "@maiife/probe";

describe("buildProfile", () => {
  it("builds a profile from probe scan results", () => {
    const scanResult: ProbeResult = {
      ide: [
        { name: "cursor", version: "0.48.2", path: "/test", status: "active" },
        { name: "github-copilot", version: "1.245.0", path: "/test", status: "active" },
      ],
      mcp: [
        { name: "github", transport: "stdio", command: "npx", args: [], permissions: ["read"], risk: "low", configSource: "/test" },
        { name: "postgres", transport: "stdio", command: "npx", args: [], permissions: ["read", "write", "admin"], risk: "high", configSource: "/test" },
      ],
      agents: [
        { name: "langchain", version: "0.3.14", project: "/test", language: "python" },
      ],
      keys: [
        { vendor: "openai", location: "/test/.env", variable: "OPENAI_API_KEY", managed: false },
        { vendor: "anthropic", location: "/test/.env", variable: "ANTHROPIC_API_KEY", managed: false },
      ],
      models: [
        { runtime: "ollama", port: 11434, models: ["llama3.2", "qwen3-8b"], status: "running" },
      ],
      deps: [
        { name: "ai", version: "^3.0.0", project: "/test", category: "vercel-ai-sdk" },
      ],
    };

    const profile = buildProfile(scanResult);

    expect(profile.stats.totalTools).toBe(9);
    expect(profile.stats.mcpServerCount).toBe(2);
    expect(profile.stats.agentFrameworkCount).toBe(1);
    expect(profile.stats.localModelCount).toBe(1);
    expect(profile.stats.apiKeyCount).toBe(2);
    expect(profile.categories.length).toBeGreaterThan(0);
    expect(profile.generatedAt).toBeTruthy();
  });

  it("handles empty scan result", () => {
    const empty: ProbeResult = { ide: [], mcp: [], agents: [], keys: [], models: [], deps: [] };
    const profile = buildProfile(empty);
    expect(profile.stats.totalTools).toBe(0);
    expect(profile.complexity.total).toBe(0);
    expect(profile.complexity.level).toBe("beginner");
  });
});
