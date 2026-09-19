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
  registrationStartDate?: string;
  registrationEndDate?: string;
  resultsPublishDate?: string;
  showResultsToStudent?: boolean;
  retakeAllowed?: boolean; // Qayta topshirishga ruxsat (Ha / Yo'q)
  maxRetakeAttempts?: number; // Maksimal urinishlar soni (1, 2, 3...)
  allowedLanguages?: string[];
  targetGrades?: number[];
  questions?: any[];
  
  // Certificate & Anti-Cheat
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

export const INITIAL_NATIONAL_EXAMS: NationalExamItem[] = [
  {
    id: 'NC-101',
    title: 'Kimyo fanidan Milliy Sertifikat Sinovi',
    subject: 'Kimyo',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
    price: 175000,
    status: 'ochiq',
    isPinned: true,
    startDate: '2025-09-25 09:00',
    endDate: '2025-09-25 12:30',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'BMBA davlat standarti bo\'yicha nazariy test va yozma ish topshiriqlari. Rasch modeli asosida 75 ballik standart shkala bo\'yicha baholanadi.',
    organizer: 'BMBA & Next Olymp Ilmiy Ekspertlar Markazi',
    calculationMethod: 'rasch',
    maxScore: 75,
    aThreshold: 65,
    specType: 'spec_1',
    durationMinutes: 150,
    totalQuestions: 43
  },
  {
    id: 'NC-102',
    title: 'Matematika fanidan Milliy Sertifikat Sinovi',
    subject: 'Matematika',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    price: 175000,
    status: 'ochiq',
    isPinned: true,
    startDate: '2025-09-26 09:00',
    endDate: '2025-09-26 12:30',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Algebra, geometriya va matematik tahlil bo\'yicha ochiq va yopiq testlar. Tabaqalashtirilgan Rasch shkalasida A+, A, B+, B sertifikatlar taqdim etiladi.',
    organizer: 'BMBA & Next Olymp Ilmiy Ekspertlar Markazi',
    calculationMethod: 'rasch',
    maxScore: 75,
    aThreshold: 65,
    specType: 'spec_1',
    durationMinutes: 150,
    totalQuestions: 43
  },
  {
    id: 'NC-103',
    title: 'Biologiya fanidan Milliy Sertifikat Sinovi',
    subject: 'Biologiya',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=600&q=80',
    price: 175000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-09-27 10:00',
    endDate: '2025-09-27 13:30',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Umumiy biologiya, genetika, sitologiya va ekologiya bo\'yicha rasmiy sertifikat sinovi. Rasch formulasi orqali ob\'ektiv baholanadi.',
    organizer: 'BMBA & Next Olymp Ilmiy Ekspertlar Markazi',
    calculationMethod: 'rasch',
    maxScore: 75,
    aThreshold: 65,
    specType: 'spec_2',
    durationMinutes: 150,
    totalQuestions: 43
  },
  {
    id: 'NC-104',
    title: 'Fizika fanidan Milliy Sertifikat Sinovi',
    subject: 'Fizika',
    format: 'offline',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    price: 175000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-09-28 09:00',
    endDate: '2025-09-28 12:30',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Mexanika, termodinamika va elektrodinamika masalalari. Oflayn markazlarda proktoring va BMBA Rasch baholash mezonlari bilan o\'tkaziladi.',
    location: 'Toshkent sh., Yunusobod t., Amir Temur 108',
    organizer: 'BMBA & Next Olymp Ilmiy Ekspertlar Markazi',
    calculationMethod: 'rasch',
    maxScore: 75,
    aThreshold: 65,
    specType: 'spec_2',
    durationMinutes: 150,
    totalQuestions: 43
  },
  {
    id: 'NC-105',
    title: 'Ona Tili va Adabiyot Milliy Sertifikat Sinovi',
    subject: 'Ona tili',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    price: 175000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-09-29 09:00',
    endDate: '2025-09-29 12:30',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Grammatika, matn tahlili va esse yozma ish. 24 xom balldan 75 standart ballga BMBA normativ konversiyasi va Rasch tahlili.',
    organizer: 'BMBA & Next Olymp Ilmiy Ekspertlar Markazi',
    calculationMethod: 'rasch',
    maxScore: 75,
    aThreshold: 65,
    specType: 'lang',
    durationMinutes: 150,
    totalQuestions: 45
  },
  {
    id: 'NC-106',
    title: 'Ingliz Tili Milliy Sertifikat Sinovi (CEFR / BMBA)',
    subject: 'Ingliz tili',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    price: 175000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-09-30 09:00',
    endDate: '2025-09-30 13:00',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Listening, Reading, Writing va Speaking bo\'limlari. Rasch modeli asosida 75 ballik standart shkalada B2, C1 darajali milliy sertifikat.',
    organizer: 'BMBA & Next Olymp Ilmiy Ekspertlar Markazi',
    calculationMethod: 'rasch',
    maxScore: 75,
    aThreshold: 65,
    specType: 'lang',
    durationMinutes: 180,
    totalQuestions: 50
  }
];
