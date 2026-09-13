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

export const MOCK_QUESTIONS: Record<string, Question[]> = {};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [];

export const MOCK_CERTIFICATES: Certificate[] = [];
