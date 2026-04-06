import * as path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { aiStackGenerate } from "./tools.js";

function sanitizePath(inputPath: string): string {
  if (inputPath.includes("..")) throw new Error("Invalid path: directory traversal is not allowed");
  return path.resolve(inputPath);
}

const server = new Server(
  { name: "@maiife/ai-stack", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ai_stack_generate",
      description: "Generate your AI Stack profile card showing all AI tools on your machine",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "Root path to scan (defaults to home)" },
          format: { type: "string", enum: ["json", "svg", "markdown"], description: "Output format", default: "json" },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === "ai_stack_generate") {
      const genArgs = { ...(args ?? {}) } as { path?: string; format?: string };
      if (typeof genArgs.path === "string") genArgs.path = sanitizePath(genArgs.path);
      const result = await aiStackGenerate(genArgs);
      return { content: [{ type: "text" as const, text: result.rendered }] };
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
