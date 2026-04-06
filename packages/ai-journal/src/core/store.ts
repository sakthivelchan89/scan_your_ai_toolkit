import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { JournalStore, JournalEntry } from "./types.js";

const STORE_DIR = path.join(os.homedir(), ".maiife");
const STORE_PATH = path.join(STORE_DIR, "ai-journal.json");

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

export function loadStore(): JournalStore {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  } catch {
    return { entries: [], logging: false, createdAt: new Date().toISOString() };
  }
}

export function saveStore(store: JournalStore): void {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function addEntry(entry: JournalEntry): void {
  const store = loadStore();
  store.entries.push(entry);
  saveStore(store);
}

export function getEntries(since?: Date): JournalEntry[] {
  const store = loadStore();
  if (!since) return store.entries;
  return store.entries.filter((e) => new Date(e.timestamp) >= since);
}

export function setLogging(enabled: boolean): void {
  const store = loadStore();
  store.logging = enabled;
  saveStore(store);
}

export function isLogging(): boolean {
  return loadStore().logging;
}
