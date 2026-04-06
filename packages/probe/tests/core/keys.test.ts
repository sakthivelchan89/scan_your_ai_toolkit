import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import { createKeysScanner } from "../../src/core/scanners/keys.js";
import type { ScanConfig } from "../../src/core/types.js";

vi.mock("node:fs");

const config: ScanConfig = {
  scope: "full",
  categories: ["keys"],
  path: "/project",
  includeProjectDeps: true,
};

function normPath(p: unknown): string {
  return String(p).replace(/\\/g, "/");
}

describe("KeysScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  it("detects OPENAI_API_KEY and ANTHROPIC_API_KEY in .env", async () => {
    const envContent = [
      "OPENAI_API_KEY=sk-abc123verylongfakekey",
      "ANTHROPIC_API_KEY=sk-ant-fakekey",
      "DATABASE_URL=postgres://localhost/db",
    ].join("\n");

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).endsWith("/.env")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(envContent as any);

    const scanner = createKeysScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(2);
    const vendors = findings.map((f) => f.vendor);
    expect(vendors).toContain("openai");
    expect(vendors).toContain("anthropic");
  });

  it("NEVER exposes actual key values", async () => {
    const envContent = "OPENAI_API_KEY=sk-supersecret-real-key-12345\n";

    vi.mocked(fs.existsSync).mockImplementation((p) =>
      normPath(p).endsWith("/.env")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(envContent as any);

    const scanner = createKeysScanner();
    const findings = await scanner.scan(config);

    const allText = JSON.stringify(findings);
    expect(allText).not.toContain("sk-supersecret-real-key-12345");
    expect(findings[0].variable).toBe("OPENAI_API_KEY");
    expect(findings[0].vendor).toBe("openai");
    expect(findings[0].managed).toBe(false);
  });

  it("detects keys across multiple env files", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const np = normPath(p);
      return np.endsWith("/.env") || np.endsWith("/.env.local");
    });
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const np = normPath(String(p));
      if (np.endsWith("/.env")) return "COHERE_API_KEY=co-fakekey\n" as any;
      if (np.endsWith("/.env.local")) return "GROQ_API_KEY=gsk_fakekey\n" as any;
      return "" as any;
    });

    const scanner = createKeysScanner();
    const findings = await scanner.scan(config);

    const vendors = findings.map((f) => f.vendor);
    expect(vendors).toContain("cohere");
    expect(vendors).toContain("groq");
  });

  it("returns empty when no env files exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const scanner = createKeysScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(0);
  });
});
