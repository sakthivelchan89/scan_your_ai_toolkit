import { parseAllMCPConfigs } from "../../core/config-parser.js";
import { scoreServer } from "../../core/scorer.js";

export async function runScore(options: { server: string; config?: string }): Promise<void> {
  const allServers = parseAllMCPConfigs(options.config);
  const server = allServers.find((s) => s.name === options.server);
  if (!server) {
    console.error(`Error: Server "${options.server}" not found in MCP configs`);
    process.exit(1);
  }
  const card = scoreServer(server);
  console.log(JSON.stringify(card, null, 2));
}
