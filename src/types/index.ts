export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: Role;
  grade?: number;          // 1-11
  region?: string;
  district?: string;
  school?: string;
  avatarUrl?: string;
  createdAt: string;
  parentConsent?: boolean;
}

export type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 'informatics' | 'other';
export type OlympiadStatus = 'upcoming' | 'active' | 'finished';

export interface Round {
  id: string;
  name: string; // e.g. "Saralash bosqichi", "Final"
  startDate: string;
  endDate: string;
  durationMinutes: number;
  passingScore: number;
}

export interface Prize {
  place: number | string;
  title: string;
  reward: string;
}

export interface Olympiad {
  id: string;
  title: string;
  subject: Subject;
  description: string;
  startDate: string;
  endDate: string;
  status: OlympiadStatus;
  durationMinutes: number;
  totalQuestions: number;
  maxScore: number;
  rounds: Round[];
  eligibility: {
    grades: number[];
    regions?: string[];
  };
  prizes: Prize[];
  participantsCount: number;
  imageUrl?: string;
  organizer: string;
}

export type QuestionType = 'multiple_choice' | 'open_text' | 'file_upload' | 'code';

export interface Question {
  id: string;
  olympiadId: string;
  roundId: string;
  type: QuestionType;
  content: string;
  imageUrl?: string;         // Savol uchun rasm URL / Base64
  options?: string[];        // multiple_choice uchun
  optionImages?: string[];   // Variantlar uchun rasmlar [A, B, C, D]
  correctAnswer?: string;    // To'g'ri javob ("A", "B", "C", "D" yoki ochiq matn javobi)
  points: number;
  timeLimit?: number;       // soniyada
  order: number;
  codeLanguage?: string;
  codeTemplate?: string;
}

export interface Submission {
  id: string;
  userId: string;
  olympiadId: string;
  questionId: string;
  answer: string | string[];
  submittedAt: string;
  score?: number;
  status: 'pending' | 'correct' | 'incorrect' | 'partial';
}

export type CertificateType = 'participation' | 'achievement' | 'winner';

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  olympiadId: string;
  olympiadTitle: string;
  subject: Subject;
  type: CertificateType;
  issuedAt: string;
  fileUrl: string;
  verificationCode: string;
  score: number;
  maxScore: number;
  rank: number;
  totalParticipants: number;
  grade: number;
  school?: string;
  region?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  grade: number;
  region: string;
  school: string;
  score: number;
  penaltyTime: number; // soniyalarda (informatics format)
  submittedAt: string;
  status: 'verified' | 'pending_review' | 'disqualified';
}
