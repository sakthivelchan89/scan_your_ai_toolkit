export interface StackCategory {
  name: string;
  emoji: string;
  items: StackItem[];
}

export interface StackItem {
  name: string;
  version?: string;
  type: "ide" | "mcp" | "agent" | "model" | "sdk" | "key";
}

export interface ComplexityScore {
  total: number;          // 1-100
  breakdown: {
    toolDiversity: number;   // 0-25
    mcpServers: number;      // 0-25
    agentUsage: number;      // 0-25
    sdkBreadth: number;      // 0-25
  };
  level: "beginner" | "practitioner" | "advanced" | "expert";
}

export interface AIStackProfile {
  generatedAt: string;
  categories: StackCategory[];
  complexity: ComplexityScore;
  stats: {
    totalTools: number;
    mcpServerCount: number;
    agentFrameworkCount: number;
    localModelCount: number;
    apiKeyCount: number;
  };
}
