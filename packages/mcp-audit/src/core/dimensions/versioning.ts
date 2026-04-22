import type { ParsedMCPServer, DimensionScore } from "../types.js";

const SAFE_PREFIXES = [
  "@modelcontextprotocol/",
  "@anthropic-ai/",
  "@github/",
];

const NPM_PACKAGE_RE = /@[\w-]+\/[\w-]+|[\w-]+\/[\w-]+/;

export function scoreVersioning(server: ParsedMCPServer): DimensionScore {
  let score = 100;
  const details: string[] = [];

  const allArgs = server.args.join(" ");
  const packageMatch = allArgs.match(NPM_PACKAGE_RE);

  if (!packageMatch) {
    if (!server.command) {
      details.push("No npm package detected — possibly a custom build");
      score -= 40;
    } else {
      details.push("No versioned npm package detected");
      score -= 40;
    }
  } else {
    const pkg = packageMatch[0];
    const isSafe = SAFE_PREFIXES.some((prefix) => pkg.startsWith(prefix));
    if (isSafe) {
      details.push(`Trusted package source: ${pkg}`);
    } else {
      score -= 15;
      details.push(`Third-party package (review carefully): ${pkg}`);
    }
  }

  return {
    dimension: "versioning",
    score: Math.max(0, score),
    weight: 0.1,
    details,
  };
}
