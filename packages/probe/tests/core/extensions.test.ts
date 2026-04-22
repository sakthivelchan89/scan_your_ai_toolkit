import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createExtensionsScanner } from "../../src/core/scanners/extensions.js";
import type { ScanConfig } from "../../src/core/types.js";

vi.mock("node:fs");
vi.mock("node:os");

const config: ScanConfig = {
  scope: "full",
  categories: ["extensions"],
  path: "/project",
  includeProjectDeps: true,
};

function normPath(p: unknown): string {
  return String(p).replace(/\\/g, "/");
}

const COPILOT_MANIFEST = JSON.stringify({
  name: "GitHub Copilot",
  version: "1.245.0",
});

const RANDOM_MANIFEST = JSON.stringify({
  name: "Better Comments",
  version: "3.0.0",
});

describe("ExtensionsScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(os.platform).mockReturnValue("darwin");
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.stubEnv("LOCALAPPDATA", "/home/user/AppData/Local");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects GitHub Copilot extension in Chrome on mac", async () => {
    const extDir = "/home/user/Library/Application Support/Google/Chrome/Default/Extensions";
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const np = normPath(p);
      return np.startsWith(normPath(extDir));
    });
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      const np = normPath(p);
      if (np === normPath(extDir)) return ["abc123extid"] as any;
      if (np.includes("abc123extid")) return ["1.245.0_0"] as any;
      return [] as any;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(COPILOT_MANIFEST as any);

    const scanner = createExtensionsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe("GitHub Copilot");
    expect(findings[0].version).toBe("1.245.0");
    expect(findings[0].host).toBe("chrome");
    expect(findings[0].extensionId).toBe("abc123extid");
  });

  it("ignores non-AI extensions", async () => {
    const extDir = "/home/user/Library/Application Support/Google/Chrome/Default/Extensions";
    vi.mocked(fs.existsSync).mockImplementation((p) => normPath(p).startsWith(normPath(extDir)));
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      const np = normPath(p);
      if (np === normPath(extDir)) return ["randomextid"] as any;
      if (np.includes("randomextid")) return ["3.0.0_0"] as any;
      return [] as any;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(RANDOM_MANIFEST as any);

    const scanner = createExtensionsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(0);
  });

  it("detects extensions across multiple browsers", async () => {
    const chromeDir = "/home/user/Library/Application Support/Google/Chrome/Default/Extensions";
    const edgeDir = "/home/user/Library/Application Support/Microsoft Edge/Default/Extensions";

    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const np = normPath(p);
      return np.startsWith(normPath(chromeDir)) || np.startsWith(normPath(edgeDir));
    });
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      const np = normPath(p);
      if (np === normPath(chromeDir) || np === normPath(edgeDir)) return ["extid1"] as any;
      if (np.includes("extid1")) return ["1.0.0_0"] as any;
      return [] as any;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: "Claude", version: "0.1.0" }) as any
    );

    const scanner = createExtensionsScanner();
    const findings = await scanner.scan(config);

    const hosts = findings.map((f) => f.host);
    expect(hosts).toContain("chrome");
    expect(hosts).toContain("edge");
  });

  it("detects VS extension by DisplayName match in vsixmanifest on windows", async () => {
    vi.mocked(os.platform).mockReturnValue("win32");
    const vsDir = "/home/user/AppData/Local/Microsoft/VisualStudio";
    const extDir = path.join(vsDir, "17.0_abc", "Extensions", "Microsoft", "GHCopilot", "1.0");
    const manifestPath = path.join(extDir, "extension.vsixmanifest");

    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const np = normPath(p);
      // Return true for paths that are part of the VS directory tree or the manifest file
      return np.startsWith(normPath(vsDir));
    });
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      const np = normPath(p);
      if (np === normPath(vsDir)) return ["17.0_abc"] as any;
      if (np === normPath(path.join(vsDir, "17.0_abc"))) return ["Extensions"] as any;
      if (np === normPath(path.join(vsDir, "17.0_abc", "Extensions"))) return ["Microsoft"] as any;
      if (np === normPath(path.join(vsDir, "17.0_abc", "Extensions", "Microsoft"))) return ["GHCopilot"] as any;
      if (np === normPath(path.join(vsDir, "17.0_abc", "Extensions", "Microsoft", "GHCopilot"))) return ["1.0"] as any;
      if (np === normPath(path.join(vsDir, "17.0_abc", "Extensions", "Microsoft", "GHCopilot", "1.0"))) return ["extension.vsixmanifest"] as any;
      return [] as any;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(
      `<?xml version="1.0"?><PackageManifest><Metadata><Identity Id="GitHub.Copilot" Version="1.0.0"/><DisplayName>GitHub Copilot</DisplayName></Metadata></PackageManifest>` as any
    );

    const scanner = createExtensionsScanner();
    const findings = await scanner.scan(config);

    const vs = findings.find((f) => f.host === "visual-studio");
    expect(vs).toBeDefined();
    expect(vs!.name).toBe("GitHub Copilot");
  });

  it("returns empty when no browser dirs exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const scanner = createExtensionsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(0);
  });

  it("matches case-insensitively — 'codeium' matches 'Codeium Windsurf Extension'", async () => {
    const extDir = "/home/user/Library/Application Support/Google/Chrome/Default/Extensions";
    vi.mocked(fs.existsSync).mockImplementation((p) => normPath(p).startsWith(normPath(extDir)));
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      const np = normPath(p);
      if (np === normPath(extDir)) return ["extid2"] as any;
      if (np.includes("extid2")) return ["2.0.0_0"] as any;
      return [] as any;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: "Codeium Windsurf Extension", version: "2.0.0" }) as any
    );

    const scanner = createExtensionsScanner();
    const findings = await scanner.scan(config);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe("Codeium Windsurf Extension");
  });
});
