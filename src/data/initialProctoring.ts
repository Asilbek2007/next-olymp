// src/data/initialProctoring.ts — Initial Live Proctoring Sessions and Anti-Cheat Violation Data
export interface ProctorStudentSession {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  olympiadId: string;
  olympiadTitle: string;
  region: string;
  district: string;
  school: string;
  grade: number;
  currentQuestion: number;
  totalQuestions: number;
  scoreXP: number;
  timeRemainingSec: number; // e.g., 3420 sec (57 mins)
  status: 'active' | 'warning' | 'paused' | 'disqualified';
  
  // Real-time AI Face & Vision metrics (TensorFlow)
  faceDetected: boolean;
  multipleFaces: boolean;
  eyeGazeScore: number; // 0..100 (100 = full screen focus)
  headPose: 'center' | 'left' | 'right' | 'down' | 'up';
  phoneDetected: boolean;
  bookDetected: boolean;
  
  // Audio metrics
  micActive: boolean;
  isListening: boolean; // Proctor is currently listening to student
  audioLevel: number; // 0..100
  audioAnomaly: boolean; // Voice / Whispering detected
  
  // Screen & Browser metrics
  tabSwitchesCount: number;
  copyPasteAttempts: number;
  fullscreenActive: boolean;
  secondMonitorDetected: boolean;
  devToolsAttempt: boolean;
  windowBlurCount: number;
  
  // Proctoring stats
  warningCount: number;
  penaltyXP: number;
  latestViolation?: string;
  latestViolationTime?: string;
}

export type ViolationType =
  | 'tab_switch'
  | 'copy_paste'
  | 'window_blur'
  | 'multiple_faces'
  | 'no_face'
  | 'looking_away'
  | 'phone_detected'
  | 'audio_anomaly'
  | 'devtools_open'
  | 'second_monitor'
  | 'fullscreen_exit';

export interface ProctorAlert {
  id: string;
  sessionId: string;
  userId: string;
  studentName: string;
  olympiadTitle: string;
  type: ViolationType;
  title: string;
  description: string;
  severity: 'past' | 'orta' | 'yuqori' | 'kritik';
  timestamp: string;
  snapshotUrl?: string;
  status: 'yangi' | 'korildi' | 'ogohlantirildi' | 'jarima_qollanildi' | 'bekor_qilindi';
  penaltyApplied?: number;
}

export interface AntiCheatRules {
  webcamRequired: boolean;
  micRequired: boolean;
  blockTabSwitch: boolean;
  blockCopyPaste: boolean;
  forceFullscreen: boolean;
  blockSecondMonitor: boolean;
  detectMultipleFaces: boolean;
  detectNoFace: boolean;
  detectObjectsPhone: boolean;
  detectWhisperingAudio: boolean;
  strictnessLevel: 'yumshoq' | 'standart' | 'qattiq' | 'paranoid';
  maxWarningsBeforeDisqualify: number;
  penaltyPerWarningXP: number;
}

export const DEFAULT_ANTICHEAT_RULES: AntiCheatRules = {
  webcamRequired: true,
  micRequired: true,
  blockTabSwitch: true,
  blockCopyPaste: true,
  forceFullscreen: true,
  blockSecondMonitor: true,
  detectMultipleFaces: true,
  detectNoFace: true,
  detectObjectsPhone: true,
  detectWhisperingAudio: true,
  strictnessLevel: 'qattiq',
  maxWarningsBeforeDisqualify: 3,
  penaltyPerWarningXP: 50,
};

