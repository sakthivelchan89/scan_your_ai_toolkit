import type { RiskLevel, Finding } from "@maiife-ai-pub/shared";

export type ScanCategory = "ide" | "mcp" | "agents" | "keys" | "models" | "deps";
export type ScanScope = "full" | "quick" | "category";

export interface ScanConfig {
  scope: ScanScope;
  categories: ScanCategory[];
  path: string;
  includeProjectDeps: boolean;
}

export interface IDEFinding {
  name: string;
  version: string;
  path: string;
  status: "active" | "disabled" | "unknown";
}

export interface MCPServerFinding {
  name: string;
  transport: string;
  command?: string;
  args?: string[];
  permissions: string[];
  risk: RiskLevel;
  configSource: string;
}

export interface AgentFinding {
  name: string;
  version: string;
  project: string;
  language: "javascript" | "python" | "unknown";
}

export interface APIKeyFinding {
  vendor: string;
  location: string;
  variable: string;
  managed: boolean;
}

export interface LocalModelFinding {
  runtime: string;
  port: number;
  models: string[];
  status: "running" | "stopped" | "unknown";
}

export interface DepFinding {
  name: string;
  version: string;
  project: string;
  category: string;
}

export interface ProbeResult {
  ide: IDEFinding[];
  mcp: MCPServerFinding[];
  agents: AgentFinding[];
  keys: APIKeyFinding[];
  models: LocalModelFinding[];
  deps: DepFinding[];
}

export interface Scanner<T> {
  name: ScanCategory;
  scan(config: ScanConfig): Promise<T[]>;
}

export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  scope: "full",
  categories: ["ide", "mcp", "agents", "keys", "models", "deps"],
  path: process.cwd(),
  includeProjectDeps: true,
};
