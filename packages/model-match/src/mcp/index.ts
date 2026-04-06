import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { modelMatchCompare, modelMatchRecommend } from "./tools.js";

const server = new Server({ name: "@maiife/model-match", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "model_match_compare",
      description: "Compare multiple AI models side-by-side for a specific task type. Scores each model on quality, speed, cost-per-token, and context window fit, then ranks them in a comparison table.",
      inputSchema: {
        type: "object" as const,
        properties: {
          task: { type: "string", description: "Natural-language description of the task (e.g. 'summarize legal documents', 'generate TypeScript unit tests')" },
          tokens: { type: "number", description: "Estimated input+output token count per request, used to calculate cost projections" },
        },
        required: ["task"],
      },
    },
    {
      name: "model_match_recommend",
      description: "Return the single best-fit AI model for a task, with a plain-English rationale covering quality, latency, and cost trade-offs.",
      inputSchema: {
        type: "object" as const,
        properties: {
          task: { type: "string", description: "Natural-language description of the task to find a model for" },
        },
        required: ["task"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = (args ?? {}) as any;
    if (name === "model_match_compare") { const r = await modelMatchCompare(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "model_match_recommend") { const r = await modelMatchRecommend(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

export async function startMCPServer() { const t = new StdioServerTransport(); await server.connect(t); }
