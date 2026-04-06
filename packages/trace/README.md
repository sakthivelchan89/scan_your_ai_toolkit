# @maiife-ai-pub/trace

Agent workflow tracer — trace, view, and analyze agent execution spans across tool calls and LLM steps.

Part of the [Maiife](https://maiife.ai) OSS toolkit for AI governance.

## Install

```bash
npm install @maiife-ai-pub/trace
```

Or use directly without installing:

```bash
npx @maiife-ai-pub/trace view trace.json
```

## CLI Usage

### View a trace file

```bash
npx @maiife-ai-pub/trace view trace.json
```

Example output:

```
Maiife Trace v0.1.0

Trace: customer-query-20260404-1432
  Duration: 4.2s   Spans: 7   Tokens: 1,847   Cost: $0.0041

  Span Timeline
    0ms    llm.call        gpt-4o          312ms   200 tokens
    312ms  tool.call       search_docs     891ms
    1203ms llm.call        gpt-4o          1102ms  618 tokens
    2305ms tool.call       send_reply      204ms
    2509ms llm.call        gpt-4o          891ms   917 tokens
    3400ms tool.call       log_interaction 81ms
    3481ms agent.complete  -               -

  Issues: none
```

### Watch a trace directory

```bash
npx @maiife-ai-pub/trace watch ./traces/
```

### Output formats

```bash
npx @maiife-ai-pub/trace view trace.json --format json
npx @maiife-ai-pub/trace view trace.json --format table
npx @maiife-ai-pub/trace view trace.json --format html > report.html
```

## MCP Server Usage

Add `@maiife-ai-pub/trace` as an MCP server so AI assistants can introspect execution traces.

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

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

### Cursor (`.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally)

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

Once configured, your AI assistant can call tools like `trace_view`, `trace_summarize`, and `trace_compare`.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-trace
```

## Programmatic API

```typescript
import { loadTrace, summarize } from "@maiife-ai-pub/trace";

const trace = await loadTrace("./traces/customer-query-20260404.json");
const summary = summarize(trace);

console.log(summary.totalDuration);  // ms
console.log(summary.totalTokens);    // number
console.log(summary.totalCost);      // USD
console.log(summary.spans);          // array of spans
```

### Types

```typescript
import type { Trace, Span, TraceSummary } from "@maiife-ai-pub/trace";
```

## Requirements

- Node.js >= 18

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Copyright 2026 Maiife — [maiife.ai](https://maiife.ai)
