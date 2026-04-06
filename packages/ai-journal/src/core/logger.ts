import { addEntry } from "./store.js";
import type { JournalEntry } from "./types.js";

let idCounter = 0;

function genId(): string {
  return `j_${Date.now()}_${++idCounter}`;
}

export function logInteraction(params: {
  tool: string;
  taskType: string;
  durationMinutes?: number;
  notes?: string;
}): JournalEntry {
  const entry: JournalEntry = {
    id: genId(),
    timestamp: new Date().toISOString(),
    tool: params.tool,
    taskType: params.taskType,
    durationMinutes: params.durationMinutes,
    notes: params.notes,
  };
  addEntry(entry);
  return entry;
}
