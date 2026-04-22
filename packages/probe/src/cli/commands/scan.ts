import type { Command } from "commander";
import { probeScan } from "../../mcp/tools.js";
import type { ScanScope } from "../../core/types.js";
import { resolvePostConfig } from "../../core/config.js";
import { postFindings } from "../../core/post.js";
import * as os from "node:os";
import * as crypto from "node:crypto";

export function registerScanCommand(program: Command) {
  program
    .command("scan")
    .description("Scan your environment for AI tools, MCP servers, API keys, and more")
    .option("--quick", "Quick scan (IDE + MCP only)")
    .option("--categories <cats>", "Comma-separated categories: ide,mcp,agents,keys,models,deps,tools,extensions")
    .option("--path <dir>", "Root path to scan", process.cwd())
    .option("--format <fmt>", "Output format: json, table", "table")
    .option("--ci", "CI mode: exit code 1 if high/critical risk")
    .option("--no-deps", "Skip dependency scanning")
    .option("--post-to <url>", "POST results to a Maiife gateway (overrides MAIIFE_GATEWAY env)")
    .option("--key <mk>", "Maiife API key (overrides MAIIFE_API_KEY env)")
    .option("--no-post", "Disable posting even if env is set")
    .option("--post-only", "Exit 1 if POST fails; suppress local output")
    .action(async (opts) => {
      const scope: ScanScope = opts.quick ? "quick" : opts.categories ? "category" : "full";
      const categories = opts.quick
        ? "ide,mcp"
        : opts.categories ?? "ide,mcp,agents,keys,models,deps,tools,extensions";

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

      // Opt-in POST to Maiife gateway.
      const cfg = resolvePostConfig({
        flags: { postTo: opts.postTo, key: opts.key },
        env: process.env,
      });

      const postingEnabled = opts.post !== false; // --no-post sets post=false
      if (postingEnabled && cfg.gateway && cfg.apiKey) {
        const payload = {
          toolName: "probe" as const,
          findings: result.findings as unknown as Record<string, unknown>,
          environment: {
            os: `${os.platform()}-${os.release()}`,
            hostnameHash: crypto.createHash("sha256").update(os.hostname()).digest("hex").slice(0, 16),
            nodeVersion: process.version,
          },
          scannedAt: new Date().toISOString(),
        };
        const post = await postFindings({ gateway: cfg.gateway, apiKey: cfg.apiKey, payload });
        if (post.ok) {
          if (!opts.postOnly) console.error(`  posted findings to ${cfg.gateway}`);
        } else {
          console.error(`  WARN: POST failed (${post.status ?? "network"}): ${post.error ?? ""}`);
          if (opts.postOnly) process.exit(1);
        }
      } else if (postingEnabled && cfg.gateway && !cfg.apiKey) {
        console.error("  WARN: MAIIFE_GATEWAY set but MAIIFE_API_KEY missing; skipping POST");
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
    console.log("  AI-Enabled IDEs:");
    for (const f of findings.ide) {
      console.log(`    ${f.name} v${f.version} (${f.status})`);
    }
    console.log();
  }

  if (findings.tools.length > 0) {
    console.log("  AI Desktop Tools:");
    for (const f of findings.tools) {
      const parts: string[] = [f.label, `(${f.category})`];
      if (f.configSummary.mcpCount !== undefined) parts.push(`${f.configSummary.mcpCount} MCP`);
      if (f.configSummary.hooksCount !== undefined) parts.push(`${f.configSummary.hooksCount} hooks`);
      if (f.configSummary.skillsCount !== undefined) parts.push(`${f.configSummary.skillsCount} skills`);
      if (f.configSummary.memoryFiles !== undefined) parts.push(`${f.configSummary.memoryFiles} memory files`);
      console.log(`    ${parts.join(" — ")}`);
    }
    console.log();
  }

  if (findings.extensions.length > 0) {
    console.log("  Browser / IDE Extensions:");
    for (const f of findings.extensions) {
      console.log(`    ${f.name} v${f.version} (${f.host})`);
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
