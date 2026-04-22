#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "node:fs";
import { promptCraftScore, promptCraftImprove, promptCraftProfile, promptCraftChallenge } from "../mcp/tools.js";
import { getLevelName } from "../core/gamification.js";

const program = new Command();
program.name("maiife-prompt-craft").description("Gamified Personal Prompt Coach").version("0.1.0");

program.command("score").description("Score a prompt and earn XP")
  .option("--input <file>", "Read prompt from file")
  .action(async (opts) => {
    let prompt = "";
    if (opts.input) { prompt = fs.readFileSync(opts.input, "utf-8"); }
    else if (!process.stdin.isTTY) {
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      prompt = Buffer.concat(chunks).toString("utf-8");
    } else { console.error("Provide prompt via --input or pipe"); process.exit(1); }
    const result = await promptCraftScore({ prompt });
    console.log(`\nScore: ${result.analysis.totalScore}/100 (${result.analysis.grade}) +${result.xpGained} XP`);
    console.log(`   Level ${result.profile.level} ${getLevelName(result.profile.level)} - ${result.profile.xp} XP - ${result.profile.streak}-day streak`);
    if (result.leveledUp) console.log(`   LEVEL UP! Now Level ${result.profile.level}!`);
    for (const b of result.newBadges) console.log(`   New badge: ${b.name} -- ${b.description}`);
    console.log();
  });

program.command("improve").description("Get improved prompt")
  .option("--input <file>", "Read from file")
  .action(async (opts) => {
    let prompt = "";
    if (opts.input) { prompt = fs.readFileSync(opts.input, "utf-8"); }
    else if (!process.stdin.isTTY) {
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      prompt = Buffer.concat(chunks).toString("utf-8");
    } else { console.error("Provide prompt via --input or pipe"); process.exit(1); }
    const result = await promptCraftImprove({ prompt });
    console.log(`\n${result.scoreBefore} -> ${result.scoreAfter}\n`);
    for (const c of result.changes) console.log(`  ${c.description}`);
    console.log(`\n${result.improved}\n`);
  });

program.command("profile").description("View your profile")
  .action(async () => {
    const p = await promptCraftProfile();
    console.log(`\nLevel ${p.level} ${getLevelName(p.level)}`);
    console.log(`   XP: ${p.xp} - Streak: ${p.streak} days - Scored: ${p.totalScored} - Avg: ${p.avgScore}`);
    if (p.badges.length > 0) { console.log("   Badges:"); for (const b of p.badges) console.log(`     ${b.name}`); }
    console.log();
  });

program.command("challenge").description("This week's challenge")
  .action(async () => {
    const c = await promptCraftChallenge();
    console.log(`\nWeekly Challenge: ${c.title}`);
    console.log(`   ${c.description}`);
    console.log(`   Target score: ${c.targetScore}+\n`);
  });

program.command('mcp')
  .description('Start MCP server (stdio transport)')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse();
