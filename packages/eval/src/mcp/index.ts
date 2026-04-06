import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { evalScoreTool, evalBatchTool, evalCompareTool } from "./tools.js";

const server = new Server({ name: "@maiife/eval", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "eval_score",
      description: "Score a single AI-generated output against a named rubric (jira-ticket, code-review, email-draft, sql-query, documentation, summary). Returns a numeric score with per-criterion breakdown.",
      inputSchema: {
        type: "object" as const,
        properties: {
          output: { type: "string", description: "The AI-generated text to evaluate" },
          rubric: {
            type: "string",
            enum: ["jira-ticket", "code-review", "email-draft", "sql-query", "documentation", "summary"],
            description: "Named rubric that defines the scoring criteria for this output type",
          },
          context: { type: "string", description: "Optional original prompt or task description that generated this output" },
        },
        required: ["output", "rubric"],
      },
    },
    {
      name: "eval_batch",
      description: "Score multiple AI outputs against the same rubric in parallel and return aggregate statistics (mean, min, max, std dev, outliers). Useful for comparing prompt variations or model outputs at scale.",
      inputSchema: {
        type: "object" as const,
        properties: {
          outputs: {
            type: "array",
            items: { type: "string" },
            description: "Array of AI-generated texts to evaluate",
          },
          rubric: {
            type: "string",
            enum: ["jira-ticket", "code-review", "email-draft", "sql-query", "documentation", "summary"],
            description: "Named rubric applied uniformly to every output in the batch",
          },
        },
        required: ["outputs", "rubric"],
      },
    },
    {
      name: "eval_compare",
      description: "A/B test two sets of AI outputs against the same rubric. Returns score distributions, a winner declaration, and statistical significance for each criterion.",
      inputSchema: {
        type: "object" as const,
        properties: {
          baseline: {
            type: "array",
            items: { type: "string" },
            description: "Control group outputs (e.g. existing prompt or model)",
          },
          candidate: {
            type: "array",
            items: { type: "string" },
            description: "Challenger group outputs (e.g. new prompt or model)",
          },
          rubric: {
            type: "string",
            enum: ["jira-ticket", "code-review", "email-draft", "sql-query", "documentation", "summary"],
            description: "Named rubric used to score both groups",
          },
        },
        required: ["baseline", "candidate", "rubric"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = (args ?? {}) as any;
    if (name === "eval_score") { const r = await evalScoreTool(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "eval_batch") { const r = await evalBatchTool(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "eval_compare") { const r = await evalCompareTool(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

export async function startMCPServer() { const t = new StdioServerTransport(); await server.connect(t); }
