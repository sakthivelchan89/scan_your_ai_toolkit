export interface ContextEntry {
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export interface ContextStore {
  version: number;
  entries: ContextEntry[];
  createdAt: string;
  updatedAt: string;
}

export type SyncTargetName = "cursorrules" | "claude" | "mcp-memory";

export interface SyncTarget {
  name: SyncTargetName;
  description: string;
  push(entries: ContextEntry[]): Promise<SyncResult>;
  pull(): Promise<ContextEntry[]>;
  detect(): Promise<boolean>;
}

export interface SyncResult {
  target: string;
  success: boolean;
  entriesSynced: number;
  error?: string;
}

export interface SyncStatus {
  target: string;
  available: boolean;
  lastSync?: string;
  entriesInTarget: number;
}

export interface DiffResult {
  target: string;
  localOnly: string[];
  targetOnly: string[];
  diverged: string[];
}
