import type { Trace, TraceAnalysis } from "./types.js";

export function analyzeTrace(trace: Trace): TraceAnalysis {
  const errorSpans = trace.spans.filter((s) => s.status === "error").map((s) => s.name);
  const completedSpans = trace.spans.filter((s) => s.durationMs != null);
  const slowest = completedSpans.length > 0
    ? completedSpans.reduce((max, s) => (s.durationMs! > (max.durationMs ?? 0) ? s : max))
    : null;

  const patterns: string[] = [];
  const nameCounts = new Map<string, number>();
  for (const span of trace.spans) nameCounts.set(span.name, (nameCounts.get(span.name) ?? 0) + 1);
  for (const [name, count] of nameCounts) {
    if (count >= 3) patterns.push(`Retry loop detected: "${name}" executed ${count} times`);
  }
  if (slowest && slowest.durationMs! > 5000) patterns.push(`Slow step: "${slowest.name}" took ${slowest.durationMs}ms`);
  if (errorSpans.length > trace.spans.length * 0.3 && trace.spans.length > 0) {
    patterns.push(`High error rate: ${errorSpans.length}/${trace.spans.length} spans failed`);
  }

  return {
    traceId: trace.id, totalSpans: trace.spans.length, totalDurationMs: trace.durationMs ?? 0,
    slowestSpan: slowest ? { name: slowest.name, durationMs: slowest.durationMs! } : null,
    errorSpans, patterns,
  };
}
