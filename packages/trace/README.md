# @maiife-ai-pub/trace

> Agent workflow tracer — trace, view, and analyze agent execution spans with OTLP export support.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/trace)](https://www.npmjs.com/package/@maiife-ai-pub/trace)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/trace
# or use as a library
npm install @maiife-ai-pub/trace
```

---

## CLI

```bash
# List recent traces
maiife-trace list

# List traces from last 7 days
maiife-trace list --days 7

# View a specific trace
maiife-trace view --id <traceId>

# Analyze traces for patterns
maiife-trace analyze
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-trace": {
      "command": "npx",
      "args": ["@maiife-ai-pub/trace", "mcp"]
    }
  }
}
```

**Available tools:** `trace_list`, `trace_view`, `trace_analyze`

---

## Programmatic API

```ts
import { createTracer, exportOTELFile } from "@maiife-ai-pub/trace";

const tracer = createTracer();

const id = tracer.startTrace("my-agent", "chat-completion");
tracer.addSpan(id, "llm-call", { model: "claude-sonnet-4-6", tokens: 1200 });
tracer.endTrace(id, "success");

// Export as OTLP/JSON for Jaeger, Grafana Tempo, etc.
exportOTELFile(tracer.getAll());
```

Traces are persisted to `~/.maiife/traces/` automatically on `endTrace`.

Set `OTEL_EXPORTER_OTLP_ENDPOINT` to push traces to an observability backend.

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
