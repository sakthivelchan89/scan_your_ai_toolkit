import type { Command } from "commander";
import { probeScan } from "../../mcp/tools.js";
import type { ScanScope } from "../../core/types.js";

export function registerScanCommand(program: Command) {
  program
    .command("scan")
    .description("Scan your environment for AI tools, MCP servers, API keys, and more")
    .option("--quick", "Quick scan (IDE + MCP only)")
    .option("--categories <cats>", "Comma-separated categories: ide,mcp,agents,keys,models,deps")
    .option("--path <dir>", "Root path to scan", process.cwd())
    .option("--format <fmt>", "Output format: json, table", "table")
    .option("--ci", "CI mode: exit code 1 if high/critical risk")
    .option("--no-deps", "Skip dependency scanning")
    .action(async (opts) => {
      const scope: ScanScope = opts.quick ? "quick" : opts.categories ? "category" : "full";
      const categories = opts.quick
        ? "ide,mcp"
        : opts.categories ?? "ide,mcp,agents,keys,models,deps";

      const result = await probeScan({
        scope,
        categories,
        path: opts.path,
        includeProjectDeps: opts.deps !== false,
      });

      if (opts.format === "json") {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printTable(result);
      }

      if (opts.ci && (result.summary.riskLevel === "high" || result.summary.riskLevel === "critical")) {
        process.exit(1);
      }
    });
}

function printTable(result: Awaited<ReturnType<typeof probeScan>>) {
  const { findings, summary } = result;

  console.log("\n  @maiife/probe — AI Environment Scan\n");

  if (findings.ide.length > 0) {
    console.log("  IDE Extensions:");
    for (const f of findings.ide) {
      console.log(`    ${f.name} v${f.version} (${f.status})`);
    }
    console.log();
  }

  if (findings.mcp.length > 0) {
    console.log("  MCP Servers:");
    for (const f of findings.mcp) {
      const riskIcon = f.risk === "high" || f.risk === "critical" ? "!!" : f.risk === "medium" ? "!" : " ";
      console.log(`    [${riskIcon}] ${f.name} (${f.transport}) — perms: ${f.permissions.join(", ")}`);
    }
    console.log();
  }

  if (findings.agents.length > 0) {
    console.log("  Agent Frameworks:");
    for (const f of findings.agents) {
      console.log(`    ${f.name} v${f.version} (${f.language})`);
    }
    console.log();
  }

  if (findings.keys.length > 0) {
    console.log("  API Keys:");
    for (const f of findings.keys) {
      console.log(`    ${f.vendor}: ${f.variable} in ${f.location} ${f.managed ? "(managed)" : "(UNMANAGED)"}`);
    }
    console.log();
  }

  if (findings.models.length > 0) {
    console.log("  Local Models:");
    for (const f of findings.models) {
      console.log(`    ${f.runtime} on port ${f.port} (${f.status})`);
    }
    console.log();
  }

  if (findings.deps.length > 0) {
    console.log("  AI SDKs:");
    for (const f of findings.deps) {
      console.log(`    ${f.name} v${f.version} (${f.category})`);
    }
    console.log();
  }

  console.log(`  Summary: ${summary.totalFindings} findings — risk: ${summary.riskLevel.toUpperCase()}`);
  if (summary.recommendations.length > 0) {
    console.log("  Recommendations:");
    for (const rec of summary.recommendations) {
      console.log(`    - ${rec}`);
    }
  }
  console.log();
}
