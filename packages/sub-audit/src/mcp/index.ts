import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { subAuditRun } from "./tools.js";

const server = new Server({ name: "@maiife/sub-audit", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "sub_audit_run",
      description: "Detect all AI subscriptions and API credentials on this machine, then flag redundant overlaps (e.g. Copilot + Cursor both covering code completion) and estimate monthly savings from consolidation.",
      inputSchema: { type: "object" as const, properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "sub_audit_run") {
      const r = await subAuditRun();
      return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

export async function startMCPServer() { const t = new StdioServerTransport(); await server.connect(t); }
