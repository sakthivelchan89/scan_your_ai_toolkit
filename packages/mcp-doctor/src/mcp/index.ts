import * as path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { mcpDoctorCheckup, mcpDoctorFix, mcpDoctorStatus } from "./tools.js";

function sanitizePath(inputPath: string): string {
  if (inputPath.includes("..")) throw new Error("Invalid path: directory traversal is not allowed");
  return path.resolve(inputPath);
}

const server = new Server(
  { name: "@maiife/mcp-doctor", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mcp_doctor_checkup",
      description: "Run a full health check on all configured MCP servers: validates binary paths, checks connectivity, reports missing env vars, and identifies version mismatches.",
      inputSchema: {
        type: "object" as const,
        properties: {
          configPath: { type: "string", description: "Path to an MCP config file to check (auto-detects Claude/Cursor configs if omitted)" },
          server: { type: "string", description: "Limit the health check to a single named server" },
        },
      },
    },
    {
      name: "mcp_doctor_fix",
      description: "Generate auto-fix suggestions for broken MCP servers — such as corrected binary paths, missing env var stubs, and updated package install commands.",
      inputSchema: { type: "object" as const, properties: { configPath: { type: "string", description: "Path to an MCP config file to generate fixes for (auto-detects if omitted)" } } },
    },
    {
      name: "mcp_doctor_status",
      description: "Return a concise up/down status summary for all MCP servers in the config — useful as a quick sanity check before starting a development session.",
      inputSchema: { type: "object" as const, properties: { configPath: { type: "string", description: "Path to an MCP config file (auto-detects if omitted)" } } },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = { ...(args ?? {}) } as { configPath?: string; server?: string };
    if (typeof params.configPath === "string") params.configPath = sanitizePath(params.configPath);
    if (name === "mcp_doctor_checkup") {
      const result = await mcpDoctorCheckup(params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "mcp_doctor_fix") {
      const result = await mcpDoctorFix(params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "mcp_doctor_status") {
      const result = await mcpDoctorStatus(params);
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
