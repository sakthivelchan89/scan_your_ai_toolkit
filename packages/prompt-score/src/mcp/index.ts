import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { promptScoreAnalyze, promptScoreImprove, promptScoreTrack } from "./tools.js";

const server = new Server(
  { name: "@maiife/prompt-score", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "prompt_score_analyze",
      description: "Score prompt quality across 6 dimensions (specificity, structure, efficiency, model fit, best practices, anti-patterns)",
      inputSchema: {
        type: "object" as const,
        properties: {
          prompt: { type: "string", description: "The prompt to analyze" },
          track: { type: "boolean", description: "Track score in history", default: true },
          project: { type: "string", description: "Project name for tracking" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "prompt_score_improve",
      description: "Get an improved version of your prompt with explanations",
      inputSchema: {
        type: "object" as const,
        properties: { prompt: { type: "string", description: "The prompt to improve" } },
        required: ["prompt"],
      },
    },
    {
      name: "prompt_score_track",
      description: "View prompt quality scores over time",
      inputSchema: {
        type: "object" as const,
        properties: {
          project: { type: "string", description: "Filter by project" },
          days: { type: "number", description: "Look back period in days", default: 30 },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = (args ?? {}) as Record<string, any>;
    if (name === "prompt_score_analyze") {
      const result = await promptScoreAnalyze(params as { prompt: string; track?: boolean; project?: string });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "prompt_score_improve") {
      const result = await promptScoreImprove(params as { prompt: string });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "prompt_score_track") {
      const result = await promptScoreTrack(params as { project?: string; days?: number });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

export async function startMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
