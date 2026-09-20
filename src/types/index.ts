export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: Role;
  gender?: 'male' | 'female';
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
  registrationStartDate?: string;
  registrationEndDate?: string;
  status: OlympiadStatus | 'ochiq' | 'yopiq';
  durationMinutes: number;
  totalQuestions: number;
  maxScore: number;
  rounds: Round[];
  eligibility: {
    grades: number[];
    regions?: string[];
  };
  targetGrades?: number[];
  allowedLanguages?: string[];
  retakeAllowed?: boolean;
  maxRetakeAttempts?: number;
  isFreeForAll?: boolean;
  isFree?: boolean;
  price?: number;
  antiCheatConfig?: AntiCheatConfig;
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

export type CertificateType = 'participation' | 'participant' | 'achievement' | 'winner' | 'round_passed' | 'round_failed';

export interface CertificateConfig {
  fontFamily: 'serif' | 'sans' | 'cinzel' | 'playfair' | 'montserrat' | 'greatvibes';
  subjectName?: string;
  isMultiRound?: boolean;
  awardCriteria?: 'top_rank' | 'min_score' | 'both'; // Qaysi mezon bo'yicha g'oliblik/o'rin beriladi
  topRankLimit?: number; // masalan top 10, 20, 30 ta o'quvchi
  minScoreLimit?: number; // masalan 70, 80 ball yoki 65 Rasch bali
  winnerText?: string; // e.g. "{name} {olympiad}da {rank}-o'rinni egalladi va g'oliblik diplomi bilan taqdirlanadi"
  participantText?: string; // e.g. "{name} {olympiad}da faol ishtirok etgani uchun minnatdorchilik bildiriladi"
  round1PassedText?: string; // e.g. "Tabriklaymiz! Siz 1-bosqichdan muvaffaqiyatli o'tdingiz va final bosqichiga yo'llanma oldingiz"
  round1FailedText?: string; // e.g. "Ishtirokingiz va intilishingiz uchun tashakkur! Bilimingiz yuqori, kelgusi musobaqalarda albatta zafar quchasiz"
  signatureName?: string;
  signatureRole?: string;
}

export interface AntiCheatConfig {
  enabled: boolean;
  blockTabSwitch?: boolean;
  blockCopyPaste?: boolean;
  requireFullscreen?: boolean;
  requireWebcam?: boolean;
  requireMic?: boolean;
  blockDevTools?: boolean;
  maxViolationsAllowed?: number;
  blockDuplicateIP?: boolean; // Bitta IP'dan 2 kishi kirishini cheklash
  heartbeatIntervalSec?: number; // 0.1, 0.5, 1, 2, 5 yoki 10 soniyada offline/online tekshiruv
  cameraFaceSnapshotEnabled?: boolean; // Kamera orqali nojo'ya harakatda rasmga olib yuborish
  snapshotOnMultipleFaces?: boolean; // 2 ta yuz ko'rinsa rasmga olish
  snapshotOnNoFace?: boolean; // Yuz ko'rinmay qolsa rasmga olish
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  olympiadId: string;
  olympiadTitle: string;
  subject: Subject | string;
  type: CertificateType;
  issuedAt: string;
  fileUrl?: string;
  verificationCode: string;
  score: number;
  maxScore: number;
  rank: number;
  totalParticipants: number;
  grade?: number;
  school?: string;
  region?: string;
  fontFamily?: string;
  customMessage?: string;
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
