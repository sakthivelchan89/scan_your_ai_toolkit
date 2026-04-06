#!/usr/bin/env node
import { Command } from "commander";
import { getEntries, addEntry, removeEntry, loadContext } from "../core/store.js";
import { pushAll, getStatus, diff } from "../core/sync.js";
import { createCursorRulesTarget, createClaudeTarget, createMCPMemoryTarget } from "../core/targets/index.js";

const ALL_TARGETS = [createCursorRulesTarget(), createClaudeTarget(), createMCPMemoryTarget()];

const program = new Command();

program
  .name("maiife-context-sync")
  .description("Cross-Tool AI Memory Sync — one source of truth for your AI context")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize context store with starter entries")
  .action(() => {
    const store = loadContext();
    if (store.entries.length > 0) { console.log(`\n Context store already exists with ${store.entries.length} entries.\n`); return; }
    addEntry({ key: "role", value: "Software developer", category: "personal" });
    addEntry({ key: "preferences", value: "Concise responses, code examples over explanations", category: "communication" });
    console.log("\n Context store initialized with starter entries.\n");
  });

program
  .command("list")
  .description("List all context entries")
  .option("--category <cat>", "Filter by category")
  .option("--format <fmt>", "Output format: table, json", "table")
  .action((opts) => {
    const entries = getEntries(opts.category);
    if (opts.format === "json") { console.log(JSON.stringify(entries, null, 2)); return; }
    console.log("\n AI Context Entries\n");
    if (entries.length === 0) { console.log("   No entries. Run 'init' to get started.\n"); return; }
    for (const entry of entries) { console.log(`  [${entry.category}] ${entry.key}: ${entry.value}`); }
    console.log();
  });

program
  .command("add <key> <value>")
  .description("Add or update a context entry")
  .option("--category <cat>", "Category", "general")
  .action((key, value, opts) => {
    addEntry({ key, value, category: opts.category });
    console.log(`\n Added: ${key} = ${value} [${opts.category}]\n`);
  });

program
  .command("remove <key>")
  .description("Remove a context entry")
  .action((key) => {
    removeEntry(key);
    console.log(`\n Removed: ${key}\n`);
  });

program
  .command("push")
  .description("Sync context to all connected tools")
  .action(async () => {
    const results = await pushAll(ALL_TARGETS);
    console.log("\n Context Sync — Push Results\n");
    if (results.length === 0) { console.log("   No available sync targets detected.\n"); return; }
    for (const r of results) {
      const icon = r.success ? "OK" : "FAIL";
      console.log(`  ${icon} ${r.target}: ${r.success ? `${r.entriesSynced} entries synced` : r.error}`);
    }
    console.log();
  });

program
  .command("status")
  .description("Show sync status across all tools")
  .action(async () => {
    const statuses = await getStatus(ALL_TARGETS);
    console.log("\n Context Sync — Status\n");
    for (const s of statuses) {
      const icon = s.available ? "OK" : "N/A";
      console.log(`  ${icon} ${s.target.padEnd(15)} ${s.available ? `${s.entriesInTarget} entries` : "not available"}`);
    }
    console.log();
  });

program
  .command("diff")
  .description("Show divergence between local and sync targets")
  .action(async () => {
    console.log("\n Context Sync — Diff\n");
    for (const target of ALL_TARGETS) {
      const available = await target.detect();
      if (!available) continue;
      const d = await diff(target);
      console.log(`  ${target.name}:`);
      if (d.localOnly.length === 0 && d.targetOnly.length === 0 && d.diverged.length === 0) {
        console.log("    In sync");
      } else {
        for (const k of d.localOnly) console.log(`    + ${k} (local only)`);
        for (const k of d.targetOnly) console.log(`    - ${k} (target only)`);
        for (const k of d.diverged) console.log(`    ~ ${k} (diverged)`);
      }
    }
    console.log();
  });

program
  .command('mcp')
  .description('Start MCP server over stdio')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

// If no arguments, default to MCP server (for npx/Glama/Claude Desktop)
if (process.argv.length <= 2) {
  import('../mcp/index.js').then(m => m.startMCPServer());
} else {
  program.parse();
}