export const INITIAL_PROCTOR_SESSIONS: ProctorStudentSession[] = [
  {
    id: 'proc-001',
    userId: 'USR-001',
    name: 'Alimov Sardorbek',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-101',
    olympiadTitle: 'Respublika Matematika Olimpiadasi 2026',
    region: 'Toshkent shahri',
    district: 'Yunusobod tumani',
    school: '1-sonli Litsey',
    grade: 10,
    currentQuestion: 18,
    totalQuestions: 30,
    scoreXP: 2450,
    timeRemainingSec: 2840,
    status: 'active',
    faceDetected: true,
    multipleFaces: false,
    eyeGazeScore: 97,
    headPose: 'center',
    phoneDetected: false,
    bookDetected: false,
    micActive: true,
    isListening: false,
    audioLevel: 12,
    audioAnomaly: false,
    tabSwitchesCount: 0,
    copyPasteAttempts: 0,
    fullscreenActive: true,
    secondMonitorDetected: false,
    devToolsAttempt: false,
    windowBlurCount: 0,
    warningCount: 0,
    penaltyXP: 0,
  },
  {
    id: 'proc-002',
    userId: 'USR-005',
    name: 'Nazarov Bekzod',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-101',
    olympiadTitle: 'Respublika Matematika Olimpiadasi 2026',
    region: 'Namangan viloyati',
    district: 'Namangan shahri',
    school: '8-sonli IDUM',
    grade: 10,
    currentQuestion: 12,
    totalQuestions: 30,
    scoreXP: 1600,
    timeRemainingSec: 3120,
    status: 'warning',
    faceDetected: true,
    multipleFaces: true, // Another person in frame!
    eyeGazeScore: 54,
    headPose: 'left',
    phoneDetected: false,
    bookDetected: false,
    micActive: true,
    isListening: false,
    audioLevel: 68,
    audioAnomaly: true,
    tabSwitchesCount: 2,
    copyPasteAttempts: 1,
    fullscreenActive: true,
    secondMonitorDetected: false,
    devToolsAttempt: false,
    windowBlurCount: 2,
    warningCount: 2,
    penaltyXP: 100,
    latestViolation: 'Kadrda ikkinchi shaxs va shivirlash aniqlandi',
    latestViolationTime: '1 daqiqa oldin',
  },
  {
    id: 'proc-003',
    userId: 'USR-002',
    name: 'Karimova Jamila',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-101',
    olympiadTitle: 'Respublika Matematika Olimpiadasi 2026',
    region: 'Samarqand viloyati',
    district: 'Samarqand shahri',
    school: '14-sonli Maktab',
    grade: 10,
    currentQuestion: 22,
    totalQuestions: 30,
    scoreXP: 2900,
    timeRemainingSec: 2150,
    status: 'active',
    faceDetected: true,
    multipleFaces: false,
    eyeGazeScore: 92,
    headPose: 'center',
    phoneDetected: false,
    bookDetected: false,
    micActive: true,
    isListening: false,
    audioLevel: 18,
    audioAnomaly: false,
    tabSwitchesCount: 0,
    copyPasteAttempts: 0,
    fullscreenActive: true,
    secondMonitorDetected: false,
    devToolsAttempt: false,
    windowBlurCount: 0,
    warningCount: 0,
    penaltyXP: 0,
  },
  {
    id: 'proc-004',
    userId: 'USR-003',
    name: 'Toshpulatov Jasur',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-102',
    olympiadTitle: 'Informatika va Algoritmlar Sinovi',
    region: 'Buxoro viloyati',
    district: 'Buxoro shahri',
    school: '5-sonli Gimnaziya',
    grade: 10,
    currentQuestion: 15,
    totalQuestions: 25,
    scoreXP: 2100,
    timeRemainingSec: 2540,
    status: 'warning',
    faceDetected: true,
    multipleFaces: false,
    eyeGazeScore: 61,
    headPose: 'down',
    phoneDetected: true, // Phone detected by vision AI!
    bookDetected: false,
    micActive: true,
    isListening: false,
    audioLevel: 25,
    audioAnomaly: false,
    tabSwitchesCount: 1,
    copyPasteAttempts: 2,
    fullscreenActive: false, // Exit fullscreen
    secondMonitorDetected: false,
    devToolsAttempt: true,
    windowBlurCount: 1,
    warningCount: 1,
    penaltyXP: 50,
    latestViolation: 'Mobil telefon va Developer Tools aniqlandi',
    latestViolationTime: '3 daqiqa oldin',
  },
  {
    id: 'proc-005',
    userId: 'USR-004',
    name: 'Sobirova Shahnoza',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-101',
    olympiadTitle: 'Respublika Matematika Olimpiadasi 2026',
    region: 'Farg\'ona viloyati',
    district: 'Qo\'qon shahri',
    school: '22-sonli Maktab',
    grade: 10,
    currentQuestion: 19,
    totalQuestions: 30,
    scoreXP: 2350,
    timeRemainingSec: 2780,
    status: 'active',
    faceDetected: true,
    multipleFaces: false,
    eyeGazeScore: 88,
    headPose: 'center',
    phoneDetected: false,
    bookDetected: false,
    micActive: true,
    isListening: false,
    audioLevel: 14,
    audioAnomaly: false,
    tabSwitchesCount: 0,
    copyPasteAttempts: 0,
    fullscreenActive: true,
    secondMonitorDetected: false,
    devToolsAttempt: false,
    windowBlurCount: 0,
    warningCount: 0,
    penaltyXP: 0,
  },
  {
    id: 'proc-006',
    userId: 'USR-007',
    name: 'Ergashev Otabek',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-102',
    olympiadTitle: 'Informatika va Algoritmlar Sinovi',
    region: 'Xorazm viloyati',
    district: 'Urganch shahri',
    school: '9-sonli Maktab',
    grade: 11,
    currentQuestion: 8,
    totalQuestions: 25,
    scoreXP: 950,
    timeRemainingSec: 3600,
    status: 'paused',
    faceDetected: false, // Student left the room
    multipleFaces: false,
    eyeGazeScore: 0,
    headPose: 'center',
    phoneDetected: false,
    bookDetected: false,
    micActive: false,
    isListening: false,
    audioLevel: 0,
    audioAnomaly: false,
    tabSwitchesCount: 4,
    copyPasteAttempts: 3,
    fullscreenActive: false,
    secondMonitorDetected: true, // Second monitor
    devToolsAttempt: false,
    windowBlurCount: 4,
    warningCount: 3,
    penaltyXP: 150,
    latestViolation: 'Kamerada o\'quvchi yo\'q & Ikkinchi monitor ulandi',
    latestViolationTime: 'Hozirgina',
  },
  {
    id: 'proc-007',
    userId: 'USR-008',
    name: 'Yusupova Malika',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-101',
    olympiadTitle: 'Respublika Matematika Olimpiadasi 2026',
    region: 'Qashqadaryo viloyati',
    district: 'Qarshi shahri',
    school: '11-sonli Maktab',
    grade: 8,
    currentQuestion: 14,
    totalQuestions: 30,
    scoreXP: 1750,
    timeRemainingSec: 3200,
    status: 'active',
    faceDetected: true,
    multipleFaces: false,
    eyeGazeScore: 95,
    headPose: 'center',
    phoneDetected: false,
    bookDetected: false,
    micActive: true,
    isListening: false,
    audioLevel: 10,
    audioAnomaly: false,
    tabSwitchesCount: 0,
    copyPasteAttempts: 0,
    fullscreenActive: true,
    secondMonitorDetected: false,
    devToolsAttempt: false,
    windowBlurCount: 0,
    warningCount: 0,
    penaltyXP: 0,
  },
  {
    id: 'proc-008',
    userId: 'USR-009',
    name: 'Xudoyberdiyev Doniyor',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    olympiadId: 'OLY-103',
    olympiadTitle: 'Fizika Fanidan Milliy Musobaqa',
    region: 'Surxondaryo viloyati',
    district: 'Termiz shahri',
    school: '4-sonli Maktab',
    grade: 11,
    currentQuestion: 16,
    totalQuestions: 25,
    scoreXP: 1900,
    timeRemainingSec: 2400,
    status: 'active',
    faceDetected: true,
    multipleFaces: false,
    eyeGazeScore: 84,
    headPose: 'center',
    phoneDetected: false,
    bookDetected: false,
    micActive: true,
    isListening: false,
    audioLevel: 15,
    audioAnomaly: false,
    tabSwitchesCount: 0,
    copyPasteAttempts: 0,
    fullscreenActive: true,
    secondMonitorDetected: false,
    devToolsAttempt: false,
    windowBlurCount: 0,
    warningCount: 0,
    penaltyXP: 0,
  }
];

