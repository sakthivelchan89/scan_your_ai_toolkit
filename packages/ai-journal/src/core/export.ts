import { getEntries } from "./store.js";
import type { JournalEntry } from "./types.js";

function escapeCsv(val: string | number | undefined): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export journal entries as JSON or CSV.
 *
 * @param format  "json" or "csv"
 * @param since   Only include entries after this date (optional)
 * @returns       Formatted string ready to write to file or stdout
 */
export function exportEntries(format: "json" | "csv", since?: Date): string {
  const entries = getEntries(since);

  if (format === "json") {
    return JSON.stringify(entries, null, 2);
  }

  // CSV
  const header = "id,timestamp,tool,taskType,durationMinutes,project,session,notes";
  const rows = entries.map((e: JournalEntry & { project?: string; session?: string }) =>
    [
      escapeCsv(e.id),
      escapeCsv(e.timestamp),
      escapeCsv(e.tool),
      escapeCsv(e.taskType),
      escapeCsv(e.durationMinutes),
      escapeCsv(e.project),
      escapeCsv(e.session),
      escapeCsv(e.notes),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
