import type { WeeklyChallenge } from "./types.js";

const CHALLENGES: WeeklyChallenge[] = [
  { id: "c1", title: "Code Review Master", description: "Write 3 prompts for code review tasks that score 80+", targetScore: 80, taskType: "code-review" },
  { id: "c2", title: "Clear Communicator", description: "Write 3 prompts for email drafting that score 75+", targetScore: 75, taskType: "email" },
  { id: "c3", title: "Bug Hunter", description: "Write 3 debugging prompts that score 80+", targetScore: 80, taskType: "debugging" },
  { id: "c4", title: "Doc Writer", description: "Write 3 documentation prompts that score 70+", targetScore: 70, taskType: "documentation" },
  { id: "c5", title: "SQL Wizard", description: "Write 3 SQL generation prompts that score 85+", targetScore: 85, taskType: "sql" },
];

export function getCurrentChallenge(): WeeklyChallenge {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return CHALLENGES[weekNumber % CHALLENGES.length];
}
