export interface OlympiadItem {
  id: string;
  title: string;
  subject: string;
  format: 'online' | 'offline';
  image: string;
  price: number; // UZS
  status: 'ochiq' | 'yopiq';
  isPinned: boolean;
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
  allowedLanguages?: string[]; // e.g. ["O'zbek tili", "Rus tili", "Ingliz tili", "Qoraqalpoq tili", "Tojik tili"]
  targetGrades?: number[]; // e.g. [5, 6, 7, 8, 9, 10, 11]
  paymentMethods?: ('naqd' | 'karta' | 'hamyon')[];
  separatePricesEnabled?: boolean;
  onlinePrice?: number;
  offlinePrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  freeForPackageId?: string; // e.g. "PKG-003", "PKG-004", "all"
  isFreeForAll?: boolean; // Hamma uchun BEPUL
  showResultsToStudent?: boolean; // Test yakunlangach o'quvchiga natijani ko'rsatish/yashirish
  resultsPublishDate?: string; // Natijalarni e'lon qilish sanasi va vaqti
  aiAnalysisEnabled?: boolean; // AI orqali xato qilingan savollarni tahlil qilish va kamchiliklarni ko'rsatish
  retakeAllowed?: boolean; // Qayta topshirishga ruxsat (Ha / Yo'q)
  maxRetakeAttempts?: number; // Maksimal urinishlar soni (1, 2, 3...)
  questions?: any[]; // Musobaqaga biriktirilgan savollar
  
  // Certificate & Anti-Cheat configs
  certificateConfig?: {
    fontFamily: 'serif' | 'sans' | 'cinzel' | 'playfair' | 'montserrat' | 'greatvibes';
    subjectName?: string;
    isMultiRound?: boolean;
    awardCriteria?: 'top_rank' | 'min_score' | 'both';
    topRankLimit?: number;
    minScoreLimit?: number;
    winnerText?: string;
    participantText?: string;
    round1PassedText?: string;
    round1FailedText?: string;
    signatureName?: string;
    signatureRole?: string;
  };
  antiCheatConfig?: {
    enabled: boolean;
    blockTabSwitch: boolean;
    blockCopyPaste: boolean;
    requireFullscreen: boolean;
    requireWebcam: boolean;
    requireMic: boolean;
    blockDevTools: boolean;
    maxViolationsAllowed: number;
    blockDuplicateIP?: boolean;
    heartbeatIntervalSec?: number;
    cameraFaceSnapshotEnabled?: boolean;
    snapshotOnMultipleFaces?: boolean;
    snapshotOnNoFace?: boolean;
  };
}

export const INITIAL_OLYMPIADS: OlympiadItem[] = [];
