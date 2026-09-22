import { AntiCheatConfig, CertificateConfig } from '../types';

export interface OlympiadItem {
  id: string;
  title: string;
  subject: string;
  format: 'online' | 'offline';
  image: string;
  price: number; // UZS
  status: 'ochiq' | 'yopiq';
  isPinned: boolean;
  isAlwaysOpen?: boolean; // Doimiy ochiq (24/7 cheklovsiz test topshirish)
  startDate: string; // Testni boshlash vaqti
  endDate: string; // Testni tugash vaqti
  registrationStartDate?: string; // Ro'yxatdan o'tish boshlanish vaqti
  registrationEndDate?: string; // Ro'yxatdan o'tish yopilish vaqti
  registeredCount: number;
  submittedCount: number;
  paidCount: number;
  totalRevenue: number;
  description: string;
  location?: string;
  organizer?: string;
  durationMinutes?: number; // Ajratilgan vaqt (daqiqada)
  totalQuestions?: number; // Savollar soni

  // Extended properties for detailed editing page
  allowedLanguages?: string[];
  targetGrades?: number[];
  paymentMethods?: ('naqd' | 'karta' | 'hamyon')[];
  separatePricesEnabled?: boolean;
  onlinePrice?: number;
  offlinePrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  freeForPackageId?: string;
  isFreeForAll?: boolean;
  showResultsToStudent?: boolean;
  aiAnalysisEnabled?: boolean;
  resultsPublishDate?: string;
  retakeAllowed?: boolean;
  maxRetakeAttempts?: number;
  questions?: any[];
  certificateConfig?: CertificateConfig;
  antiCheatConfig?: AntiCheatConfig;
}

export const INITIAL_OLYMPIADS: OlympiadItem[] = [];
