import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { SyncTarget, ContextEntry, SyncResult } from "../types.js";

// Local backing store: ~/.maiife/memory.json
// Format matches @modelcontextprotocol/server-memory entity structure for compatibility.
const MEMORY_DIR = path.join(os.homedir(), ".maiife");
const MEMORY_PATH = path.join(MEMORY_DIR, "memory.json");

interface MemoryEntity {
  name: string;
  entityType: string;
  observations: string[];
  category: string;
  updatedAt: string;
}

interface MemoryStore {
  entities: MemoryEntity[];
}

function readStore(): MemoryStore {
  try {
    return JSON.parse(fs.readFileSync(MEMORY_PATH, "utf-8"));
  } catch {
    return { entities: [] };
  }
}

function writeStore(store: MemoryStore): void {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function entitiesToEntries(entities: MemoryEntity[]): ContextEntry[] {
  return entities.map((e) => ({
    key: e.name,
    value: e.observations[0] ?? "",
    category: e.category ?? "general",
    updatedAt: e.updatedAt ?? new Date().toISOString(),
  }));
}

// Optional: sync to HTTP MCP memory server if MCP_MEMORY_URL is set.
// Format: POST {url} with JSON-RPC 2.0 body { method: "tools/call", params: { name, arguments } }
async function pushToMCPServer(url: string, entries: ContextEntry[]): Promise<void> {
  try {
    const entities = entries.map((e) => ({
      name: e.key,
      entityType: "context",
      observations: [e.value],
    }));
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: { name: "create_entities", arguments: { entities } },
        id: Date.now(),
      }),
    });
  } catch {
    // best-effort — local store already written
  }
}

export function createMCPMemoryTarget(): SyncTarget {
  return {
    name: "mcp-memory",
    description: "Sync to local memory store (~/.maiife/memory.json), optionally also to a running MCP memory server via MCP_MEMORY_URL",

    async push(entries: ContextEntry[]): Promise<SyncResult> {
      try {
        const store = readStore();
        for (const entry of entries) {
          const existing = store.entities.findIndex((e) => e.name === entry.key);
          const entity: MemoryEntity = {
            name: entry.key,
            entityType: "context",
            observations: [entry.value],
            category: entry.category,
            updatedAt: new Date().toISOString(),
          };
          if (existing >= 0) {
            store.entities[existing] = entity;
          } else {
            store.entities.push(entity);
          }
        }
        writeStore(store);

        const mcpUrl = process.env.MCP_MEMORY_URL;
        if (mcpUrl) await pushToMCPServer(mcpUrl, entries);

        return { target: "mcp-memory", success: true, entriesSynced: entries.length };
      } catch (e) {
        return { target: "mcp-memory", success: false, entriesSynced: 0, error: (e as Error).message };
      }
    },

    async pull(): Promise<ContextEntry[]> {
      return entitiesToEntries(readStore().entities);
    },

    async detect(): Promise<boolean> {
      // File-based store is always available.
      return true;
    },
  };
}
