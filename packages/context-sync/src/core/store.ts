import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { ContextStore, ContextEntry } from "./types.js";

const STORE_DIR = path.join(os.homedir(), ".maiife");
const STORE_PATH = path.join(STORE_DIR, "context.json");

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

export function loadContext(): ContextStore {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  } catch {
    return { version: 1, entries: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
}

export function saveContext(store: ContextStore): void {
  ensureDir();
  store.updatedAt = new Date().toISOString();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function addEntry(params: { key: string; value: string; category: string }): void {
  const store = loadContext();
  const existing = store.entries.findIndex((e) => e.key === params.key);
  const entry: ContextEntry = {
    key: params.key,
    value: params.value,
    category: params.category,
    updatedAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    store.entries[existing] = entry;
  } else {
    store.entries.push(entry);
  }
  saveContext(store);
}

export function removeEntry(key: string): void {
  const store = loadContext();
  store.entries = store.entries.filter((e) => e.key !== key);
  saveContext(store);
}

export function getEntries(category?: string): ContextEntry[] {
  const store = loadContext();
  if (!category) return store.entries;
  return store.entries.filter((e) => e.category === category);
}
