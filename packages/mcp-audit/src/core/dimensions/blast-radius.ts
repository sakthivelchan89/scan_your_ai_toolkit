import type { ParsedMCPServer, DimensionScore } from "../types.js";

const DESTRUCTIVE_PATTERNS = /drop|delete|truncate|destroy|purge|wipe/i;
const FILESYSTEM_PATTERNS = /file|fs|disk|directory|folder|path/i;
const NETWORK_PATTERNS = /http|curl|fetch|request|webhook|url/i;

export function scoreBlastRadius(server: ParsedMCPServer): DimensionScore {
  const searchText = [server.name, ...server.args].join(" ").toLowerCase();
  let score = 100;
  const details: string[] = [];

  if (DESTRUCTIVE_PATTERNS.test(searchText)) {
    score -= 50;
    details.push("Destructive operations (drop/delete/truncate) detected");
  }

  if (FILESYSTEM_PATTERNS.test(searchText)) {
    score -= 20;
    details.push("File system access capabilities detected");
  }

  if (NETWORK_PATTERNS.test(searchText) || server.url) {
    score -= 15;
    details.push("Network access capabilities detected");
  }

  if (details.length === 0) {
    details.push("Limited blast radius detected");
  }

  return {
    dimension: "blast-radius",
    score: Math.max(0, score),
    weight: 0.15,
    details,
  };
}
