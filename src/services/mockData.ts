import { Olympiad, Question, Certificate, LeaderboardEntry, User } from '../types';

export const MOCK_USERS: Record<string, User> = {
  student: {
    id: 'usr-student-1',
    email: 'student@nextolymp.uz',
    fullName: 'Foydalanuvchi',
    role: 'student',
    grade: 9,
    region: 'Toshkent shahri',
    school: 'Toshkent Maktabi',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
    parentConsent: true,
  },
  teacher: {
    id: 'usr-teacher-1',
    email: 'teacher@nextolymp.uz',
    fullName: 'O\'qituvchi',
    role: 'teacher',
    region: 'Samarqand viloyati',
    school: 'Samarqand Maktabi',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: 'usr-admin-1',
    email: 'admin@nextolymp.uz',
    fullName: 'Super Admin (Ega)',
    role: 'admin',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  },
};

// Initial state starts empty (0 items)
export const MOCK_OLYMPIADS: Olympiad[] = [];

export const DEFAULT_SAMPLE_QUESTIONS: Question[] = [];

export const MOCK_QUESTIONS: Record<string, Question[]> = {};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [];

export const MOCK_CERTIFICATES: Certificate[] = [];

export interface UserExamResult {
  id: string;
  userId: string;
  olympiadId: string;
  olympiadTitle: string;
  subject: string;
  format: 'online' | 'offline';
  completedAt: string;
  score: number;
  maxScore: number;
  percentage: number;
  rank: number;
  totalParticipants: number;
  certificateType: string;
  certificateCode?: string;
  status: 'published' | 'pending';
  timeSpentMinutes: number;
  totalQuestions: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  questionsAnalysis: Array<{
    questionNum: number;
    topic: string;
    questionText: string;
    points: number;
    options: string[];
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    aiExplanation?: string;
  }>;
}

export const MOCK_USER_RESULTS: UserExamResult[] = [];



