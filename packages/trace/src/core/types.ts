export interface Span {
  id: string; traceId: string; parentId?: string; name: string;
  startTime: string; endTime?: string; durationMs?: number;
  status: "running" | "success" | "error"; attributes: Record<string, unknown>; error?: string;
}

export interface Trace {
  id: string; agent: string; startTime: string; endTime?: string; durationMs?: number;
  status: "running" | "success" | "error"; spans: Span[]; metadata: Record<string, unknown>;
}

export interface TraceAnalysis {
  traceId: string; totalSpans: number; totalDurationMs: number;
  slowestSpan: { name: string; durationMs: number } | null;
  errorSpans: string[]; patterns: string[];
}
