import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { costReport, costOptimize } from "./tools.js";

const server = new Server({ name: "@maiife/cost", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "cost_report",
      description: "Generate a unified AI spend report aggregating subscription fees, API token costs, and local model compute across all detected AI tools. Returns per-vendor breakdown, daily spend trend, and total for the period.",
      inputSchema: {
        type: "object" as const,
        properties: {
          period: {
            type: "string",
            description: "Time window to report on (e.g. 'last-30d', 'last-7d', 'this-month')",
            default: "last-30d",
          },
        },
      },
    },
    {
      name: "cost_optimize",
      description: "Analyze your AI spending patterns and return prioritized cost-reduction recommendations — such as unused subscriptions, cheaper model substitutes, and token-efficiency improvements.",
      inputSchema: {
        type: "object" as const,
        properties: {
          period: {
            type: "string",
            description: "Time window to analyze for optimization opportunities",
            default: "last-30d",
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = args as Record<string, unknown> ?? {};
    if (name === "cost_report") { const r = await costReport(params as Parameters<typeof costReport>[0]); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "cost_optimize") { const r = await costOptimize(params as Parameters<typeof costOptimize>[0]); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

export async function startMCPServer() { const t = new StdioServerTransport(); await server.connect(t); }

// Auto-start when run directly
startMCPServer().catch(console.error);
