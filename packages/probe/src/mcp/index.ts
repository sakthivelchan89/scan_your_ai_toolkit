import * as path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { probeScan } from "./tools.js";

function sanitizePath(inputPath: string): string {
  if (inputPath.includes("..")) throw new Error("Invalid path: directory traversal is not allowed");
  return path.resolve(inputPath);
}

const server = new Server(
  { name: "@maiife/probe", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "probe_scan",
      description:
        "Scan the current environment for AI tools, MCP servers, agent frameworks, API keys, and local models",
      inputSchema: {
        type: "object" as const,
        properties: {
          scope: {
            type: "string",
            enum: ["full", "quick", "category"],
            description: "Scan scope: full=everything, quick=IDE+MCP only, category=specific",
            default: "full",
          },
          categories: {
            type: "string",
            description: "Comma-separated categories: ide,mcp,agents,keys,models,deps",
          },
          path: {
            type: "string",
            description: "Root path to scan (defaults to current directory)",
          },
          includeProjectDeps: {
            type: "boolean",
            description: "Scan package.json/requirements.txt for AI dependencies",
            default: true,
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === "probe_scan") {
      const scanArgs = { ...(args ?? {}) } as Record<string, unknown>;
      if (typeof scanArgs.path === "string") scanArgs.path = sanitizePath(scanArgs.path);
      const result = await probeScan(scanArgs);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
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

// Auto-start when run directly
startMCPServer().catch(console.error);