export const INITIAL_PROCTOR_ALERTS: ProctorAlert[] = [
  {
    id: 'alert-p1',
    sessionId: 'proc-002',
    userId: 'USR-005',
    studentName: 'Nazarov Bekzod',
    olympiadTitle: 'Respublika Matematika Olimpiadasi 2026',
    type: 'multiple_faces',
    title: 'Kadrda bir nechta shaxs aniqlandi (TensorFlow AI)',
    description: 'Kamera burchagida ikkinchi odamning yuzi aniqlandi. AI ishonchlilik darajasi: 94.2%. Orqa fonda past ovozda shivirlash qayd etildi.',
    severity: 'yuqori',
    timestamp: '23:02:14',
    snapshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    status: 'yangi',
  },
  {
    id: 'alert-p2',
    sessionId: 'proc-004',
    userId: 'USR-003',
    studentName: 'Toshpulatov Jasur',
    olympiadTitle: 'Informatika va Algoritmlar Sinovi',
    type: 'phone_detected',
    title: 'Mobil telefon ushlaganlik aniqlandi (YOLO / Vision AI)',
    description: 'O\'quvchi qo\'lida smartfon ko\'rindi va qora oynaga qarab test savolini qidirishga urindi. Ekran to\'liq rejimdan chiqarilgan.',
    severity: 'kritik',
    timestamp: '22:58:30',
    snapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'ogohlantirildi',
    penaltyApplied: 50,
  },
  {
    id: 'alert-p3',
    sessionId: 'proc-006',
    userId: 'USR-007',
    studentName: 'Ergashev Otabek',
    olympiadTitle: 'Informatika va Algoritmlar Sinovi',
    type: 'no_face',
    title: 'O\'quvchi kamera kadrida ko\'rinmayapti (No Face Detected)',
    description: '3 daqiqadan ortiq vaqt davomida kamera qarshisida hech kim yo\'q. Ikkinchi monitor ulanishi aniqlandi.',
    severity: 'kritik',
    timestamp: '22:55:10',
    snapshotUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    status: 'jarima_qollanildi',
    penaltyApplied: 150,
  },
  {
    id: 'alert-p4',
    sessionId: 'proc-002',
    userId: 'USR-005',
    studentName: 'Nazarov Bekzod',
    olympiadTitle: 'Respublika Matematika Olimpiadasi 2026',
    type: 'copy_paste',
    title: 'Test savolini nusxalashga (Copy/Paste) urinish',
    description: 'Brauzerda savol matnini belgilab Ctrl+C bosildi. Tizim avtomatik blokladi va clipboard tozalandi.',
    severity: 'orta',
    timestamp: '22:50:45',
    snapshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    status: 'korildi',
  },
  {
    id: 'alert-p5',
    sessionId: 'proc-004',
    userId: 'USR-003',
    studentName: 'Toshpulatov Jasur',
    olympiadTitle: 'Informatika va Algoritmlar Sinovi',
    type: 'devtools_open',
    title: 'Developer Tools (F12 / Inspect) ochishga urinish',
    description: 'O\'quvchi sahifa kodini yoki konsolni ochish uchun F12 tugmasini bosdi. Oyna zudlik bilan yopildi.',
    severity: 'yuqori',
    timestamp: '22:47:19',
    snapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'ogohlantirildi',
  }
];
