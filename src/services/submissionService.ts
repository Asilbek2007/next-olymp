import { Submission, Question, Certificate, CertificateType } from '../types';
import { ServerExamEngine } from './serverExamEngine';
import { olympiadService } from './olympiadService';
import { useOlympiadStore } from '../store/useOlympiadStore';
import { useNationalExamStore } from '../store/useNationalExamStore';
import { useContestStore } from '../store/useContestStore';
import { useLeaderboardStore } from '../store/useLeaderboardStore';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from './api';

export interface SubmitAnswerParams {
  userId: string;
  olympiadId: string;
  questionId: string;
  answer: string | string[];
}

export interface ParticipantAdminResult {
  id: string;
  name: string;
  phone: string;
  region: string;
  school: string;
  grade: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  score: number;
  timeSpentMinutes: number;
  submittedAt: string;
  paymentType: 'Karta' | 'Hamyon' | 'Naqd' | 'VIP Paket (Bepul)';
  certificateType: 'I darajali Diplom' | 'II darajali Diplom' | 'III darajali Diplom' | 'Sertifikat';
  antiCheatViolations?: {
    tabSwitches: number;
    faceAbsence: number;
    rapidAnswers: number;
    totalViolations: number;
  };
  wrongQuestionsList?: {
    questionNum: number;
    topic: string;
    userAns: string;
    correctAns: string;
    aiExplanation: string;
  }[];
}

// In-memory runtime draft answers and submission cache
const draftAnswersMap = new Map<string, any>();
const userSubmissionsCache: any[] = [];
const olympiadSubmissionsCache = new Map<string, ParticipantAdminResult[]>();
const cheatLogsCache = new Map<string, any[]>();
const attemptCountsMap = new Map<string, number>();

// Initial background sync from MySQL
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      const res = await apiClient.get('/submissions.php');
      const subs = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(subs)) {
        userSubmissionsCache.push(...subs);
      }
    } catch {}
  }, 100);
}

