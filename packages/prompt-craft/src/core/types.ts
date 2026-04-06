export interface Badge { id: string; name: string; description: string; earnedAt?: string; }

export interface PlayerProfile {
  level: number; xp: number; streak: number; lastScoredDate?: string;
  totalScored: number; avgScore: number; badges: Badge[];
  scoreHistory: { date: string; score: number }[];
}

export interface CraftStore { profile: PlayerProfile; createdAt: string; }

export interface WeeklyChallenge { id: string; title: string; description: string; targetScore: number; taskType: string; }
