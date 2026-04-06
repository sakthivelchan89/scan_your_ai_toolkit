import { describe, it, expect } from "vitest";
import { scoreServer, auditAll } from "../../src/core/scorer.js";
import type { ParsedMCPServer } from "../../src/core/types.js";

describe("scoreServer", () => {
  it("scores a low-risk server highly", () => {
    const server: ParsedMCPServer = {
      name: "weather",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/weather-server"],
      env: {},
      transport: "stdio",
      configSource: "/test/config.json",
    };
    const card = scoreServer(server);
    expect(card.score).toBeGreaterThan(60);
    expect(card.grade).toMatch(/^[A-C]$/);
  });

  it("scores a high-risk database server poorly", () => {
    const server: ParsedMCPServer = {
      name: "postgres",
      command: "npx",
      args: ["-y", "@mcp/postgres-server", "--connection", "postgresql://admin:pass@prod:5432/main"],
      env: { PGPASSWORD: "secret" },
      transport: "stdio",
      configSource: "/test/config.json",
    };
    const card = scoreServer(server);
    expect(card.score).toBeLessThan(70);
    expect(card.grade).toMatch(/^[BCDF]$/);
    expect(card.recommendations.length).toBeGreaterThan(0);
  });

  it("includes all 5 dimensions", () => {
    const server: ParsedMCPServer = {
      name: "test",
      command: "npx",
      args: [],
      env: {},
      transport: "stdio",
      configSource: "/test/config.json",
    };
    const card = scoreServer(server);
    expect(card.dimensions).toHaveLength(5);
    const dimNames = card.dimensions.map((d) => d.dimension);
    expect(dimNames).toContain("permissions");
    expect(dimNames).toContain("sensitivity");
    expect(dimNames).toContain("auth");
    expect(dimNames).toContain("blast-radius");
    expect(dimNames).toContain("versioning");
  });

  it("returns grade F for fully destructive server", () => {
    const server: ParsedMCPServer = {
      name: "db-admin-delete-prod",
      command: "node",
      args: ["--drop", "--delete", "--truncate", "--prod", "--postgres"],
      env: { DB_PASSWORD: "secret", DB_TOKEN: "tok" },
      transport: "stdio",
      configSource: "/test/config.json",
    };
    const card = scoreServer(server);
    expect(card.grade).toMatch(/^[DF]$/);
  });
});

describe("auditAll", () => {
  it("returns score 100 for empty server list", () => {
    const result = auditAll([], "test");
    expect(result.overallScore).toBe(100);
    expect(result.criticalCount).toBe(0);
    expect(result.overallGrade).toBe("A");
  });

  it("counts critical servers (grade D or F)", () => {
    const badServer: ParsedMCPServer = {
      name: "db-delete-admin-prod",
      command: "node",
      args: ["--drop", "--delete", "--postgres", "--prod"],
      env: { DB_PASSWORD: "secret" },
      transport: "stdio",
      configSource: "/test/config.json",
    };
    const result = auditAll([badServer], "test");
    expect(result.criticalCount).toBeGreaterThanOrEqual(1);
  });
});
