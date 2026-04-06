import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadContext, saveContext, addEntry, getEntries, removeEntry } from "../../src/core/store.js";
import * as fs from "node:fs";

vi.mock("node:fs");

describe("Context Store", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty store when file doesn't exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const store = loadContext();
    expect(store.entries).toHaveLength(0);
    expect(store.version).toBe(1);
  });

  it("adds an entry and saves", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    vi.spyOn(fs, "mkdirSync").mockImplementation(() => undefined as any);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    addEntry({ key: "tech_stack", value: "TypeScript, React, Node.js", category: "technical" });

    expect(writeSpy).toHaveBeenCalled();
    const written = JSON.parse(writeSpy.mock.calls[0][1] as string);
    expect(written.entries).toHaveLength(1);
    expect(written.entries[0].key).toBe("tech_stack");
  });

  it("removes an entry by key", () => {
    const existing = JSON.stringify({
      version: 1,
      entries: [
        { key: "tech_stack", value: "TS", category: "technical", updatedAt: "2026-01-01" },
        { key: "style", value: "concise", category: "communication", updatedAt: "2026-01-01" },
      ],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(existing);
    vi.spyOn(fs, "mkdirSync").mockImplementation(() => undefined as any);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    removeEntry("tech_stack");

    const written = JSON.parse(writeSpy.mock.calls[0][1] as string);
    expect(written.entries).toHaveLength(1);
    expect(written.entries[0].key).toBe("style");
  });
});