export const submissionService = {
  async saveDraftAnswer(params: SubmitAnswerParams): Promise<boolean> {
    const sessionId = `sess_${params.userId}_${params.olympiadId}`;
    ServerExamEngine.submitAnswer(sessionId, params.questionId, params.answer, Date.now());

    const key = `draft_ans_${params.userId}_${params.olympiadId}_${params.questionId}`;
    draftAnswersMap.set(key, params.answer);
    return true;
  },

  getDraftAnswer(userId: string, olympiadId: string, questionId: string): string | string[] | null {
    const key = `draft_ans_${userId}_${olympiadId}_${questionId}`;
    return draftAnswersMap.get(key) || null;
  },

  getAttemptCount(userId: string, olympiadId: string): number {
    const key = `${userId}_${olympiadId}`;
    return attemptCountsMap.get(key) || (userSubmissionsCache.some((s) => (s.userId === userId || s.user_id === userId) && (s.olympiadId === olympiadId || s.olympiad_id === olympiadId)) ? 1 : 0);
  },

  async finalizeSubmission(
    userId: string,
    olympiadId: string,
    answers: Record<string, string | string[]>,
    _signature?: string
  ): Promise<{
    score: number;
    maxScore?: number;
    totalQuestions: number;
    correctAnswersCount?: number;
    status: 'completed';
    grading?: any;
    certificate?: Certificate;
  }> {
    const sessionId = `sess_${userId}_${olympiadId}`;
    const currentUser = useAuthStore.getState().user;
    const contestState = useContestStore.getState();

    // Submit any pending answers to server engine
    Object.entries(answers).forEach(([qId, ans]) => {
      ServerExamEngine.submitAnswer(sessionId, qId, ans, Date.now());
    });

    // 1. Fetch questions for this contest
    let questions: Question[] = [];
    if (contestState.olympiadId === olympiadId && contestState.questions && contestState.questions.length > 0) {
      questions = contestState.questions;
    } else {
      questions = await olympiadService.getQuestionsByOlympiadId(olympiadId);
    }

    const olympiadItem = useOlympiadStore.getState().olympiads.find((o) => o.id === olympiadId);
    const examItem = useNationalExamStore.getState().exams.find((e) => e.id === olympiadId);
    const subject = olympiadItem?.subject || examItem?.subject || 'Matematika';
    const title = olympiadItem?.title || examItem?.title || 'Next Olymp Musobaqasi';

    let calculatedScore = 0;
    let correctCount = 0;
    let maxCalculatedScore = 0;

    const gradedAnswers = questions.map((q, idx) => {
      const qId = q.id;
      const userAns = answers[qId] || answers[String(q.order)] || answers[String(idx + 1)] || '';
      const points = typeof q.points === 'number' && q.points > 0 ? q.points : 4;
      maxCalculatedScore += points;

      let isCorrect = false;
      const cleanUser = String(userAns || '').trim().toUpperCase();
      const cleanCorrect = String(q.correctAnswer || (q as any).correct_option || 'A').trim().toUpperCase();

      if (cleanUser && cleanCorrect) {
        if (cleanUser === cleanCorrect) {
          isCorrect = true;
        } else if (cleanUser.length === 1 && cleanCorrect.length === 1 && cleanUser === cleanCorrect) {
          isCorrect = true;
        } else if (cleanUser.startsWith('OPTION_') && cleanCorrect.length === 1) {
          const letter = cleanUser.replace('OPTION_', '').toUpperCase();
          if (letter === cleanCorrect) isCorrect = true;
        }
      }

      if (isCorrect) {
        calculatedScore += points;
        correctCount += 1;
      }

      return {
        questionId: q.id,
        questionNum: idx + 1,
        topic: (q as any).topic || `${subject} mavzusi #${idx + 1}`,
        points,
        userAnswer: userAns,
        correctAnswer: cleanCorrect,
        isCorrect,
        aiExplanation: `Tahlil: To'g'ri javob ${cleanCorrect}.`
      };
    });

    const finalScore = calculatedScore;
    const finalMaxScore = maxCalculatedScore > 0 ? maxCalculatedScore : (questions.length > 0 ? questions.length * 4 : 100);
    const percentage = finalMaxScore > 0 ? Math.round((finalScore / finalMaxScore) * 100) : 0;

    const cheatLogs = contestState.capturedIncidents || [];
    const tabSwitches = contestState.tabSwitchCount || 0;
    const totalViolations = contestState.violationCount || 0;

    const subId = `sub_${userId}_${olympiadId}_${Date.now()}`;
    const attemptKey = `${userId}_${olympiadId}`;
    attemptCountsMap.set(attemptKey, (attemptCountsMap.get(attemptKey) || 0) + 1);

    const submissionData = {
      id: subId,
      user_id: userId,
      userId: userId,
      user_name: currentUser?.fullName || 'Ishtirokchi',
      userName: currentUser?.fullName || 'Ishtirokchi',
      olympiad_id: olympiadId,
      olympiadId: olympiadId,
      olympiadTitle: title,
      score: finalScore,
      maxScore: finalMaxScore,
      total_questions: questions.length,
      percentage,
      answers: answers,
      timeSpentMinutes: Math.max(1, Math.round(questions.length * 1.5)),
      status: totalViolations >= 5 ? 'disqualified' : 'completed',
      submitted_at: new Date().toISOString()
    };

    userSubmissionsCache.unshift(submissionData);

    // Send directly to MySQL backend API
    try {
      await apiClient.post('/submissions.php', submissionData);
    } catch (e) {
      console.warn('Backend submission save notice:', e);
    }

    // Save security incidents to API
    if (cheatLogs.length > 0) {
      cheatLogs.forEach((log: any) => {
        apiClient.post('/security.php', {
          user_id: userId,
          event_type: log.type || 'tab_switch',
          details: log.detail || log.message || 'Xavfsizlik ogohlantirishi',
          severity: log.severity || 'medium'
        }).catch(() => {});
      });
    }

    const isWinner = percentage >= 70;
    const certType: CertificateType = isWinner ? 'winner' : 'round_failed';

    const cert: Certificate = {
      id: `cert_${Date.now()}`,
      userId,
      userName: currentUser?.fullName || 'Ishtirokchi',
      olympiadId,
      olympiadTitle: title,
      subject,
      type: certType,
      issuedAt: new Date().toISOString(),
      verificationCode: `NO-2026-${(title || 'OLY').slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      score: finalScore,
      maxScore: finalMaxScore,
      rank: isWinner ? 1 : 0,
      totalParticipants: 100,
      fontFamily: 'cinzel'
    };

    return {
      score: finalScore,
      maxScore: finalMaxScore,
      totalQuestions: questions.length,
      correctAnswersCount: correctCount,
      status: 'completed',
      grading: {
        totalScore: finalScore,
        maxScore: finalMaxScore,
        correctAnswersCount: correctCount,
        totalQuestionsCount: questions.length,
        percentage,
        gradedAnswers,
        cheatLogs
      },
      certificate: cert
    };
  },

  getUserSubmissions(userId: string): any[] {
    return userSubmissionsCache.filter((s) => s.userId === userId || s.user_id === userId);
  },

  getUserExamResults(userId: string): any[] {
    const list = this.getUserSubmissions(userId);
    return list.map((s, idx) => ({
      id: s.id || `res_${idx}`,
      userId: s.userId || s.user_id || userId,
      olympiadId: s.olympiadId || s.olympiad_id || 'OLY-101',
      olympiadTitle: s.olympiadTitle || 'Next Olymp Musobaqasi',
      subject: s.subject || 'Matematika',
      format: 'online' as const,
      completedAt: s.submitted_at || new Date().toISOString(),
      score: Number(s.score || 0),
      maxScore: Number(s.maxScore || 100),
      percentage: Number(s.percentage || 0),
      rank: 1,
      totalParticipants: 100,
      certificateType: s.percentage >= 70 ? "G'oliblik Diplomi" : "Ishtirok Sertifikati",
      status: 'published' as const,
      timeSpentMinutes: Number(s.timeSpentMinutes || 15),
      totalQuestions: Number(s.total_questions || 25),
      correctAnswersCount: Math.round(((Number(s.percentage) || 0) / 100) * (Number(s.total_questions) || 25)),
      wrongAnswersCount: Math.max(0, (Number(s.total_questions) || 25) - Math.round(((Number(s.percentage) || 0) / 100) * (Number(s.total_questions) || 25))),
      questionsAnalysis: []
    }));
  },

  getOlympiadSubmissions(olympiadId: string): ParticipantAdminResult[] {
    const fromCache = olympiadSubmissionsCache.get(olympiadId);
    if (fromCache) return fromCache;

    const list = userSubmissionsCache
      .filter((s) => s.olympiadId === olympiadId || s.olympiad_id === olympiadId)
      .map((s: any, idx: number) => {
        const score = Number(s.score || 0);
        const maxScore = Number(s.maxScore || (s.total_questions ? s.total_questions * 4 : 100));
        const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const certType = pct >= 80 ? 'I darajali Diplom' : pct >= 65 ? 'II darajali Diplom' : pct >= 50 ? 'III darajali Diplom' : 'Sertifikat';

        return {
          id: s.userId || s.user_id || `STU-${idx + 100}`,
          name: s.userName || s.user_name || 'Ishtirokchi',
          phone: s.phone || '+998 90 123 45 67',
          region: s.region || 'Toshkent sh.',
          school: s.school || 'Prezident maktabi',
          grade: s.grade || 9,
          correctAnswers: s.correctAnswersCount ?? Math.round((pct / 100) * (s.total_questions || 25)),
          totalQuestions: s.total_questions || 25,
          percentage: pct,
          score,
          timeSpentMinutes: s.timeSpentMinutes || 15,
          submittedAt: s.submitted_at ? new Date(s.submitted_at).toLocaleString() : new Date().toLocaleString(),
          paymentType: 'Karta' as const,
          certificateType: certType as any,
          antiCheatViolations: {
            tabSwitches: 0,
            faceAbsence: 0,
            rapidAnswers: 0,
            totalViolations: 0
          }
        };
      }).sort((a: any, b: any) => b.score - a.score);

    // Background refresh
    apiClient.get(`/submissions.php?olympiad_id=${encodeURIComponent(olympiadId)}`)
      .then((res) => {
        const subs = Array.isArray(res) ? res : (res?.data || []);
        if (Array.isArray(subs) && subs.length > 0) {
          const fresh = subs.map((s: any, idx: number) => {
            const score = Number(s.score || 0);
            const maxScore = Number(s.maxScore || 100);
            const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
            const certType = pct >= 80 ? 'I darajali Diplom' : pct >= 65 ? 'II darajali Diplom' : pct >= 50 ? 'III darajali Diplom' : 'Sertifikat';
            return {
              id: s.userId || s.user_id || `STU-${idx + 100}`,
              name: s.userName || s.user_name || 'Ishtirokchi',
              phone: s.phone || '+998 90 123 45 67',
              region: s.region || 'Toshkent sh.',
              school: s.school || 'Prezident maktabi',
              grade: s.grade || 9,
              correctAnswers: Math.round((pct / 100) * (s.total_questions || 25)),
              totalQuestions: s.total_questions || 25,
              percentage: pct,
              score,
              timeSpentMinutes: s.timeSpentMinutes || 15,
              submittedAt: s.submitted_at ? new Date(s.submitted_at).toLocaleString() : new Date().toLocaleString(),
              paymentType: 'Karta' as const,
              certificateType: certType as any,
              antiCheatViolations: { tabSwitches: 0, faceAbsence: 0, rapidAnswers: 0, totalViolations: 0 }
            };
          }).sort((a: any, b: any) => b.score - a.score);
          olympiadSubmissionsCache.set(olympiadId, fresh);
        }
      })
      .catch(() => {});

    return list;
  },

  saveLiveCheatLog(olympiadId: string, log: any): void {
    const list = cheatLogsCache.get(olympiadId) || [];
    list.unshift(log);
    cheatLogsCache.set(olympiadId, list);

    apiClient.post('/security.php', {
      olympiad_id: olympiadId,
      user_id: log.studentId || log.userId,
      event_type: log.type || 'tab_switch',
      details: log.detail || log.message || '',
      severity: log.severity || 'medium'
    }).catch(() => {});
  },

  getOlympiadCheatLogs(olympiadId?: string): any[] {
    if (olympiadId) {
      return cheatLogsCache.get(olympiadId) || [];
    }
    const all: any[] = [];
    cheatLogsCache.forEach((logs) => all.push(...logs));
    return all;
  },

  getOlympiadAllParticipants(olympiadId: string): any[] {
    return this.getOlympiadSubmissions(olympiadId);
  },

  isParticipantDisqualified(userId: string, olympiadId: string): boolean {
    return false;
  }
};
