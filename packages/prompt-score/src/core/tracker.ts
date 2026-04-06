import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { PromptTrackEntry, PromptTrackStore } from "./types.js";

const STORE_DIR = path.join(os.homedir(), ".maiife");
const STORE_PATH = path.join(STORE_DIR, "prompt-scores.json");

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
}

export function loadTrackStore(): PromptTrackStore {
  try { return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")); }
  catch { return { entries: [], createdAt: new Date().toISOString() }; }
}

export function saveTrackStore(store: PromptTrackStore): void {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function trackScore(entry: Omit<PromptTrackEntry, "timestamp">): void {
  const store = loadTrackStore();
  store.entries.push({ ...entry, timestamp: new Date().toISOString() });
  saveTrackStore(store);
}

export function getScoreTrend(project?: string, days: number = 30): PromptTrackEntry[] {
  const store = loadTrackStore();
  const since = new Date();
  since.setDate(since.getDate() - days);
  return store.entries
    .filter((e) => new Date(e.timestamp) >= since)
    .filter((e) => !project || e.project === project);
}
