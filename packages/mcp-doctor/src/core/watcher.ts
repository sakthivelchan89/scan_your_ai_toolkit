import type { ParsedMCPServer } from "@maiife-ai-pub/mcp-audit";
import { checkServer } from "./checker.js";
import type { DoctorReport, ServerHealth } from "./types.js";

export interface WatchOptions {
  /** Poll interval in milliseconds. Default: 60000 (1 minute) */
  intervalMs?: number;
  /** Called on each poll with the latest report */
  onReport: (report: DoctorReport) => void;
  /** Called when a server status changes between polls */
  onStatusChange?: (serverName: string, prev: string, curr: string) => void;
}

/**
 * Watch MCP servers continuously, polling at `intervalMs`.
 * Returns a stop function to cancel the watch.
 *
 * @param servers  Parsed MCP server configs to monitor (from parseAllMCPConfigs())
 * @param options  Watch configuration
 *
 * @example
 * import { parseAllMCPConfigs } from '@maiife-ai-pub/mcp-audit';
 * import { watchServers } from '@maiife-ai-pub/mcp-doctor';
 *
 * const stop = watchServers(parseAllMCPConfigs(), {
 *   intervalMs: 30_000,
 *   onReport: (r) => console.log(exportDoctorReport(r)),
 *   onStatusChange: (name, prev, curr) => console.warn(`${name}: ${prev} → ${curr}`),
 * });
 */
export function watchServers(servers: ParsedMCPServer[], options: WatchOptions): () => void {
  const { intervalMs = 60_000, onReport, onStatusChange } = options;
  let prevStatuses = new Map<string, string>();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function poll() {
    if (stopped) return;
    try {
      const healths: ServerHealth[] = await Promise.all(servers.map((s) => checkServer(s)));
      const timestamp = new Date().toISOString();
      const report: DoctorReport = {
        timestamp,
        servers: healths,
        summary: {
          healthy: healths.filter((h) => h.status === "healthy").length,
          degraded: healths.filter((h) => h.status === "degraded").length,
          dead: healths.filter((h) => h.status === "dead").length,
          stale: healths.filter((h) => h.status === "stale").length,
          total: healths.length,
        },
      };

      if (onStatusChange) {
        for (const health of healths) {
          const prev = prevStatuses.get(health.name);
          if (prev && prev !== health.status) onStatusChange(health.name, prev, health.status);
        }
      }

      prevStatuses = new Map(healths.map((h) => [h.name, h.status]));
      onReport(report);
    } catch {
      // swallow errors — keep watching
    }

    if (!stopped) timer = setTimeout(poll, intervalMs);
  }

  void poll();
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}

/**
 * Export a DoctorReport as structured JSON.
 */
export function exportDoctorReport(report: DoctorReport): string {
  return JSON.stringify(report, null, 2);
}
