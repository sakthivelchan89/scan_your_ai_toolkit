import type { Trace, Span } from "./types.js";
import { saveTrace } from "./store.js";

let counter = 0;
function genId(prefix: string): string { return `${prefix}_${Date.now()}_${++counter}`; }

const MAX_SPANS = 10000;

function evictOldestIfNeeded<K, V>(map: Map<K, V>): void {
  if (map.size >= MAX_SPANS) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
}

export interface Tracer {
  startTrace(metadata?: Record<string, unknown>): Trace;
  endTrace(traceId: string, status: "success" | "error"): void;
  startSpan(traceId: string, name: string, parentId?: string, attributes?: Record<string, unknown>): Span;
  endSpan(spanId: string, status: "success" | "error", error?: string): void;
  getTrace(traceId: string): Trace | undefined;
  listTraces(): Trace[];
}

export function createTracer(agent: string): Tracer {
  const traces = new Map<string, Trace>();
  const spanMap = new Map<string, { trace: Trace; span: Span }>();

  return {
    startTrace(metadata = {}): Trace {
      const trace: Trace = { id: genId("trace"), agent, startTime: new Date().toISOString(), status: "running", spans: [], metadata };
      evictOldestIfNeeded(traces);
      traces.set(trace.id, trace);
      return trace;
    },
    endTrace(traceId, status) {
      const trace = traces.get(traceId);
      if (!trace) return;
      trace.endTime = new Date().toISOString();
      trace.status = status;
      trace.durationMs = new Date(trace.endTime).getTime() - new Date(trace.startTime).getTime();
      try { saveTrace(trace); } catch { /* best-effort persistence */ }
    },
    startSpan(traceId, name, parentId, attributes = {}) {
      const trace = traces.get(traceId);
      if (!trace) throw new Error(`Trace ${traceId} not found`);
      const span: Span = { id: genId("span"), traceId, parentId, name, startTime: new Date().toISOString(), status: "running", attributes };
      trace.spans.push(span);
      evictOldestIfNeeded(spanMap);
      spanMap.set(span.id, { trace, span });
      return span;
    },
    endSpan(spanId, status, error) {
      const entry = spanMap.get(spanId);
      if (!entry) return;
      entry.span.endTime = new Date().toISOString();
      entry.span.status = status;
      entry.span.durationMs = new Date(entry.span.endTime).getTime() - new Date(entry.span.startTime).getTime();
      if (error) entry.span.error = error;
    },
    getTrace(traceId) { return traces.get(traceId); },
    listTraces() { return [...traces.values()]; },
  };
}
