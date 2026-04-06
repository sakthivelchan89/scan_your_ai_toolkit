import type { ParsedMCPServer, DimensionScore } from "../types.js";

const ADMIN_PATTERNS = /delete|drop|exec|kill|admin|destroy|purge|truncate/i;
const WRITE_PATTERNS = /write|create|update|post|insert|put|modify|edit/i;

export function scorePermissions(server: ParsedMCPServer): DimensionScore {
  const searchText = [server.name, ...server.args].join(" ").toLowerCase();
  let score = 100;
  const details: string[] = [];

  if (ADMIN_PATTERNS.test(searchText)) {
    score -= 50;
    details.push("Admin/destructive operation patterns detected in server name or args");
  }

  if (WRITE_PATTERNS.test(searchText)) {
    score -= 20;
    details.push("Write operation patterns detected");
  }

  if (details.length === 0) {
    details.push("No high-risk permission patterns detected");
  }

  return {
    dimension: "permissions",
    score: Math.max(0, score),
    weight: 0.3,
    details,
  };
}
