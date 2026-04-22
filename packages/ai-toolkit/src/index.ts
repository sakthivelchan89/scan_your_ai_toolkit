/**
 * @maiife-ai-pub/ai-toolkit
 *
 * Meta-package that bundles all 15 Maiife AI Governance Toolkit packages.
 * Install once, get everything:
 *
 *   npm install @maiife-ai-pub/ai-toolkit
 */

export const packages = [
  "@maiife-ai-pub/probe",
  "@maiife-ai-pub/ai-stack",
  "@maiife-ai-pub/ai-journal",
  "@maiife-ai-pub/context-sync",
  "@maiife-ai-pub/cost",
  "@maiife-ai-pub/eval",
  "@maiife-ai-pub/mcp-audit",
  "@maiife-ai-pub/mcp-doctor",
  "@maiife-ai-pub/model-match",
  "@maiife-ai-pub/prompt-craft",
  "@maiife-ai-pub/prompt-score",
  "@maiife-ai-pub/shared",
  "@maiife-ai-pub/sub-audit",
  "@maiife-ai-pub/trace",
  "@maiife-ai-pub/weekly-ai-report",
] as const;

export const version = "0.2.2";
