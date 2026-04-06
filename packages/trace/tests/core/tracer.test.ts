import { describe, it, expect } from "vitest";
import { createTracer } from "../../src/core/tracer.js";

describe("createTracer", () => {
  it("creates a trace with spans", () => {
    const tracer = createTracer("test-agent");
    const trace = tracer.startTrace();
    const span1 = tracer.startSpan(trace.id, "fetch-data");
    tracer.endSpan(span1.id, "success");
    const span2 = tracer.startSpan(trace.id, "process-data");
    tracer.endSpan(span2.id, "success");
    tracer.endTrace(trace.id, "success");

    const result = tracer.getTrace(trace.id);
    expect(result).toBeTruthy();
    expect(result!.agent).toBe("test-agent");
    expect(result!.spans.length).toBe(2);
    expect(result!.status).toBe("success");
    expect(result!.spans[0].name).toBe("fetch-data");
    expect(result!.spans[1].name).toBe("process-data");
  });

  it("handles nested spans", () => {
    const tracer = createTracer("nested-agent");
    const trace = tracer.startTrace();
    const parent = tracer.startSpan(trace.id, "parent-step");
    const child = tracer.startSpan(trace.id, "child-step", parent.id);
    tracer.endSpan(child.id, "success");
    tracer.endSpan(parent.id, "success");
    tracer.endTrace(trace.id, "success");

    const result = tracer.getTrace(trace.id);
    expect(result!.spans[1].parentId).toBe(parent.id);
  });

  it("marks error spans", () => {
    const tracer = createTracer("error-agent");
    const trace = tracer.startTrace();
    const span = tracer.startSpan(trace.id, "failing-step");
    tracer.endSpan(span.id, "error", "Connection timeout");
    tracer.endTrace(trace.id, "error");

    const result = tracer.getTrace(trace.id);
    expect(result!.spans[0].status).toBe("error");
    expect(result!.spans[0].error).toBe("Connection timeout");
  });
});
