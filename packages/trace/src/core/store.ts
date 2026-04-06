import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { Trace } from "./types.js";

const STORE_DIR = path.join(os.homedir(), ".maiife", "traces");

function ensureDir() { if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true }); }

export function saveTrace(trace: Trace): void {
  validateTraceId(trace.id);
  ensureDir();
  fs.writeFileSync(path.join(STORE_DIR, `${trace.id}.json`), JSON.stringify(trace, null, 2), "utf-8");
}

const TRACE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
function validateTraceId(traceId: string): void {
  if (!TRACE_ID_PATTERN.test(traceId)) throw new Error(`Invalid traceId: must match /^[a-zA-Z0-9_-]+$/`);
}

export function loadTrace(traceId: string): Trace | undefined {
  validateTraceId(traceId);
  const filePath = path.join(STORE_DIR, `${traceId}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return undefined; }
}

export function listStoredTraces(agent?: string, days: number = 7): Trace[] {
  ensureDir();
  const since = new Date(); since.setDate(since.getDate() - days);
  const files = fs.readdirSync(STORE_DIR).filter((f) => f.endsWith(".json"));
  const traces: Trace[] = [];
  for (const file of files) {
    try {
      const trace: Trace = JSON.parse(fs.readFileSync(path.join(STORE_DIR, file), "utf-8"));
      if (new Date(trace.startTime) >= since && (!agent || trace.agent === agent)) traces.push(trace);
    } catch { /* skip */ }
  }
  return traces.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}
