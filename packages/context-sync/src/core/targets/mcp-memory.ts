import type { SyncTarget, ContextEntry, SyncResult } from "../types.js";

export function createMCPMemoryTarget(): SyncTarget {
  return {
    name: "mcp-memory",
    description: "Sync to an MCP memory server",
    async push(entries: ContextEntry[]): Promise<SyncResult> {
      return { target: "mcp-memory", success: false, entriesSynced: 0, error: "MCP memory sync not yet implemented" };
    },
    async pull(): Promise<ContextEntry[]> {
      return [];
    },
    async detect(): Promise<boolean> {
      return false;
    },
  };
}
