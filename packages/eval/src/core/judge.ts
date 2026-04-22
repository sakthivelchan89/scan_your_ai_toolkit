import type { JudgeFn, EvalScore, Rubric } from "./types.js";

function buildJudgePrompt(output: string, rubric: Rubric, context?: string): string {
  const dims = rubric.dimensions.map((d) =>
    `- **${d.name}** (weight ${d.weight})\n  ${d.description}\n  Excellent: ${d.scoringCriteria.excellent}\n  Good: ${d.scoringCriteria.good}\n  Fair: ${d.scoringCriteria.fair}\n  Poor: ${d.scoringCriteria.poor}`
  ).join("\n");

  return `You are an expert evaluator. Score the following output using the rubric provided.

Rubric: ${rubric.name}
${rubric.description}

Dimensions:
${dims}

${context ? `Context:\n${context}\n\n` : ""}Output to evaluate:
${output}

Respond with a JSON array only, no other text:
[{"dimension":"<name>","score":<0-100>,"reasoning":"<1-2 sentences>"}]

Score each dimension 0-100. Be calibrated: 80+ = excellent, 65-79 = good, 50-64 = fair, <50 = poor.`;
}

/**
 * Create an LLM judge using the Anthropic Claude API.
 * Requires an API key with messages access.
 *
 * @param apiKey - Anthropic API key (or process.env.ANTHROPIC_API_KEY if omitted)
 * @param model  - Claude model to use as judge (default: claude-haiku-4-5 for cost efficiency)
 */
export function createClaudeJudge(
  apiKey?: string,
  model = "claude-haiku-4-5-20251001",
): JudgeFn {
  return async ({ output, rubric, context }) => {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY ?? "";
    if (!key) throw new Error("Claude judge requires an Anthropic API key (ANTHROPIC_API_KEY)");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: buildJudgePrompt(output, rubric, context) }],
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Claude API error ${res.status}: ${err}`);
    }

    const json = await res.json() as { content?: Array<{ type: string; text: string }> };
    const text = json.content?.find((c) => c.type === "text")?.text ?? "[]";

    try {
      const parsed = JSON.parse(text) as Array<{ dimension: string; score: number; reasoning: string }>;
      return parsed.map((p): EvalScore => ({
        dimension: p.dimension,
        score: Math.max(0, Math.min(100, Math.round(p.score))),
        reasoning: p.reasoning,
      }));
    } catch {
      // If Claude returned malformed JSON, fall back to default score
      return rubric.dimensions.map((d) => ({
        dimension: d.name, score: 50, reasoning: "LLM judge response could not be parsed",
      }));
    }
  };
}
