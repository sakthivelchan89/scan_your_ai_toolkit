#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("maiife-ai-toolkit")
  .description("Maiife AI Governance Toolkit — all 15 packages in one install")
  .version("0.2.2");

program
  .command("list")
  .description("List all toolkit packages")
  .action(() => {
    const packages = [
      { name: "probe", desc: "AI environment scanner", mcp: true },
      { name: "ai-stack", desc: "AI stack profile card", mcp: true },
      { name: "ai-journal", desc: "AI interaction journal", mcp: false },
      { name: "context-sync", desc: "Context sync to AI tools", mcp: true },
      { name: "cost", desc: "AI spend calculator", mcp: true },
      { name: "eval", desc: "Output quality scorer", mcp: true },
      { name: "mcp-audit", desc: "MCP server security audit", mcp: true },
      { name: "mcp-doctor", desc: "MCP server health check", mcp: true },
      { name: "model-match", desc: "Model recommender", mcp: true },
      { name: "prompt-craft", desc: "Gamified prompt coach", mcp: true },
      { name: "prompt-score", desc: "Prompt quality analyzer", mcp: true },
      { name: "shared", desc: "Shared types & formatters", mcp: false },
      { name: "sub-audit", desc: "Subscription auditor", mcp: true },
      { name: "trace", desc: "Agent workflow tracer", mcp: true },
      { name: "weekly-ai-report", desc: "Weekly AI report", mcp: false },
    ];

    console.log("\nMaiife AI Toolkit — 15 packages\n");
    console.log("  Package              Description                  MCP");
    console.log("  ───────────────────  ───────────────────────────  ───");
    for (const pkg of packages) {
      const mcp = pkg.mcp ? " ✓" : "  ";
      console.log(
        `  %-20s %-28s %s`,
        pkg.name,
        pkg.desc,
        mcp,
      );
    }
    console.log(`\n  Total: ${packages.length} packages, ${packages.filter((p) => p.mcp).length} MCP servers\n`);
  });

program
  .command("setup")
  .description("Print claude mcp add commands for all 12 MCP servers")
  .action(() => {
    const mcpPackages = [
      "probe", "ai-stack", "context-sync", "cost", "eval",
      "mcp-audit", "mcp-doctor", "model-match", "prompt-craft",
      "prompt-score", "sub-audit", "trace",
    ];

    console.log("\nRun these commands to add all MCP servers to Claude Code:\n");
    for (const pkg of mcpPackages) {
      console.log(`  claude mcp add ${pkg} -s user -- npx @maiife-ai-pub/${pkg} mcp`);
    }
    console.log("");
  });

program.parse();
