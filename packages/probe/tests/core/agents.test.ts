import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import { createAgentsScanner } from "../../src/core/scanners/agents.js";
import type { ScanConfig } from "../../src/core/types.js";

vi.mock("node:fs");

const config: ScanConfig = {
  scope: "full",
  categories: ["agents"],
  path: "/project",
  includeProjectDeps: true,
};

function normPath(p: unknown): string {
  return String(p).replace(/\\/g, "/");
}

describe("AgentsScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  it("detects langchain from package.json", async () => {
    const pkg = JSON.stringify({
      dependencies: {
        langchain: "^0.1.0",
        react: "^18.0.0",
      },
    });

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).endsWith("package.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(pkg as any);

    const scanner = createAgentsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe("langchain");
    expect(findings[0].language).toBe("javascript");
    expect(findings[0].version).toBe("^0.1.0");
  });

  it("detects crewai from requirements.txt", async () => {
    const req = "crewai==0.80.0\nrequests>=2.28.0\n";

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).endsWith("requirements.txt")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(req as any);

    const scanner = createAgentsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe("crewai");
    expect(findings[0].language).toBe("python");
    expect(findings[0].version).toBe("0.80.0");
  });

  it("detects multiple JS agent frameworks", async () => {
    const pkg = JSON.stringify({
      dependencies: {
        "@langchain/core": "^0.2.0",
        langgraph: "^0.0.20",
        express: "^4.18.0",
      },
    });

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).endsWith("package.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(pkg as any);

    const scanner = createAgentsScanner();
    const findings = await scanner.scan(config);

    const names = findings.map((f) => f.name);
    expect(names).toContain("@langchain/core");
    expect(names).toContain("langgraph");
    expect(names).not.toContain("express");
  });

  it("returns empty when no agent frameworks found", async () => {
    const pkg = JSON.stringify({ dependencies: { react: "^18.0.0" } });

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).endsWith("package.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(pkg as any);

    const scanner = createAgentsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(0);
  });
});
