#!/usr/bin/env node
import { Command } from "commander";
import { registerScanCommand } from "./commands/scan.js";
import { registerWatchCommand } from "./commands/watch.js";

const program = new Command();

program
  .name("maiife-probe")
  .description("AI environment scanner — discover IDE extensions, MCP servers, agent frameworks, API keys, local models")
  .version("0.1.0");

registerScanCommand(program);
registerWatchCommand(program);

program
  .command('mcp')
  .description('Start MCP server over stdio')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse();
