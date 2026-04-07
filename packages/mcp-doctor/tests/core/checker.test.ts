import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkServer } from "../../src/core/checker.js";
import type { ParsedMCPServer } from "@maiife/mcp-audit";
import * as fs from "node:fs";
import * as childProcess from "node:child_process";

vi.mock("node:fs");
vi.mock("node:child_process");

describe("checkServer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("marks server as healthy when command and deps exist", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(childProcess, "execFileSync").mockReturnValue(Buffer.from("v20.0.0"));

    const server: ParsedMCPServer = {
      name: "weather",
      command: "node",
      args: ["server.js"],
      env: {},
      transport: "stdio",
      configSource: "/test/config.json",
    };

    const health = await checkServer(server);
    expect(health.status).toBe("healthy");
    expect(health.checks.every((c) => c.passed)).toBe(true);
  });

  it("marks server as dead when command binary is missing", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    vi.spyOn(childProcess, "execFileSync").mockImplementation(() => {
      throw new Error("not found");
    });

    const server: ParsedMCPServer = {
      name: "broken",
      command: "nonexistent-binary",
      args: [],
      env: {},
      transport: "stdio",
      configSource: "/test/config.json",
    };

    const health = await checkServer(server);
    expect(health.status).toBe("dead");
    expect(health.checks.some((c) => !c.passed)).toBe(true);
    expect(health.suggestions.length).toBeGreaterThan(0);
  });

  it("flags missing env vars as degraded", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(childProcess, "execFileSync").mockReturnValue(Buffer.from("ok"));

    const server: ParsedMCPServer = {
      name: "github",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_TOKEN: "" },
      transport: "stdio",
      configSource: "/test/config.json",
    };

    const health = await checkServer(server);
    expect(health.status).toMatch(/^(degraded|dead)$/);
    expect(health.suggestions.some((s) => s.includes("GITHUB_TOKEN"))).toBe(true);
  });
});
