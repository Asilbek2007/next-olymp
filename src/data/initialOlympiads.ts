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

export const INITIAL_OLYMPIADS: OlympiadItem[] = [
  {
    id: 'OLY-101',
    title: 'Respublika Matematika Olimpiadasi',
    subject: 'Matematika',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    price: 35000,
    status: 'ochiq',
    isPinned: true,
    startDate: '2025-09-15 10:00',
    endDate: '2025-09-15 18:00',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Respublika o\'quvchilari o\'rtasidagi mantiqiy va akademik matematika musobaqasi.',
    organizer: 'NextOlymp Akademik Kengashi'
  },
  {
    id: 'OLY-102',
    title: 'Ingliz Tili Milliy Saralash Testi',
    subject: 'Ingliz tili',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    price: 29000,
    status: 'ochiq',
    isPinned: true,
    startDate: '2025-09-20 09:00',
    endDate: '2025-09-20 17:00',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Grammatika, Listening va Reading bo\'yicha xalqaro standartdagi sinov testi.',
    organizer: 'Xalqaro Tillari Markazi'
  },
  {
    id: 'OLY-103',
    title: 'Toshkent Viloyat Fizika Akademik Musobaqasi',
    subject: 'Fizika',
    format: 'offline',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
    price: 45000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-09-25 10:00',
    endDate: '2025-09-25 14:00',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Amaliy laboratoriya va nazariy masalalar yechish musobaqasi.',
    location: 'Toshkent shahri, 1-sonli Aniq Fanlar Litseyi',
    organizer: 'Fizika-Matematika Jamiyati'
  },
  {
    id: 'OLY-104',
    title: 'Biologiya va Ekologiya Kuzgi Chempionati',
    subject: 'Biologiya',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
    price: 25000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-09-28 11:00',
    endDate: '2025-09-28 16:00',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Botanika, zoologiya va anatomiya fanlaridan chuqurlashtirilgan olimpiada.',
    organizer: 'Tabiiy Fanlar Akademiyasi'
  },
  {
    id: 'OLY-105',
    title: 'Samarqand IT & Dasturlash Offline Turniri',
    subject: 'Informatika',
    format: 'offline',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    price: 50000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-10-20 09:00',
    endDate: '2025-10-20 18:00',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Algoritmlash va C++/Python tillarida olimp masalalarini yechish.',
    location: 'Samarqand shahri, IT Park Binosi',
    organizer: 'Samarqand Dasturchilar Klubi'
  },
  {
    id: 'OLY-106',
    title: 'Kimyo Fanidan Yillik Chempionat',
    subject: 'Kimyo',
    format: 'online',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    price: 30000,
    status: 'ochiq',
    isPinned: false,
    startDate: '2025-10-10 10:00',
    endDate: '2025-10-10 16:00',
    registeredCount: 0,
    submittedCount: 0,
    paidCount: 0,
    totalRevenue: 0,
    description: 'Organik va anorganik kimyo masalalari yechish musobaqasi.',
    organizer: 'Kimyo Texnologiya Instituti'
  }
];
