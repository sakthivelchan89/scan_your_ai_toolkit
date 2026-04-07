import type { ParsedMCPServer, DimensionScore } from "../types.js";

const SAFE_PREFIXES = [
  "@modelcontextprotocol/",
  "@anthropic-ai/",
  "@github/",
];

const NPM_PACKAGE_RE = /^(?:@[\w-]+\/)?[\w-]+$/;

export function scoreVersioning(server: ParsedMCPServer): DimensionScore {
  let score = 100;
  const details: string[] = [];

  const packageArg = server.args.find((a) => NPM_PACKAGE_RE.test(a) && !a.startsWith("-"));

  if (!packageArg) {
    if (!server.command) {
      details.push("No npm package detected — possibly a custom build");
      score -= 40;
    } else {
      details.push("No versioned npm package detected");
      score -= 40;
    }
  } else {
    const isSafe = SAFE_PREFIXES.some((prefix) => packageArg.startsWith(prefix));
    if (isSafe) {
      details.push(`Trusted package source: ${packageArg}`);
    } else {
      score -= 15;
      details.push(`Third-party package (review carefully): ${packageArg}`);
    }
  }

  return {
    dimension: "versioning",
    score: Math.max(0, score),
    weight: 0.1,
    details,
  };
}
