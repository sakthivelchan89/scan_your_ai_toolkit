export interface RuleResult {
  score: number;
  feedback: string;
}

export function scoreSpecificity(prompt: string): RuleResult {
  let score = 0;
  const feedback: string[] = [];
  if (prompt.length > 200) { score += 20; } else if (prompt.length > 100) { score += 10; }
  else { feedback.push("Prompt is very short — add more detail"); }
  if (/\b(must|should|exactly|at least|no more than|between \d+ and \d+)\b/i.test(prompt)) {
    score += 25;
  } else {
    feedback.push("Add measurable criteria (e.g., 'must handle at least 3 edge cases')");
  }
  if (/\b(function|class|API|endpoint|component|module|interface|type)\b/i.test(prompt)) { score += 20; }
  if (/\b(because|context|background|given that|assuming)\b/i.test(prompt)) { score += 15; }
  if (/\b(TypeScript|Python|React|Node|SQL|JavaScript|Rust|Go)\b/i.test(prompt)) { score += 20; }
  return { score: Math.min(100, score), feedback: feedback.join("; ") || "Good specificity" };
}

export function scoreStructure(prompt: string): RuleResult {
  let score = 0;
  const feedback: string[] = [];
  if (/^##?\s/m.test(prompt)) { score += 25; }
  else if (/\n\n/.test(prompt)) { score += 10; }
  else { feedback.push("Add sections (## Task, ## Requirements, ## Output Format)"); }
  if (/\b(you are|act as|role:|system:)\b/i.test(prompt)) { score += 25; }
  else { feedback.push("Add a role definition (e.g., 'You are a senior developer')"); }
  if (/\b(output format|return|respond with|format:|json|markdown|xml)\b/i.test(prompt)) { score += 25; }
  else { feedback.push("Specify the expected output format"); }
  if (/\b(example|e\.g\.|for instance|input:|output:)\b/i.test(prompt)) { score += 25; }
  else { feedback.push("Add examples to clarify expectations"); }
  return { score: Math.min(100, score), feedback: feedback.join("; ") || "Well structured" };
}

export function scoreEfficiency(prompt: string): RuleResult {
  let score = 100;
  const feedback: string[] = [];
  if (/\b(please|kindly|I would like you to|could you)\b/i.test(prompt)) {
    score -= 15;
    feedback.push("Remove filler words (please, kindly) — direct instructions are more effective");
  }
  const words = prompt.toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();
  for (const w of words) {
    if (w.length > 4) wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }
  const repeated = [...wordFreq.entries()].filter(([_, c]) => c > 3);
  if (repeated.length > 2) {
    score -= 20;
    feedback.push("Reduce repetition — some words appear 4+ times");
  }
  if (prompt.length > 3000) {
    score -= 15;
    feedback.push("Prompt is very long — consider breaking into smaller steps");
  }
  return { score: Math.max(0, score), feedback: feedback.join("; ") || "Efficient prompt" };
}

export function scoreModelFit(prompt: string): RuleResult {
  let score = 50;
  const feedback: string[] = [];
  if (/<\w+>/.test(prompt)) { score += 20; }
  if (/\bjson\b/i.test(prompt)) { score += 15; }
  if (/\b(step by step|think through|reason|let's think)\b/i.test(prompt)) {
    score += 15;
  } else {
    feedback.push("Consider adding chain-of-thought instruction for complex tasks");
  }
  return { score: Math.min(100, score), feedback: feedback.join("; ") || "Good model fit" };
}

export function scoreBestPractices(prompt: string): RuleResult {
  let score = 0;
  const feedback: string[] = [];
  if (/\b(example|input:|output:|given:|expected:)\b/i.test(prompt)) { score += 25; }
  else { feedback.push("Add few-shot examples"); }
  if (/\b(constraint|limit|must not|do not|avoid|never)\b/i.test(prompt)) { score += 25; }
  else { feedback.push("Add constraints (what NOT to do)"); }
  if (/\b(you are|act as|expert|senior|specialist)\b/i.test(prompt)) { score += 25; }
  if (/\b(return|output|respond|format)\b/i.test(prompt)) { score += 25; }
  return { score: Math.min(100, score), feedback: feedback.join("; ") || "Follows best practices" };
}

export function detectAntiPatterns(prompt: string): string[] {
  const patterns: string[] = [];
  if (/\b(creative|flexible)\b/i.test(prompt) && /\b(precise|exact|strict)\b/i.test(prompt)) {
    patterns.push("contradictory instructions: asking for both creativity and precision");
  }
  if (/\b(best|perfect|amazing|awesome|great)\b/i.test(prompt) && prompt.length < 100) {
    patterns.push("Vague quality demands without specific criteria");
  }
  if (prompt.length > 0 && !/\b(write|create|generate|analyze|explain|fix|review|build|implement)\b/i.test(prompt)) {
    patterns.push("No clear action verb — unclear what the model should do");
  }
  if (/\b(ignore previous|forget|disregard|override)\b/i.test(prompt)) {
    patterns.push("Potential prompt injection pattern detected");
  }
  if (prompt.length < 50 && /\b(write|create|generate)\b/i.test(prompt)) {
    patterns.push("Prompt is too vague — missing context, constraints, and output format");
  }
  return patterns;
}
