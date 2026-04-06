import type { EvalResult, EvalScore, Rubric, JudgeFn } from "./types.js";

function gradeFromScore(score: number): EvalResult["grade"] {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

function heuristicJudge(output: string, dimension: string): { score: number; reasoning: string } {
  const len = output.length;
  const hasStructure = /^##?\s|^\*\*|^- \[/m.test(output);
  const hasList = /^[-*]\s/m.test(output);
  const hasDetail = len > 200;

  let score = 30;
  const reasons: string[] = [];

  if (hasDetail) { score += 20; reasons.push("Detailed content"); }
  if (hasStructure) { score += 20; reasons.push("Well structured"); }
  if (hasList) { score += 15; reasons.push("Uses lists/criteria"); }
  if (len > 500) { score += 15; reasons.push("Comprehensive"); }

  if (dimension.toLowerCase().includes("completeness") || dimension.toLowerCase().includes("coverage")) {
    if (len < 50) { score = Math.min(score, 20); reasons.push("Too short for completeness"); }
  }
  if (dimension.toLowerCase().includes("clarity") || dimension.toLowerCase().includes("readability")) {
    if (hasStructure) { score += 10; }
  }
  if (dimension.toLowerCase().includes("acceptance") || dimension.toLowerCase().includes("criteria")) {
    if (/\[[ x]\]/.test(output)) { score += 20; reasons.push("Has checkboxes"); }
    else if (!hasList) { score = Math.min(score, 30); reasons.push("No testable criteria"); }
  }
  if (dimension.toLowerCase().includes("tone")) {
    if (!/\b(stupid|terrible|awful|idiot)\b/i.test(output)) { score += 10; reasons.push("Professional tone"); }
  }
  if (dimension.toLowerCase().includes("action") || dimension.toLowerCase().includes("cta")) {
    if (/\b(please|next step|action|deadline|by|before)\b/i.test(output)) { score += 15; reasons.push("Has call to action"); }
  }

  return { score: Math.min(100, score), reasoning: reasons.join("; ") || "Baseline score" };
}

const defaultJudge: JudgeFn = async ({ output, rubric }) => {
  return rubric.dimensions.map((dim) => {
    const { score, reasoning } = heuristicJudge(output, dim.name);
    return { dimension: dim.name, score, reasoning };
  });
};

export async function evalScore(params: {
  output: string; rubric: Rubric; context?: string; judge?: JudgeFn;
}): Promise<EvalResult> {
  const judge = params.judge ?? defaultJudge;
  const scores = await judge({ output: params.output, rubric: params.rubric, context: params.context });

  const totalScore = Math.round(
    params.rubric.dimensions.reduce((sum, dim) => {
      const dimScore = scores.find((s) => s.dimension === dim.name);
      return sum + (dimScore?.score ?? 0) * dim.weight;
    }, 0)
  );

  return {
    rubric: params.rubric.name, totalScore, grade: gradeFromScore(totalScore),
    scores, output: params.output, timestamp: new Date().toISOString(),
  };
}
