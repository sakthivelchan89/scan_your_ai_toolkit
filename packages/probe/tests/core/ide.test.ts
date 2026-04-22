import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import { createIDEScanner } from "../../src/core/scanners/ide.js";
import type { ScanConfig } from "../../src/core/types.js";

vi.mock("node:fs");
vi.mock("node:os");

const config: ScanConfig = {
  scope: "full",
  categories: ["ide"],
  path: "/project",
  includeProjectDeps: true,
};

function hasVscode(p: unknown): boolean {
  return String(p).replace(/\\/g, "/").includes(".vscode/extensions");
}

function hasCursor(p: unknown): boolean {
  return String(p).replace(/\\/g, "/").includes(".cursor/extensions");
}

describe("IDEScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(os.platform).mockReturnValue("darwin");
  });

  it("detects github-copilot extension from VS Code", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => hasVscode(p));
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      if (hasVscode(p)) {
        return ["github.copilot-1.245.0", "ms-python.python-2023.1.0"] as any;
      }
      return [] as any;
    });

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe("github-copilot");
    expect(findings[0].version).toBe("1.245.0");
    expect(findings[0].status).toBe("active");
  });

  it("detects multiple known extensions and deduplicates", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => hasVscode(p) || hasCursor(p));
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      if (hasVscode(p)) {
        return ["github.copilot-1.245.0", "continue.continue-0.9.0"] as any;
      }
      if (hasCursor(p)) {
        return ["github.copilot-1.245.0"] as any;
      }
      return [] as any;
    });

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    const names = findings.map((f) => f.name);
    expect(names).toContain("github-copilot");
    expect(names).toContain("continue");
    expect(names.filter((n) => n === "github-copilot")).toHaveLength(1);
  });

  it("returns empty when no extension dirs exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(0);
  });

  it("maps all known extension prefixes", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => hasVscode(p));
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      if (hasVscode(p)) {
        return [
          "github.copilot-1.0.0",
          "continue.continue-0.9.0",
          "sourcegraph.cody-ai-1.2.3",
          "codeium.windsurf-2.0.0",
        ] as any;
      }
      return [] as any;
    });

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    const names = findings.map((f) => f.name);
    expect(names).toContain("github-copilot");
    expect(names).toContain("continue");
    expect(names).toContain("cody");
    expect(names).toContain("windsurf");
  });

  it("detects Cursor app on mac when app bundle exists", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      String(p).replace(/\\/g, "/").includes("Cursor.app/Contents/Resources/app/package.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: "0.44.0" }) as any);
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    expect(findings.some((f) => f.name === "cursor" && f.version === "0.44.0")).toBe(true);
  });

  it("detects Windsurf app on mac when app bundle exists", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      String(p).replace(/\\/g, "/").includes("Windsurf.app/Contents/Resources/app/package.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: "1.0.0" }) as any);
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    expect(findings.some((f) => f.name === "windsurf" && f.version === "1.0.0")).toBe(true);
  });

  it("detects Cursor app on windows when app bundle exists", async () => {
    vi.mocked(os.platform).mockReturnValue("win32");
    vi.mocked(fs.existsSync).mockImplementation((p) =>
      String(p).replace(/\\/g, "/").includes("Programs/cursor/resources/app/package.json")
    );
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: "0.44.0" }) as any);
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    expect(findings.some((f) => f.name === "cursor")).toBe(true);
  });

  it("does not duplicate Windsurf if already found via extensions", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      const np = String(p).replace(/\\/g, "/");
      if (np.includes(".cursor/extensions")) return ["codeium.windsurf-2.0.0"] as any;
      if (np.includes(".vscode/extensions")) return ["github.copilot-1.0.0"] as any;
      return [] as any;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: "2.0.0" }) as any);

    const scanner = createIDEScanner();
    const findings = await scanner.scan(config);

    expect(findings.filter((f) => f.name === "windsurf")).toHaveLength(1);
  });
});
