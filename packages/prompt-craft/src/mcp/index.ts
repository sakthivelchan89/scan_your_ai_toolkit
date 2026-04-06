import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { promptCraftScore, promptCraftImprove, promptCraftProfile, promptCraftChallenge } from "./tools.js";

const server = new Server({ name: "@maiife/prompt-craft", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "prompt_craft_score",
      description: "Score a prompt across quality dimensions and award XP toward your prompt-engineering level. Returns numeric score, per-dimension breakdown, XP gained, and any newly unlocked badges.",
      inputSchema: {
        type: "object" as const,
        properties: {
          prompt: { type: "string", description: "The prompt text to score" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "prompt_craft_improve",
      description: "Rewrite a prompt to maximize clarity, specificity, and model alignment. Returns the improved prompt alongside a diff-style explanation of every change made.",
      inputSchema: {
        type: "object" as const,
        properties: {
          prompt: { type: "string", description: "The prompt text to improve" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "prompt_craft_profile",
      description: "Retrieve your prompt-engineering player profile: current level, XP, streak, average score, score history, and all earned badges.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "prompt_craft_challenge",
      description: "Fetch this week's prompt-engineering challenge — a specific task with acceptance criteria you can attempt and score to earn bonus XP.",
      inputSchema: { type: "object" as const, properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const params = (args ?? {}) as any;
    if (name === "prompt_craft_score") { const r = await promptCraftScore(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "prompt_craft_improve") { const r = await promptCraftImprove(params); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "prompt_craft_profile") { const r = await promptCraftProfile(); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    if (name === "prompt_craft_challenge") { const r = await promptCraftChallenge(); return { content: [{ type: "text" as const, text: JSON.stringify(r, null, 2) }] }; }
    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

export async function startMCPServer() { const t = new StdioServerTransport(); await server.connect(t); }
