import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { CraftStore, PlayerProfile } from "./types.js";

const STORE_DIR = path.join(os.homedir(), ".maiife");
const STORE_PATH = path.join(STORE_DIR, "prompt-craft.json");

function defaultProfile(): PlayerProfile {
  return { level: 1, xp: 0, streak: 0, totalScored: 0, avgScore: 0, badges: [], scoreHistory: [] };
}

function ensureDir() { if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true }); }

export function loadCraftStore(): CraftStore {
  try { return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")); }
  catch { return { profile: defaultProfile(), createdAt: new Date().toISOString() }; }
}

export function saveCraftStore(store: CraftStore): void {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}
