import * as fs from "node:fs";
import * as crypto from "node:crypto";
import type { Trace, Span } from "./types.js";

// OTLP/JSON format: https://opentelemetry.io/docs/specs/otlp/

interface OTLPAttribute {
  key: string;
  value: { stringValue?: string; intValue?: string; doubleValue?: number; boolValue?: boolean };
}

interface OTLPSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  status: { code: number; message?: string };
  attributes: OTLPAttribute[];
}

interface OTLPPayload {
  resourceSpans: Array<{
    resource: { attributes: OTLPAttribute[] };
    scopeSpans: Array<{
      scope: { name: string; version: string };
      spans: OTLPSpan[];
    }>;
  }>;
}

function toNano(iso: string): string {
  return String(new Date(iso).getTime() * 1_000_000);
}

function toHex(id: string, len: number): string {
  // Derive a deterministic hex ID from the string ID
  const hash = crypto.createHash("sha256").update(id).digest("hex");
  return hash.slice(0, len);
}

function attrsFromRecord(record: Record<string, unknown>): OTLPAttribute[] {
  return Object.entries(record).map(([key, value]) => {
    if (typeof value === "number") return { key, value: { doubleValue: value } };
    if (typeof value === "boolean") return { key, value: { boolValue: value } };
    return { key, value: { stringValue: String(value) } };
  });
}

function spanToOTLP(span: Span, traceHex: string): OTLPSpan {
  return {
    traceId: traceHex,
    spanId: toHex(span.id, 16),
    parentSpanId: span.parentId ? toHex(span.parentId, 16) : undefined,
    name: span.name,
    startTimeUnixNano: toNano(span.startTime),
    endTimeUnixNano: toNano(span.endTime ?? span.startTime),
    status: {
      code: span.status === "success" ? 1 : span.status === "error" ? 2 : 0,
      message: span.error,
    },
    attributes: attrsFromRecord(span.attributes),
  };
}

function tracesToOTLP(traces: Trace[], serviceName = "maiife-trace"): OTLPPayload {
  return {
    resourceSpans: traces.map((trace) => {
      const traceHex = toHex(trace.id, 32);
      return {
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: serviceName } },
            { key: "agent", value: { stringValue: trace.agent } },
          ],
        },
        scopeSpans: [{
          scope: { name: "maiife-trace", version: "0.1.0" },
          spans: trace.spans.map((s) => spanToOTLP(s, traceHex)),
        }],
      };
    }),
  };
}

/**
 * Export traces to an OTLP/JSON file (stdout if no path given).
 */
export function exportOTELFile(traces: Trace[], outputPath?: string): void {
  const payload = tracesToOTLP(traces);
  const json = JSON.stringify(payload, null, 2);
  if (outputPath) {
    fs.writeFileSync(outputPath, json, "utf-8");
  } else {
    process.stdout.write(json + "\n");
  }
}

/**
 * Export traces to an OTLP HTTP endpoint (e.g., Jaeger, Tempo, Honeycomb).
 * Set OTEL_EXPORTER_OTLP_ENDPOINT env var or pass endpoint directly.
 */
export async function exportOTELHttp(
  traces: Trace[],
  endpoint?: string,
  headers?: Record<string, string>,
): Promise<void> {
  const url = endpoint
    ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    ?? "http://localhost:4318/v1/traces";

  const extraHeaders: Record<string, string> = {};
  if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
    for (const pair of process.env.OTEL_EXPORTER_OTLP_HEADERS.split(",")) {
      const [k, v] = pair.split("=");
      if (k && v) extraHeaders[k.trim()] = v.trim();
    }
  }

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders, ...headers },
    body: JSON.stringify(tracesToOTLP(traces)),
  });
}
