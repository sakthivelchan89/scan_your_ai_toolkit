import type { PlayerProfile, Badge } from "./types.js";
import { loadCraftStore, saveCraftStore } from "./store.js";

const XP_PER_LEVEL = 100;

export function getLevelName(level: number): string {
  if (level >= 16) return "Expert";
  if (level >= 11) return "Advanced";
  if (level >= 6) return "Practitioner";
  return "Beginner";
}

export function checkBadges(profile: PlayerProfile): Badge[] {
  const newBadges: Badge[] = [];
  const earned = new Set(profile.badges.map((b) => b.id));
  if (profile.totalScored >= 1 && !earned.has("first-score")) newBadges.push({ id: "first-score", name: "First Score", description: "Scored your first prompt", earnedAt: new Date().toISOString() });
  if (profile.totalScored >= 10 && !earned.has("ten-scores")) newBadges.push({ id: "ten-scores", name: "Dedicated", description: "Scored 10 prompts", earnedAt: new Date().toISOString() });
  if (profile.avgScore >= 80 && profile.totalScored >= 5 && !earned.has("high-avg")) newBadges.push({ id: "high-avg", name: "Quality Writer", description: "Average score above 80", earnedAt: new Date().toISOString() });
  if (profile.streak >= 7 && !earned.has("week-streak")) newBadges.push({ id: "week-streak", name: "Week Warrior", description: "7-day scoring streak", earnedAt: new Date().toISOString() });
  if (profile.level >= 10 && !earned.has("level-10")) newBadges.push({ id: "level-10", name: "Prompt Pro", description: "Reached level 10", earnedAt: new Date().toISOString() });
  return newBadges;
}

export function recordScore(score: number): { profile: PlayerProfile; xpGained: number; leveledUp: boolean; newBadges: Badge[] } {
  const craftStore = loadCraftStore();
  const profile = craftStore.profile;
  const xpGained = Math.round(score * 0.15) + 5;
  profile.xp += xpGained;
  profile.totalScored++;
  profile.avgScore = Math.round(((profile.avgScore * (profile.totalScored - 1)) + score) / profile.totalScored);
  const today = new Date().toISOString().split("T")[0];
  profile.scoreHistory.push({ date: today, score });
  if (profile.lastScoredDate) {
    const lastDate = new Date(profile.lastScoredDate);
    const diff = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) profile.streak++; else if (diff > 1) profile.streak = 1;
  } else { profile.streak = 1; }
  profile.lastScoredDate = today;
  let leveledUp = false;
  const newLevel = Math.min(20, Math.floor(profile.xp / XP_PER_LEVEL) + 1);
  if (newLevel > profile.level) { profile.level = newLevel; leveledUp = true; }
  const newBadges = checkBadges(profile);
  profile.badges.push(...newBadges);
  saveCraftStore(craftStore);
  return { profile, xpGained, leveledUp, newBadges };
}
