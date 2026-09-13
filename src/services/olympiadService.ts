import { Olympiad, Question, LeaderboardEntry, Subject, OlympiadStatus } from '../types';
import { MOCK_OLYMPIADS, MOCK_QUESTIONS } from './mockData';
import { useLeaderboardStore } from '../store/useLeaderboardStore';

export interface OlympiadFilter {
  subject?: Subject | 'all';
  grade?: number | 'all';
  status?: OlympiadStatus | 'all';
  search?: string;
}

export const olympiadService = {
  async getOlympiads(filter?: OlympiadFilter): Promise<Olympiad[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let list = [...MOCK_OLYMPIADS];

    if (filter) {
      if (filter.subject && filter.subject !== 'all') {
        list = list.filter((o) => o.subject === filter.subject);
      }
      if (filter.status && filter.status !== 'all') {
        list = list.filter((o) => o.status === filter.status);
      }
      if (filter.grade && filter.grade !== 'all') {
        const gradeNum = Number(filter.grade);
        list = list.filter((o) => o.eligibility.grades.includes(gradeNum));
      }
      if (filter.search && filter.search.trim() !== '') {
        const query = filter.search.toLowerCase();
        list = list.filter((o) =>
          o.title.toLowerCase().includes(query) ||
          o.description.toLowerCase().includes(query)
        );
      }
    }
    return list;
  },

  async getOlympiadById(id: string): Promise<Olympiad | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const found = MOCK_OLYMPIADS.find((o) => o.id === id);
    return found || null;
  },

  async getQuestionsByOlympiadId(olympiadId: string): Promise<Question[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_QUESTIONS[olympiadId] || MOCK_QUESTIONS['olymp-math-2026'];
  },

  async getLeaderboard(_olympiadId?: string): Promise<LeaderboardEntry[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const entries = useLeaderboardStore.getState().entries;
    return entries.map((e, idx) => ({
      id: e.id,
      rank: e.nationalRank || idx + 1,
      userId: e.userId,
      userName: e.userName,
      avatarUrl: e.avatarUrl,
      grade: e.grade,
      region: e.region,
      school: e.school,
      score: e.totalXP,
      penaltyTime: 120,
      submittedAt: e.lastActive,
      status: 'verified' as const
    }));
  },

  async createOlympiad(olympiadData: Partial<Olympiad>): Promise<Olympiad> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const created: Olympiad = {
      id: `olymp-${Date.now()}`,
      title: olympiadData.title || 'Yangi Musobaqa',
      subject: olympiadData.subject || 'math',
      description: olympiadData.description || '',
      startDate: olympiadData.startDate || new Date().toISOString(),
      endDate: olympiadData.endDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'upcoming',
      durationMinutes: olympiadData.durationMinutes || 90,
      totalQuestions: 10,
      maxScore: 100,
      rounds: [],
      eligibility: { grades: [5, 6, 7, 8, 9, 10, 11] },
      prizes: [],
      participantsCount: 0,
      organizer: 'Next Olymp Admin',
    };
    MOCK_OLYMPIADS.unshift(created);
    return created;
  }
};
