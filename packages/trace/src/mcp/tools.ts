import { listStoredTraces, loadTrace } from "../core/store.js";
import { analyzeTrace } from "../core/analyzer.js";

export async function traceList(params: { agent?: string; days?: number }) {
  const traces = listStoredTraces(params.agent, params.days ?? 7);
  return traces.map((t) => ({ id: t.id, agent: t.agent, status: t.status, startTime: t.startTime, durationMs: t.durationMs, spanCount: t.spans.length }));
}

export async function traceView(params: { id: string; format?: string }) {
  const traceResult = loadTrace(params.id);
  if (!traceResult) throw new Error(`Trace ${params.id} not found`);
  const trace = traceResult;
  if (params.format === "tree") {
    const lines: string[] = [`${trace.agent} (${trace.status}) ${trace.durationMs ?? "?"}ms`];
    const roots = trace.spans.filter((s) => !s.parentId);
    function renderSpan(span: typeof trace.spans[0], indent: number) {
      const icon = span.status === "success" ? "v" : span.status === "error" ? "x" : "...";
      lines.push(`${"  ".repeat(indent)}${icon} ${span.name} ${span.durationMs ?? "?"}ms${span.error ? ` -- ${span.error}` : ""}`);
      const children = trace.spans.filter((s) => s.parentId === span.id);
      for (const child of children) renderSpan(child, indent + 1);
    }
    for (const root of roots) renderSpan(root, 1);
    return lines.join("\n");
  }
  return trace;
}

export async function traceAnalyze(params: { agent?: string; days?: number }) {
  const traces = listStoredTraces(params.agent, params.days ?? 30);
  return traces.map(analyzeTrace);
}
