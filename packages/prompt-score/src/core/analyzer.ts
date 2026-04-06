import type { PromptAnalysis, PromptDimension } from "./types.js";
import {
  scoreSpecificity,
  scoreStructure,
  scoreEfficiency,
  scoreModelFit,
  scoreBestPractices,
  detectAntiPatterns,
} from "./rules.js";

function gradeFromScore(score: number): PromptAnalysis["grade"] {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

export function analyzePrompt(prompt: string): PromptAnalysis {
  if (!prompt || prompt.trim().length === 0) {
    return {
      prompt,
      totalScore: 0,
      grade: "F",
      dimensions: [],
      antiPatterns: ["Empty prompt"],
      suggestions: ["Write a prompt first"],
    };
  }

  const dimensionConfigs: { name: string; weight: number; scorer: (p: string) => { score: number; feedback: string } }[] = [
    { name: "Specificity", weight: 0.25, scorer: scoreSpecificity },
    { name: "Structure", weight: 0.25, scorer: scoreStructure },
    { name: "Efficiency", weight: 0.15, scorer: scoreEfficiency },
    { name: "Model Fit", weight: 0.10, scorer: scoreModelFit },
    { name: "Best Practices", weight: 0.15, scorer: scoreBestPractices },
  ];

  const dimensions: PromptDimension[] = dimensionConfigs.map(({ name, weight, scorer }) => {
    const result = scorer(prompt);
    return { name, score: result.score, weight, feedback: result.feedback };
  });

  const antiPatterns = detectAntiPatterns(prompt);

  const antiPatternScore = Math.max(0, 100 - antiPatterns.length * 30);
  dimensions.push({
    name: "Anti-Patterns",
    score: antiPatternScore,
    weight: 0.10,
    feedback: antiPatterns.length === 0 ? "No anti-patterns detected" : `${antiPatterns.length} anti-pattern(s) found`,
  });

  const totalScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  const suggestions = dimensions
    .filter((d) => d.score < 60)
    .map((d) => d.feedback)
    .filter((f) => f && !f.includes("Good") && !f.includes("Well") && !f.includes("Efficient") && !f.includes("No anti"));

  return {
    prompt,
    totalScore,
    grade: gradeFromScore(totalScore),
    dimensions,
    antiPatterns,
    suggestions,
  };
}
