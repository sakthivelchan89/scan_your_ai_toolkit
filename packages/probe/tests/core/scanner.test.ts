import { describe, it, expect, vi } from "vitest";
import { runScan } from "../../src/core/scanner.js";
import type { ScanConfig, Scanner, IDEFinding } from "../../src/core/types.js";

describe("runScan", () => {
  it("runs all registered scanners and merges results", async () => {
    const mockIDEScanner: Scanner<IDEFinding> = {
      name: "ide",
      scan: vi.fn().mockResolvedValue([
        { name: "cursor", version: "0.48.2", path: "/test", status: "active" },
      ]),
    };

    const config: ScanConfig = {
      scope: "full",
      categories: ["ide"],
      path: "/test",
      includeProjectDeps: false,
    };

    const result = await runScan(config, { ide: mockIDEScanner });

    expect(result.ide).toHaveLength(1);
    expect(result.ide[0].name).toBe("cursor");
    expect(mockIDEScanner.scan).toHaveBeenCalledWith(config);
  });

  it("skips scanners not in categories filter", async () => {
    const mockIDEScanner: Scanner<IDEFinding> = {
      name: "ide",
      scan: vi.fn().mockResolvedValue([]),
    };

    const config: ScanConfig = {
      scope: "category",
      categories: ["mcp"],
      path: "/test",
      includeProjectDeps: false,
    };

    const result = await runScan(config, { ide: mockIDEScanner });

    expect(result.ide).toHaveLength(0);
    expect(mockIDEScanner.scan).not.toHaveBeenCalled();
  });
});
