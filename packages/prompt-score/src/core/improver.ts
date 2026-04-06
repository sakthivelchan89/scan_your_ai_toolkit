import type { PromptImprovement } from "./types.js";
import { analyzePrompt } from "./analyzer.js";

function addRoleIfMissing(prompt: string): { text: string; change?: string } {
  if (/\b(you are|act as|role:)\b/i.test(prompt)) return { text: prompt };
  return {
    text: `You are an expert assistant.\n\n${prompt}`,
    change: "Added role definition",
  };
}

function addStructureIfMissing(prompt: string): { text: string; change?: string } {
  if (/^##?\s/m.test(prompt)) return { text: prompt };
  return {
    text: `## Task\n${prompt}\n\n## Requirements\n- Complete the task as described above\n\n## Output Format\n- Provide a clear, well-structured response`,
    change: "Added section structure (Task, Requirements, Output Format)",
  };
}

function addConstraintsIfMissing(prompt: string): { text: string; change?: string } {
  if (/\b(must not|do not|avoid|constraint)\b/i.test(prompt)) return { text: prompt };
  return {
    text: `${prompt}\n\n## Constraints\n- Be concise and focused\n- Do not include unnecessary explanations`,
    change: "Added constraints section",
  };
}

function removeFiller(prompt: string): { text: string; change?: string } {
  const cleaned = prompt
    .replace(/\b(please|kindly|I would like you to|could you please)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (cleaned === prompt) return { text: prompt };
  return { text: cleaned, change: "Removed filler words for directness" };
}

export function improvePrompt(prompt: string): PromptImprovement {
  const beforeAnalysis = analyzePrompt(prompt);
  const changes: { dimension: string; description: string }[] = [];

  let improved = prompt;

  const steps = [
    { fn: removeFiller, dimension: "Efficiency" },
    { fn: addRoleIfMissing, dimension: "Structure" },
    { fn: addStructureIfMissing, dimension: "Structure" },
    { fn: addConstraintsIfMissing, dimension: "Best Practices" },
  ];

  for (const step of steps) {
    const result = step.fn(improved);
    if (result.change) {
      improved = result.text;
      changes.push({ dimension: step.dimension, description: result.change });
    }
  }

  const afterAnalysis = analyzePrompt(improved);

  return {
    original: prompt,
    improved,
    changes,
    scoreBefore: beforeAnalysis.totalScore,
    scoreAfter: afterAnalysis.totalScore,
  };
}
