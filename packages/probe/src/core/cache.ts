import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { ProbeResult } from "./types.js";

const CACHE_DIR = path.join(os.homedir(), ".maiife");
const CACHE_PATH = path.join(CACHE_DIR, "probe-cache.json");

interface CachedScan {
  timestamp: string;
  result: ProbeResult;
}

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export function saveCache(result: ProbeResult): void {
  ensureDir();
  const cache: CachedScan = { timestamp: new Date().toISOString(), result };
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

export function loadCache(): CachedScan | null {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")) as CachedScan;
  } catch {
    return null;
  }
}

export interface ProbeDiff {
  timestamp: string;
  previousScan: string | null;
  added: Partial<ProbeResult>;
  removed: Partial<ProbeResult>;
  unchanged: number;
}

function diffArrayByName<T extends { name: string }>(
  prev: T[], curr: T[]
): { added: T[]; removed: T[] } {
  const prevNames = new Set(prev.map((i) => i.name));
  const currNames = new Set(curr.map((i) => i.name));
  return {
    added: curr.filter((i) => !prevNames.has(i.name)),
    removed: prev.filter((i) => !currNames.has(i.name)),
  };
}

/**
 * Diff the current scan result against the cached previous scan.
 * Returns what was added and removed since last run.
 */
export function diffWithCache(current: ProbeResult): ProbeDiff {
  const cached = loadCache();
  if (!cached) {
    return {
      timestamp: new Date().toISOString(),
      previousScan: null,
      added: current,
      removed: {},
      unchanged: 0,
    };
  }

  const prev = cached.result;
  const ideDiff = diffArrayByName(prev.ide, current.ide);
  const mcpDiff = diffArrayByName(prev.mcp, current.mcp);
  const agentDiff = diffArrayByName(prev.agents, current.agents);
  const modelDiff = { added: current.models.filter((m) => !prev.models.some((p) => p.runtime === m.runtime)), removed: prev.models.filter((m) => !current.models.some((c) => c.runtime === m.runtime)) };

  const totalUnchanged =
    (current.ide.length - ideDiff.added.length) +
    (current.mcp.length - mcpDiff.added.length) +
    (current.agents.length - agentDiff.added.length);

  return {
    timestamp: new Date().toISOString(),
    previousScan: cached.timestamp,
    added: {
      ide: ideDiff.added,
      mcp: mcpDiff.added,
      agents: agentDiff.added,
      models: modelDiff.added,
    },
    removed: {
      ide: ideDiff.removed,
      mcp: mcpDiff.removed,
      agents: agentDiff.removed,
      models: modelDiff.removed,
    },
    unchanged: totalUnchanged,
  };
}
