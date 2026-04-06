import { describe, it, expect, vi, beforeEach } from "vitest";
import { logInteraction } from "../../src/core/logger.js";
import * as store from "../../src/core/store.js";

vi.mock("../../src/core/store.js");

describe("logInteraction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a journal entry with correct fields", () => {
    const addSpy = vi.spyOn(store, "addEntry").mockImplementation(() => {});

    logInteraction({
      tool: "claude",
      taskType: "coding",
      durationMinutes: 30,
      notes: "Fixed a bug in auth flow",
    });

    expect(addSpy).toHaveBeenCalledTimes(1);
    const entry = addSpy.mock.calls[0][0];
    expect(entry.tool).toBe("claude");
    expect(entry.taskType).toBe("coding");
    expect(entry.durationMinutes).toBe(30);
    expect(entry.notes).toBe("Fixed a bug in auth flow");
    expect(entry.id).toBeTruthy();
    expect(entry.timestamp).toBeTruthy();
  });
});
