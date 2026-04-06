import type { ParsedMCPServer, DimensionScore } from "../types.js";

const DB_PATTERNS = /postgres|mysql|mongo|redis|sqlite|database|db/i;
const PII_PATTERNS = /user|customer|patient|email|person|profile|identity/i;
const PROD_PATTERNS = /prod|production|live|staging/i;
const CRED_ENV_PATTERNS = /password|secret|token|key|credential|auth/i;

export function scoreSensitivity(server: ParsedMCPServer): DimensionScore {
  const searchText = [server.name, ...server.args].join(" ").toLowerCase();
  let score = 100;
  const details: string[] = [];

  if (DB_PATTERNS.test(searchText)) {
    score -= 30;
    details.push("Database access patterns detected");
  }

  if (PII_PATTERNS.test(searchText)) {
    score -= 25;
    details.push("PII data patterns detected");
  }

  if (PROD_PATTERNS.test(searchText)) {
    score -= 20;
    details.push("Production environment indicators detected");
  }

  const envKeys = Object.keys(server.env).join(" ").toLowerCase();
  if (CRED_ENV_PATTERNS.test(envKeys)) {
    score -= 15;
    details.push("Credential/sensitive env vars present");
  }

  if (details.length === 0) {
    details.push("No sensitive data patterns detected");
  }

  return {
    dimension: "sensitivity",
    score: Math.max(0, score),
    weight: 0.25,
    details,
  };
}
