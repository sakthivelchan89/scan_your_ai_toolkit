import * as path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { mcpAuditScan, mcpAuditScore } from "./tools.js";

function sanitizePath(inputPath: string): string {
  if (inputPath.includes("..")) throw new Error("Invalid path: directory traversal is not allowed");
  return path.resolve(inputPath);
}

const server = new Server(
  { name: "@maiife/mcp-audit", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mcp_audit_scan",
      description:
        "Scan MCP server configurations and produce security scorecards with grades for permissions, data sensitivity, authentication, blast radius, and versioning",
      inputSchema: {
        type: "object" as const,
        properties: {
          configPath: {
            type: "string",
            description: "Path to a specific MCP config file (defaults to auto-detection)",
          },
          servers: {
            type: "string",
            description: "Comma-separated server names to audit (defaults to all)",
          },
        },
      },
    },
    {
      name: "mcp_audit_score",
      description: "Score a single MCP server by name and return its full security scorecard",
      inputSchema: {
        type: "object" as const,
        properties: {
          serverName: {
            type: "string",
            description: "Name of the MCP server to score",
          },
          configPath: {
            type: "string",
            description: "Path to a specific MCP config file (defaults to auto-detection)",
          },
        },
        required: ["serverName"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === "mcp_audit_scan") {
      const scanArgs = { ...(args ?? {}) } as { configPath?: string; servers?: string };
      if (typeof scanArgs.configPath === "string") scanArgs.configPath = sanitizePath(scanArgs.configPath);
      const result = await mcpAuditScan(scanArgs);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }

    if (name === "mcp_audit_score") {
      const scoreArgs = { ...(args as { serverName: string; configPath?: string }) };
      if (typeof scoreArgs.configPath === "string") scoreArgs.configPath = sanitizePath(scoreArgs.configPath);
      const result = await mcpAuditScore(scoreArgs);
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
