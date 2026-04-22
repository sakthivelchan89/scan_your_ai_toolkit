import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { contextSyncRead, contextSyncUpdate, contextSyncPush, contextSyncStatus } from "./tools.js";

const server = new Server(
  { name: "@maiife/context-sync", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "context_sync_read",
      description: "Read all stored AI context entries — persistent key-value pairs (preferences, project facts, coding standards) that are injected into every AI session via context-sync.",
      inputSchema: {
        type: "object" as const,
        properties: { category: { type: "string", description: "Filter entries by category (e.g. 'coding', 'project', 'personal'). Omit to return all entries." } },
      },
    },
    {
      name: "context_sync_update",
      description: "Add a new context entry or overwrite an existing one by key. Context entries are synced to all connected AI tools so they persist across sessions.",
      inputSchema: {
        type: "object" as const,
        properties: {
          key: { type: "string", description: "Unique identifier for this context entry (e.g. 'preferred_language', 'project_name')" },
          value: { type: "string", description: "Value to store for this key" },
          category: { type: "string", description: "Logical grouping for the entry (e.g. 'coding', 'project', 'personal')", default: "general" },
        },
        required: ["key", "value"],
      },
    },
    {
      name: "context_sync_push",
      description: "Push all stored context entries out to every connected AI tool (Claude, Cursor, Copilot, etc.), overwriting their context files with the latest values.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "context_sync_status",
      description: "Show the current sync status for each connected AI tool — which tools are up-to-date and which have stale or missing context.",
      inputSchema: { type: "object" as const, properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = (args ?? {}) as Record<string, string>;
    if (name === "context_sync_read") {
      const result = await contextSyncRead(params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "context_sync_update") {
      const result = await contextSyncUpdate(params as { key: string; value: string; category?: string });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "context_sync_push") {
      const result = await contextSyncPush();
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
    if (name === "context_sync_status") {
      const result = await contextSyncStatus();
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

// Auto-start when run directly
startMCPServer().catch(console.error);
