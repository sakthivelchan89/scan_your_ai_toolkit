import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { traceList, traceView, traceAnalyze } from "./tools.js";

const server = new Server({ name: "@maiife/trace", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "trace_list",
      description: "List recent agent execution traces, optionally filtered by agent name and time range. Returns trace IDs, timestamps, step counts, and success/failure status.",
      inputSchema: {
        type: "object" as const,
        properties: {
          agent: { type: "string", description: "Filter to traces from a specific agent name" },
          days: { type: "number", description: "Look-back window in days", default: 7 },
        },
      },
    },
    {
      name: "trace_view",
      description: "Retrieve the full execution graph for a specific trace ID, showing each step with its inputs, outputs, latency, and token usage.",
      inputSchema: {
        type: "object" as const,
        properties: {
          id: { type: "string", description: "Trace ID to retrieve (from trace_list)" },
          format: {
            type: "string",
            enum: ["json", "tree"],
            description: "Output format: 'tree' renders an ASCII step graph, 'json' returns structured data",
            default: "tree",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "trace_analyze",
      description: "Analyze traces across a time window to surface patterns: most common failure steps, average latency per step type, token cost hot-spots, and retry rates.",
      inputSchema: {
        type: "object" as const,
        properties: {
          agent: { type: "string", description: "Restrict analysis to a specific agent name (omit for all agents)" },
          days: { type: "number", description: "Number of days of trace history to analyze", default: 30 },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = (args ?? {}) as any;
    if (name === "trace_list") { const r = await traceList(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "trace_view") { const r = await traceView(params); return { content: [{ type: "text" as const, text: typeof r === "string" ? r : JSON.stringify(r, null, 2) }] }; }
    if (name === "trace_analyze") { const r = await traceAnalyze(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

export async function startMCPServer() { const t = new StdioServerTransport(); await server.connect(t); }
