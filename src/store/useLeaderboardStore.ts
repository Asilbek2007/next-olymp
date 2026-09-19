import { create } from 'zustand';
import { LeaderboardUserEntry, INITIAL_LEADERBOARD_ENTRIES } from '../data/initialLeaderboard';

const STORAGE_KEY = 'next_olymp_leaderboard_prod_v1';
const DELETED_USERS_KEY = 'next_olymp_deleted_user_ids';

interface LeaderboardStore {
  entries: LeaderboardUserEntry[];
  addOrUpdateUserScore: (data: {
    userId: string;
    userName: string;
    score: number;
    region?: string;
    district?: string;
    school?: string;
    grade?: number;
    avatarUrl?: string;
  }) => void;
  applyCheatingPenalty: (userId: string, penaltyXP: number, reason: string) => void;
  awardBonusPoints: (userId: string, bonusXP: number, reason: string) => void;
  removeUser: (userId: string) => void;
  resetLeaderboard: () => void;
}

const getDeletedUserIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set<string>();
};

const loadLeaderboardFromStorage = (): LeaderboardUserEntry[] => {
  const map = new Map<string, LeaderboardUserEntry>();
  const deletedIds = getDeletedUserIds();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((e: LeaderboardUserEntry) => {
          if (
            e &&
            e.userId &&
            !deletedIds.has(e.userId) &&
            !deletedIds.has(e.id) &&
            !e.userId.includes('admin') &&
            !e.userName?.toLowerCase().includes('admin')
          ) {
            map.set(e.userId, e);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error loading leaderboard from localStorage:', error);
  }

  // Scan all real submissions from localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submission_completed_') && !key.includes('_att_')) {
        const val = localStorage.getItem(key);
        if (val) {
          const sub = JSON.parse(val);
          if (
            sub &&
            sub.userId &&
            !deletedIds.has(sub.userId) &&
            !sub.userId.includes('admin') &&
            !sub.userName?.toLowerCase().includes('admin')
          ) {
            const score = Number(sub.score) || 0;
            const xp = score * 10;
            const pct = sub.percentage || 0;
            const existing = map.get(sub.userId);

            if (existing) {
              existing.baseScore = Math.max(existing.baseScore, score);
              existing.totalXP = Math.max(existing.totalXP, xp);
              existing.accuracyRate = Math.max(existing.accuracyRate, pct);
              if (sub.userName) existing.userName = sub.userName;
              if (sub.region) existing.region = sub.region;
              if (sub.school) existing.school = sub.school;
              if (sub.grade) existing.grade = sub.grade;
            } else {
              map.set(sub.userId, {
                id: `LB-${sub.userId}`,
                userId: sub.userId,
                userName: sub.userName || 'Ishtirokchi',
                avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
                region: sub.region || 'Toshkent shahri',
                district: 'Yunusobod tumani',
                school: sub.school || 'Prezident maktabi',
                grade: sub.grade || 9,
                baseScore: score,
                bonusPoints: 0,
                cheatingPenalty: 0,
                totalXP: xp,
                nationalRank: 1,
                regionRank: 1,
                districtRank: 1,
                testsCompletedCount: 1,
                accuracyRate: pct,
                lastActive: sub.completedAt ? new Date(sub.completedAt).toLocaleString() : new Date().toLocaleString(),
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error scanning submissions for leaderboard:', e);
  }

  const entries = Array.from(map.values()).filter(
    (e) => !deletedIds.has(e.userId) && !e.userId.includes('admin') && !e.userName?.toLowerCase().includes('admin')
  );
  if (entries.length === 0 && INITIAL_LEADERBOARD_ENTRIES.length > 0) {
    return INITIAL_LEADERBOARD_ENTRIES.filter((e) => !deletedIds.has(e.userId) && !e.userId.includes('admin'));
  }
  return entries;
};

// Re-calculate ranks for all scopes (Respublika, Viloyat, Tuman)
export const recalculateRanks = (list: LeaderboardUserEntry[]): LeaderboardUserEntry[] => {
  // Sort descending by totalXP
  const sorted = [...list].sort((a, b) => b.totalXP - a.totalXP);

  // Map National Ranks
  const updated = sorted.map((entry, idx) => ({
    ...entry,
    nationalRank: idx + 1
  }));

  // Map Region Ranks
  const regionMap: Record<string, LeaderboardUserEntry[]> = {};
  updated.forEach((e) => {
    if (!regionMap[e.region]) regionMap[e.region] = [];
    regionMap[e.region].push(e);
  });

  Object.values(regionMap).forEach((regionList) => {
    regionList.sort((a, b) => b.totalXP - a.totalXP);
    regionList.forEach((item, rIdx) => {
      item.regionRank = rIdx + 1;
    });
  });

  // Map District Ranks
  const districtMap: Record<string, LeaderboardUserEntry[]> = {};
  updated.forEach((e) => {
    const key = `${e.region}_${e.district}`;
    if (!districtMap[key]) districtMap[key] = [];
    districtMap[key].push(e);
  });

  Object.values(districtMap).forEach((distList) => {
    distList.sort((a, b) => b.totalXP - a.totalXP);
    distList.forEach((item, dIdx) => {
      item.districtRank = dIdx + 1;
    });
  });

  return updated;
};

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  entries: recalculateRanks(loadLeaderboardFromStorage()),

  addOrUpdateUserScore: (data) => {
    const current = get().entries;
    const existingIndex = current.findIndex(
      (e) => e.userId === data.userId || e.userName.toLowerCase() === data.userName.toLowerCase()
    );

    let updatedList: LeaderboardUserEntry[];

    if (existingIndex >= 0) {
      const existing = current[existingIndex];
      const newBase = existing.baseScore + data.score;
      const newTotal = Math.max(0, newBase + existing.bonusPoints - existing.cheatingPenalty);
      const updatedEntry: LeaderboardUserEntry = {
        ...existing,
        baseScore: newBase,
        totalXP: newTotal,
        testsCompletedCount: existing.testsCompletedCount + 1,
        lastActive: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      updatedList = [...current];
      updatedList[existingIndex] = updatedEntry;
    } else {
      const newEntry: LeaderboardUserEntry = {
        id: `LB-${Date.now()}`,
        userId: data.userId,
        userName: data.userName,
        avatarUrl: data.avatarUrl || '',
        region: data.region || 'Toshkent shahri',
        district: data.district || 'Yunusobod tumani',
        school: data.school || 'Maktab',
        grade: data.grade || 9,
        baseScore: data.score,
        bonusPoints: 0,
        cheatingPenalty: 0,
        totalXP: data.score,
        nationalRank: 1,
        regionRank: 1,
        districtRank: 1,
        testsCompletedCount: 1,
        accuracyRate: 92,
        lastActive: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      updatedList = [newEntry, ...current];
    }

    const ranked = recalculateRanks(updatedList);
    set({ entries: ranked });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
  },

  applyCheatingPenalty: (userId, penaltyXP) => {
    const current = get().entries;
    const updated = current.map((item) => {
      if (item.userId === userId || item.id === userId) {
        const newPenalty = (item.cheatingPenalty || 0) + penaltyXP;
        const totalXP = Math.max(0, item.baseScore + item.bonusPoints - newPenalty);
        return {
          ...item,
          cheatingPenalty: newPenalty,
          totalXP
        };
      }
      return item;
    });

    const ranked = recalculateRanks(updated);
    set({ entries: ranked });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
  },

  awardBonusPoints: (userId, bonusXP) => {
    const current = get().entries;
    const updated = current.map((item) => {
      if (item.userId === userId || item.id === userId) {
        const newBonus = (item.bonusPoints || 0) + bonusXP;
        const totalXP = Math.max(0, item.baseScore + newBonus - item.cheatingPenalty);
        return {
          ...item,
          bonusPoints: newBonus,
          totalXP
        };
      }
      return item;
    });

    const ranked = recalculateRanks(updated);
    set({ entries: ranked });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
  },

  removeUser: (userId) => {
    const current = get().entries;
    const updated = current.filter(
      (item) => item.userId !== userId && item.id !== userId && item.id !== `LB-${userId}`
    );
    const ranked = recalculateRanks(updated);
    set({ entries: ranked });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
  },

  resetLeaderboard: () => {
    const ranked = recalculateRanks(INITIAL_LEADERBOARD_ENTRIES);
    set({ entries: ranked });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
  }
}));
