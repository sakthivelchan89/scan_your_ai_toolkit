import { describe, it, expect, vi, beforeEach } from "vitest";
import { pushAll, getStatus } from "../../src/core/sync.js";
import * as store from "../../src/core/store.js";
import type { ContextEntry, SyncTarget } from "../../src/core/types.js";

vi.mock("../../src/core/store.js");

describe("Sync Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("pushes entries to all available targets", async () => {
    const entries: ContextEntry[] = [
      { key: "stack", value: "TypeScript", category: "technical", updatedAt: "2026-01-01" },
    ];
    vi.spyOn(store, "getEntries").mockReturnValue(entries);

    const mockTarget: SyncTarget = {
      name: "cursorrules",
      description: "test",
      push: vi.fn().mockResolvedValue({ target: "cursorrules", success: true, entriesSynced: 1 }),
      pull: vi.fn().mockResolvedValue([]),
      detect: vi.fn().mockResolvedValue(true),
    };

    const results = await pushAll([mockTarget]);
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(mockTarget.push).toHaveBeenCalledWith(entries);
  });

  it("skips unavailable targets", async () => {
    vi.spyOn(store, "getEntries").mockReturnValue([]);

    const unavailableTarget: SyncTarget = {
      name: "mcp-memory",
      description: "test",
      push: vi.fn(),
      pull: vi.fn(),
      detect: vi.fn().mockResolvedValue(false),
    };

    const results = await pushAll([unavailableTarget]);
    expect(results).toHaveLength(0);
    expect(unavailableTarget.push).not.toHaveBeenCalled();
  });
});
