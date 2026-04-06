import type { ParsedMCPServer, DimensionScore } from "../types.js";

const OAUTH_PATTERNS = /oauth|oidc|openid/i;
const TOKEN_PATTERNS = /token|bearer|api.?key/i;

export function scoreAuth(server: ParsedMCPServer): DimensionScore {
  let score = 100;
  const details: string[] = [];

  const allText = [server.name, ...server.args, ...Object.values(server.env)].join(" ");
  const envKeys = Object.keys(server.env).join(" ");

  if (OAUTH_PATTERNS.test(allText) || OAUTH_PATTERNS.test(envKeys)) {
    details.push("OAuth/OIDC authentication detected");
    return { dimension: "auth", score, weight: 0.2, details };
  }

  if (TOKEN_PATTERNS.test(envKeys) || Object.keys(server.env).length > 0) {
    score -= 10;
    details.push("Token-based authentication detected");
  } else if (server.transport === "stdio") {
    score -= 30;
    details.push("No authentication configured for stdio transport");
  }

  if (details.length === 0) {
    details.push("Authentication method unclear");
  }

  return {
    dimension: "auth",
    score: Math.max(0, score),
    weight: 0.2,
    details,
  };
}
