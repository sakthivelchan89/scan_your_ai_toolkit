import { analyzePrompt, improvePrompt } from "@maiife-ai-pub/prompt-score";
import { recordScore } from "../core/gamification.js";
import { loadCraftStore } from "../core/store.js";
import { getCurrentChallenge } from "../core/challenges.js";

export async function promptCraftScore(params: { prompt: string }) {
  const analysis = analyzePrompt(params.prompt);
  const gameResult = recordScore(analysis.totalScore);
  return { analysis, ...gameResult };
}

export async function promptCraftImprove(params: { prompt: string }) {
  return improvePrompt(params.prompt);
}

export async function promptCraftProfile() { return loadCraftStore().profile; }
export async function promptCraftChallenge() { return getCurrentChallenge(); }
