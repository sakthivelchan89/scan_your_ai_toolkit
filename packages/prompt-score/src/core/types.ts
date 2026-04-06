export interface PromptDimension {
  name: string;
  score: number;       // 0-100
  weight: number;      // 0-1
  feedback: string;
}

export interface PromptAnalysis {
  prompt: string;
  totalScore: number;  // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  dimensions: PromptDimension[];
  antiPatterns: string[];
  suggestions: string[];
}

export interface PromptImprovement {
  original: string;
  improved: string;
  changes: { dimension: string; description: string }[];
  scoreBefore: number;
  scoreAfter: number;
}

export interface PromptTrackEntry {
  timestamp: string;
  prompt: string;
  score: number;
  grade: string;
  project?: string;
}

export interface PromptTrackStore {
  entries: PromptTrackEntry[];
  createdAt: string;
}
