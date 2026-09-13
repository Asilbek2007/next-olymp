export interface LeaderboardUserEntry {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  region: string; // Viloyat
  district: string; // Tuman
  school: string;
  grade: number; // Sinf (1..11)
  baseScore: number; // Olimpiadalardan yig'ilgan asosiy ball
  bonusPoints: number; // Top o'rinlar va faollik uchun berilgan bonus XP (+500, +300)
  cheatingPenalty: number; // Cheating / Proktorining jarima ballari (-200, -500)
  totalXP: number; // baseScore + bonusPoints - cheatingPenalty
  nationalRank: number; // Respublika o'rni
  regionRank: number; // Viloyat o'rni
  districtRank: number; // Tuman o'rni
  testsCompletedCount: number;
  accuracyRate: number; // %
  lastActive: string;
}

// Production initial state: Empty real list (populated by real participants only)
export const INITIAL_LEADERBOARD_ENTRIES: LeaderboardUserEntry[] = [];
