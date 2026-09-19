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

export const INITIAL_PROCTOR_SESSIONS: ProctorStudentSession[] = [];

export const INITIAL_PROCTOR_ALERTS: ProctorAlert[] = [];
