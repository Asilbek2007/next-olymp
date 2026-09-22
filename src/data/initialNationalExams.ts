import { AntiCheatConfig, CertificateConfig } from '../types';

export interface NationalExamItem {
  id: string;
  title: string;
  subject: string;
  format: 'online' | 'offline';
  image: string;
  price: number; // UZS
  status: 'ochiq' | 'yopiq';
  isPinned: boolean;
  startDate: string;
  endDate: string;
  registeredCount: number;
  submittedCount: number;
  paidCount: number;
  totalRevenue: number;
  description: string;
  location?: string;
  organizer?: string;
  calculationMethod: 'rasch'; // Qat'iy Rasch modeli
  maxScore: number; // 75 ball
  aThreshold: number; // 65 ball (A daraja)
  specType: 'spec_1' | 'spec_2' | 'lang';
  durationMinutes: number;
  totalQuestions: number;
  paymentMethods?: ('naqd' | 'karta' | 'hamyon')[];
  isFreeForAll?: boolean;
  separatePricesEnabled?: boolean;
  onlinePrice?: number;
  offlinePrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  freeForPackageId?: string;
  isAlwaysOpen?: boolean; // Doimiy ochiq (24/7 cheklovsiz test topshirish)
  registrationStartDate?: string;
  registrationEndDate?: string;
  resultsPublishDate?: string;
  showResultsToStudent?: boolean;
  retakeAllowed?: boolean; // Qayta topshirishga ruxsat (Ha / Yo'q)
  maxRetakeAttempts?: number; // Maksimal urinishlar soni (1, 2, 3...)
  allowedLanguages?: string[];
  targetGrades?: number[];
  questions?: any[];
  certificateConfig?: CertificateConfig;
  antiCheatConfig?: AntiCheatConfig;
}

export const INITIAL_NATIONAL_EXAMS: NationalExamItem[] = [];
