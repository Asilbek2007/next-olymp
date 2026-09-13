import { create } from 'zustand';
import { Question } from '../types';
import { useProctoringStore } from './useProctoringStore';
import { useNotificationStore } from './useNotificationStore';
import { useAuthStore } from './useAuthStore';
import { ServerExamEngine, ServerSyncResponse } from '../services/serverExamEngine';

interface ContestState {
  olympiadId: string | null;
  sessionId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  tabSwitchCount: number;
  violationCount: number;
  maxViolations: number;
  latestViolationMessage: string;
  latestViolationType: string;
  showAntiCheatModal: boolean;
  isDisqualified: boolean;
  disqualifyReason: string;
  timeRemainingSeconds: number;
  serverExpiresAt: number;
  serverOffsetMs: number;
  isTimerRunning: boolean;
  isSubmitted: boolean;

  startContest: (olympiadId: string, questions: Question[], durationMinutes: number) => void;
  setAnswer: (questionId: string, answer: string | string[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  incrementTabSwitch: () => void;
  recordGuardViolation: (type: string, message: string, max?: number) => void;
  disqualifyContest: (reason: string) => void;
  closeAntiCheatModal: () => void;
  tickTimer: () => void;
  submitContest: () => void;
  resetContest: () => void;
}

export const useContestStore = create<ContestState>((set, get) => ({
  olympiadId: null,
  sessionId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  tabSwitchCount: 0,
  violationCount: 0,
  maxViolations: 3,
  latestViolationMessage: '',
  latestViolationType: '',
  showAntiCheatModal: false,
  isDisqualified: false,
  disqualifyReason: '',
  timeRemainingSeconds: 0,
  serverExpiresAt: 0,
  serverOffsetMs: 0,
  isTimerRunning: false,
  isSubmitted: false,

  startContest: (olympiadId, questions, durationMinutes) => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'usr-student';
    
    // Server-Side Session Init & Timer Clock Sync
    const syncRes: ServerSyncResponse = ServerExamEngine.startSession(userId, olympiadId, durationMinutes);
    const clientNow = Date.now();
    const serverOffset = clientNow - syncRes.server_time;

    set({
      olympiadId,
      sessionId: syncRes.session_id,
      questions,
      currentQuestionIndex: 0,
      answers: {},
      tabSwitchCount: 0,
      violationCount: 0,
      showAntiCheatModal: false,
      isDisqualified: false,
      disqualifyReason: '',
      timeRemainingSeconds: syncRes.time_remaining_sec,
      serverExpiresAt: syncRes.expires_at,
      serverOffsetMs: serverOffset,
      isTimerRunning: true,
      isSubmitted: false,
    });
  },

  setAnswer: (questionId, answer) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    }));
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.min(state.questions.length - 1, state.currentQuestionIndex + 1),
    }));
  },

  prevQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
    }));
  },

  goToQuestion: (index) => {
    set({ currentQuestionIndex: index });
  },

  incrementTabSwitch: () => {
    const nextCount = get().tabSwitchCount + 1;
    set({
      tabSwitchCount: nextCount,
      violationCount: get().violationCount + 1,
      latestViolationMessage: `Brauzer oynasi almashtirildi (${nextCount}-marta)`,
      latestViolationType: 'TAB_SWITCH',
      showAntiCheatModal: true,
    });

    const currentUser = useAuthStore.getState().user;
    const olympiadId = get().olympiadId || 'olymp-math-2026';

    useProctoringStore.getState().addFlag({
      user: currentUser?.fullName || 'Ishtirokchi',
      userEmail: currentUser?.email || '',
      olympiad: olympiadId === 'olymp-math-2026' ? 'Respublika Matematika II Bosqich' : 'Musobaqa',
      category: 'Oyna & Brauzer',
      type: 'Tab switching',
      detail: `Brauzer oynasi almashtirildi (${nextCount}-marta)`,
      severity: nextCount >= 3 ? 'Kritik' : nextCount === 2 ? 'Yuqori' : 'O\'rta',
    });

    useNotificationStore.getState().addNotification({
      title: `${currentUser?.fullName || 'Ishtirokchi'}: Tab switching`,
      desc: `Musobaqada ${nextCount}-marta oyna almashtirildi`,
      type: 'warning',
    });
  },

  recordGuardViolation: (type, message, max = 3) => {
    const nextCount = get().violationCount + 1;
    set({
      violationCount: nextCount,
      maxViolations: max,
      latestViolationType: type,
      latestViolationMessage: message,
      showAntiCheatModal: true,
    });
  },

  disqualifyContest: (reason) => {
    set({
      isDisqualified: true,
      disqualifyReason: reason,
      isTimerRunning: false,
      isSubmitted: true,
    });
  },

  closeAntiCheatModal: () => {
    set({ showAntiCheatModal: false });
  },

  tickTimer: () => {
    const { serverExpiresAt, serverOffsetMs, isSubmitted } = get();
    if (isSubmitted) return;

    if (serverExpiresAt > 0) {
      const serverNow = Date.now() - serverOffsetMs;
      const remainingSec = Math.max(0, Math.floor((serverExpiresAt - serverNow) / 1000));

      if (remainingSec <= 0) {
        set({ timeRemainingSeconds: 0, isTimerRunning: false });
        get().submitContest();
      } else {
        set({ timeRemainingSeconds: remainingSec });
      }
    } else {
      const current = get().timeRemainingSeconds;
      if (current <= 1) {
        set({ timeRemainingSeconds: 0, isTimerRunning: false });
        get().submitContest();
      } else {
        set({ timeRemainingSeconds: current - 1 });
      }
    }
  },

  submitContest: () => {
    set({ isTimerRunning: false, isSubmitted: true });
  },

  resetContest: () => {
    set({
      olympiadId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      tabSwitchCount: 0,
      violationCount: 0,
      maxViolations: 3,
      latestViolationMessage: '',
      latestViolationType: '',
      showAntiCheatModal: false,
      isDisqualified: false,
      disqualifyReason: '',
      timeRemainingSeconds: 0,
      isTimerRunning: false,
      isSubmitted: false,
    });
  }
}));
