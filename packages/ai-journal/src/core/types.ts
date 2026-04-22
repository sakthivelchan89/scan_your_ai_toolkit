export interface JournalEntry {
  id: string;
  timestamp: string;
  tool: string;
  taskType: string;
  durationMinutes?: number;
  project?: string;
  session?: string;
  notes?: string;
}

export interface JournalStore {
  entries: JournalEntry[];
  logging: boolean;
  createdAt: string;
}

export interface UsagePattern {
  tool: string;
  count: number;
  totalMinutes: number;
  percentage: number;
}

export interface Digest {
  period: string;
  startDate: string;
  endDate: string;
  totalEntries: number;
  totalMinutes: number;
  toolBreakdown: UsagePattern[];
  taskBreakdown: UsagePattern[];
  insights: string[];
  topTool: string;
  topTask: string;
}
