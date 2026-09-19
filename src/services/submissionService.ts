import { Submission, Question, Certificate, CertificateType } from '../types';
import { MOCK_USER_RESULTS } from './mockData';
import { ServerExamEngine } from './serverExamEngine';
import { olympiadService } from './olympiadService';
import { certificateService } from './certificateService';
import { useOlympiadStore } from '../store/useOlympiadStore';
import { useNationalExamStore } from '../store/useNationalExamStore';
import { useContestStore } from '../store/useContestStore';
import { useLeaderboardStore } from '../store/useLeaderboardStore';
import { useAuthStore } from '../store/useAuthStore';

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

export const submissionService = {
  async saveDraftAnswer(params: SubmitAnswerParams): Promise<boolean> {
    const sessionId = `sess_${params.userId}_${params.olympiadId}`;
    ServerExamEngine.submitAnswer(sessionId, params.questionId, params.answer, Date.now());

    const key = `draft_ans_${params.userId}_${params.olympiadId}_${params.questionId}`;
    localStorage.setItem(key, JSON.stringify(params.answer));
    return true;
  },

  getDraftAnswer(userId: string, olympiadId: string, questionId: string): string | string[] | null {
    const key = `draft_ans_${userId}_${olympiadId}_${questionId}`;
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return saved;
    }
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

    let totalEarnedScore = 0;
    let maxPossibleScore = 0;
    let correctCount = 0;
    const defaultPointsPerQ = questions.length > 0 ? Math.round(100 / questions.length) : 10;

    const gradedAnswers = questions.map((q, idx) => {
      const userAns = answers[q.id];
      const options = q.options || [];
      const qPoints = q.points || defaultPointsPerQ;
      maxPossibleScore += qPoints;

      // ── 1. Determine User Selected Option Index ──
      let userSelectedIdx = -1;
      if (userAns !== undefined && userAns !== null && String(userAns).trim().length > 0) {
        const rawUserStr = String(userAns).trim();
        
        userSelectedIdx = options.findIndex(
          (opt) => opt.trim().toLowerCase() === rawUserStr.toLowerCase()
        );

        if (userSelectedIdx === -1 && rawUserStr.length === 1) {
          const charCode = rawUserStr.toUpperCase().charCodeAt(0);
          if (charCode >= 65 && charCode <= 90) {
            userSelectedIdx = charCode - 65;
          }
        }

        if (userSelectedIdx === -1) {
          const match = rawUserStr.match(/^([A-Z])[\.\)]/i);
          if (match) {
            userSelectedIdx = match[1].toUpperCase().charCodeAt(0) - 65;
          }
        }

        if (userSelectedIdx === -1 && options.length > 0) {
          userSelectedIdx = options.findIndex(
            (opt) =>
              opt.toLowerCase().includes(rawUserStr.toLowerCase()) ||
              rawUserStr.toLowerCase().includes(opt.toLowerCase())
          );
        }
      }

      // ── 2. Determine Correct Option Index ──
      let correctIdx = -1;
      const rawCorrect = (q.correctAnswer || '').trim();

      if (rawCorrect.length === 1) {
        const charCode = rawCorrect.toUpperCase().charCodeAt(0);
        if (charCode >= 65 && charCode <= 90) {
          correctIdx = charCode - 65;
        }
      }

      if (correctIdx === -1) {
        const match = rawCorrect.match(/^([A-Z])[\.\)]/i);
        if (match) {
          correctIdx = match[1].toUpperCase().charCodeAt(0) - 65;
        }
      }

      if (correctIdx === -1 && options.length > 0 && rawCorrect.length > 0) {
        correctIdx = options.findIndex(
          (opt) =>
            opt.trim().toLowerCase() === rawCorrect.toLowerCase() ||
            opt.toLowerCase().includes(rawCorrect.toLowerCase()) ||
            rawCorrect.toLowerCase().includes(opt.toLowerCase())
        );
      }

      if (correctIdx === -1 && options.length > 0) {
        correctIdx = 0;
      }

      // ── 3. Validate Correctness ──
      let isCorrect = false;
      if (options.length > 0) {
        isCorrect = userSelectedIdx !== -1 && userSelectedIdx === correctIdx;
      } else if (userAns !== undefined && userAns !== null) {
        isCorrect = String(userAns).trim().toLowerCase() === rawCorrect.toLowerCase();
      }

      if (isCorrect) {
        totalEarnedScore += qPoints;
        correctCount++;
      }

      const userSelectedLetter = userSelectedIdx >= 0 
        ? String.fromCharCode(65 + userSelectedIdx) 
        : (userAns ? String(userAns) : '-');
      
      const userSelectedText = userSelectedIdx >= 0 && options[userSelectedIdx]
        ? options[userSelectedIdx]
        : (userAns ? String(userAns) : 'Belgilanmagan');

      const correctLetter = correctIdx >= 0 
        ? String.fromCharCode(65 + correctIdx) 
        : (rawCorrect || 'A');

      const correctText = correctIdx >= 0 && options[correctIdx] 
        ? options[correctIdx] 
        : (rawCorrect || correctLetter);

      return {
        questionNum: idx + 1,
        questionId: q.id,
        topic: (q as any).topic || `Savol #${idx + 1}`,
        questionText: q.content,
        points: qPoints,
        earnedScore: isCorrect ? qPoints : 0,
        maxScore: qPoints,
        options,
        userAnswer: userSelectedLetter,
        userAnswerText: userSelectedText,
        correctAnswer: correctLetter,
        correctAnswerText: correctText,
        isCorrect,
        aiExplanation: isCorrect
          ? "To'g'ri javob berilgan. Tahlil: Savol to'g'ri tushunilgan va to'g'ri xulosa chiqarilgan."
          : `Noto'g'ri belgilangan. To'g'ri javob: ${correctLetter}) ${correctText}. Ushbu mavzuni mustahkamlash tavsiya etiladi.`,
      };
    });

    const finalScore = totalEarnedScore;
    const finalMaxScore = maxPossibleScore > 0 ? maxPossibleScore : 100;
    const percentage = finalMaxScore > 0 ? Math.round((finalScore / finalMaxScore) * 100) : 0;

    // Get contest title
    const olympiads = useOlympiadStore.getState().olympiads || [];
    const exams = useNationalExamStore.getState().exams || [];
    const oMatch = olympiads.find((o) => o.id === olympiadId);
    const eMatch = exams.find((e) => e.id === olympiadId);
    const title = oMatch?.title || eMatch?.title || `Olimpiada #${olympiadId}`;
    const subject = oMatch?.subject || eMatch?.subject || 'Umumiy Fan';

    // Anti-cheat incident summary from live session
    const tabSwitches = contestState.tabSwitchCount || 0;
    const totalViolations = contestState.violationCount || 0;
    const faceAbsence = Math.max(0, totalViolations - tabSwitches);

    // Collect all real incident logs captured during the session
    const cheatLogs: any[] = [];
    if (Array.isArray(contestState.capturedIncidents) && contestState.capturedIncidents.length > 0) {
      contestState.capturedIncidents.forEach((inc) => {
        cheatLogs.push({
          id: inc.id,
          studentId: userId,
          name: currentUser?.fullName || 'Ishtirokchi',
          phone: currentUser?.phone || '+998 90 123 45 67',
          ipAddress: '195.158.12.45',
          region: currentUser?.region || 'Toshkent sh.',
          school: currentUser?.school || '2-sonli Maktab',
          type: inc.type === 'TAB_SWITCH' ? 'Brauzer oynasi almashtirildi (Tab Switch)' : inc.type,
          detail: inc.detail,
          count: inc.count,
          severity: inc.severity,
          timestamp: inc.timestamp || new Date().toLocaleTimeString(),
          isOnline: true,
          snapshotUrl: inc.snapshotUrl,
          status: inc.status || 'pending'
        });
      });
    } else {
      if (tabSwitches > 0) {
        cheatLogs.push({
          id: `LOG-TAB-${Date.now()}`,
          studentId: userId,
          name: currentUser?.fullName || 'Ishtirokchi',
          phone: currentUser?.phone || '+998 90 123 45 67',
          ipAddress: '195.158.12.45',
          region: currentUser?.region || 'Toshkent sh.',
          school: currentUser?.school || '2-sonli Maktab',
          type: 'Brauzer oynasi almashtirildi (Tab Switch)',
          detail: `Ishtirokchi test paytida ${tabSwitches} marta boshqa oynaga o'tdi`,
          count: tabSwitches,
          severity: tabSwitches >= 3 ? 'Kritik' : 'Yuqori',
          timestamp: new Date().toLocaleString(),
          isOnline: true,
          status: tabSwitches >= 3 ? 'penalized' : 'warned'
        });
      }
      if (faceAbsence > 0 || contestState.latestViolationType === 'NO_FACE_DETECTED') {
        cheatLogs.push({
          id: `LOG-CAM-${Date.now()}`,
          studentId: userId,
          name: currentUser?.fullName || 'Ishtirokchi',
          phone: currentUser?.phone || '+998 90 123 45 67',
          ipAddress: '195.158.12.45',
          region: currentUser?.region || 'Toshkent sh.',
          school: currentUser?.school || '2-sonli Maktab',
          type: contestState.latestViolationType || "Yuz ko'rinmay qoldi (No Face Detected)",
          detail: contestState.latestViolationMessage || "Kadrda yuz harakati yoki kadrni tark etish holati qayd etildi",
          count: faceAbsence || 1,
          severity: 'Yuqori',
          timestamp: new Date().toLocaleString(),
          isOnline: true,
          status: 'warned'
        });
      }
    }

    const isContestFree = Boolean(
      oMatch?.isFreeForAll || (oMatch as any)?.price === 0 ||
      eMatch?.isFreeForAll || (eMatch as any)?.price === 0
    );

    const grading = {
      sessionId,
      userId,
      examId: olympiadId,
      totalScore: finalScore,
      maxScore: finalMaxScore,
      correctAnswersCount: correctCount,
      totalQuestionsCount: questions.length,
      percentage,
      timeSpentMinutes: Math.max(1, Math.round(questions.length * 1.5)),
      gradedAnswers,
      cheatLogs,
    };

    // Save final submission marker to LocalStorage
    const submissionRecord = {
      userId,
      userName: currentUser?.fullName || 'Ishtirokchi',
      phone: currentUser?.phone || '+998 90 123 45 67',
      region: currentUser?.region || 'Toshkent sh.',
      school: currentUser?.school || 'Prezident maktabi',
      grade: currentUser?.grade || 9,
      olympiadId,
      olympiadTitle: title,
      subject,
      score: finalScore,
      maxScore: finalMaxScore,
      percentage,
      totalQuestions: questions.length,
      correctAnswersCount: correctCount,
      timeSpentMinutes: grading.timeSpentMinutes,
      completedAt: new Date().toISOString(),
      paymentType: isContestFree ? 'VIP Paket (Bepul)' : 'Karta',
      antiCheatViolations: {
        tabSwitches,
        faceAbsence,
        rapidAnswers: 0,
        totalViolations
      },
      cheatLogs,
      grading,
    };

    // Save attempt count
    const attemptKey = `attempts_count_${userId}_${olympiadId}`;
    const currentAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10) + 1;
    localStorage.setItem(attemptKey, currentAttempts.toString());

    localStorage.setItem(
      `submission_completed_${userId}_${olympiadId}`,
      JSON.stringify({ ...submissionRecord, attemptNumber: currentAttempts })
    );

    // Sync to MySQL API
    fetch('/api/submissions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `sub_${userId}_${olympiadId}_${Date.now()}`,
        userId,
        userName: currentUser?.fullName || 'Ishtirokchi',
        olympiadId,
        olympiadTitle: title,
        score: finalScore,
        maxScore: finalMaxScore,
        percentage,
        timeSpentMinutes: grading.timeSpentMinutes,
        completedAt: new Date().toISOString()
      })
    }).catch((e) => console.warn('Submission API sync warning:', e));

    // ── 2. DYNAMIC RANK & CERTIFICATE CALCULATION ──
    const allOlympiadSubs = this.getOlympiadSubmissions(olympiadId);
    // Find how many other participants scored higher than this student
    const higherScoreCount = allOlympiadSubs.filter(
      (s) => s.id !== userId && s.score > finalScore
    ).length;
    const realRank = higherScoreCount + 1;
    const realTotalParticipants = Math.max(1, allOlympiadSubs.length);

    const certType: CertificateType = realRank === 1 ? 'winner' : realRank <= 3 ? 'achievement' : 'participant';
    const certTitle = realRank === 1 ? 'I Darajali Diplom' : realRank === 2 ? 'II Darajali Diplom' : realRank === 3 ? 'III Darajali Diplom' : percentage >= 60 ? 'Muvaffaqiyat Sertifikati' : 'Ishtirokchi Sertifikati';
    const verificationCode = `NO-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newCertificate: Certificate = {
      id: `cert-${olympiadId}-${userId}-${Date.now()}`,
      userId,
      userName: currentUser?.fullName || 'Ishtirokchi',
      olympiadId,
      olympiadTitle: title,
      subject,
      rank: realRank,
      score: finalScore,
      maxScore: finalMaxScore,
      totalParticipants: realTotalParticipants,
      type: certType,
      issuedAt: new Date().toISOString().split('T')[0],
      verificationCode,
      fileUrl: `https://nextolymp.uz/verify/${verificationCode}`,
      customMessage: certTitle
    };

    certificateService.saveCertificate(newCertificate);

    // Save also to user-specific certificates list
    try {
      const userCertKey = `user_certificates_${userId}`;
      const existingUserCertsStr = localStorage.getItem(userCertKey);
      const existingUserCerts: Certificate[] = existingUserCertsStr ? JSON.parse(existingUserCertsStr) : [];
      const existingIdx = existingUserCerts.findIndex((c) => c.olympiadId === olympiadId);
      if (existingIdx >= 0) {
        existingUserCerts[existingIdx] = newCertificate;
      } else {
        existingUserCerts.unshift(newCertificate);
      }
      localStorage.setItem(userCertKey, JSON.stringify(existingUserCerts));
    } catch (e) {
      console.error('Error saving user certificates', e);
    }

    // ── 3. UPDATE LEADERBOARD SYNCHRONIZATION ──
    try {
      useLeaderboardStore.getState().addOrUpdateUserScore({
        userId,
        userName: currentUser?.fullName || 'Ishtirokchi',
        score: finalScore,
        region: currentUser?.region || 'Toshkent sh.',
        district: currentUser?.district || 'Chilonzor',
        school: currentUser?.school || 'Prezident maktabi',
        grade: currentUser?.grade || 9,
        avatarUrl: currentUser?.avatarUrl,
      });
    } catch (e) {
      console.error('Error updating leaderboard:', e);
    }

    // ── 4. UPDATE OLYMPIAD / EXAM STATS ──
    try {
      const { olympiads, updateOlympiad } = useOlympiadStore.getState();
      const existingO = olympiads.find((o) => o.id === olympiadId);
      if (existingO) {
        updateOlympiad(olympiadId, {
          registeredCount: (existingO.registeredCount || 0) + 1,
        });
      }
      const { exams, updateExam } = useNationalExamStore.getState();
      const existingE = exams.find((e) => e.id === olympiadId);
      if (existingE) {
        updateExam(olympiadId, {
          registeredCount: (existingE.registeredCount || 0) + 1,
        });
      }
    } catch (e) {
      console.error('Error updating exam counts:', e);
    }

    return {
      score: finalScore,
      maxScore: finalMaxScore,
      totalQuestions: questions.length,
      correctAnswersCount: correctCount,
      status: 'completed',
      grading,
      certificate: newCertificate,
    };
  },

  getAttemptCount(userId: string, olympiadId: string): number {
    const attemptKey = `attempts_count_${userId}_${olympiadId}`;
    const count = parseInt(localStorage.getItem(attemptKey) || '0', 10);
    if (count > 0) return count;
    const single = localStorage.getItem(`submission_completed_${userId}_${olympiadId}`);
    return single ? 1 : 0;
  },

  getUserSubmissions(userId: string): Array<{
    userId: string;
    userName?: string;
    phone?: string;
    region?: string;
    school?: string;
    grade?: number;
    olympiadId: string;
    score: number;
    maxScore: number;
    completedAt: string;
    antiCheatViolations?: any;
    cheatLogs?: any[];
    grading?: any;
    attemptNumber?: number;
  }> {
    const list: any[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`submission_completed_${userId}_`) && !key.includes('_att_')) {
          const val = localStorage.getItem(key);
          if (val) list.push(JSON.parse(val));
        }
      }
    } catch {}
    return list;
  },

  getOlympiadSubmissions(olympiadId: string): ParticipantAdminResult[] {
    const list: ParticipantAdminResult[] = [];
    const olympiads = useOlympiadStore.getState().olympiads || [];
    const exams = useNationalExamStore.getState().exams || [];
    const oMatch = olympiads.find((o) => o.id === olympiadId);
    const eMatch = exams.find((e) => e.id === olympiadId);
    const isFree = Boolean(
      oMatch?.isFreeForAll || (oMatch as any)?.price === 0 ||
      eMatch?.isFreeForAll || (eMatch as any)?.price === 0
    );

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('submission_completed_') && key.endsWith(`_${olympiadId}`)) {
          const val = localStorage.getItem(key);
          if (val) {
            const data = JSON.parse(val);
            const score = data.score ?? 0;
            const maxScore = data.maxScore || 100;
            const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
            const certType = pct >= 80 ? 'I darajali Diplom' : pct >= 65 ? 'II darajali Diplom' : pct >= 50 ? 'III darajali Diplom' : 'Sertifikat';
            
            const wrongList = (data.grading?.gradedAnswers || [])
              .filter((g: any) => !g.isCorrect)
              .map((g: any) => ({
                questionNum: g.questionNum,
                topic: g.topic,
                userAns: g.userAnswerText || g.userAnswer || '-',
                correctAns: g.correctAnswerText || g.correctAnswer || 'A',
                aiExplanation: g.aiExplanation || "Noto'g'ri belgilangan."
              }));

            const paymentType = data.paymentType || (isFree ? 'VIP Paket (Bepul)' : 'Karta');

            list.push({
              id: data.userId || `STU-${i + 100}`,
              name: data.userName || 'Ishtirokchi',
              phone: data.phone || '+998 90 123 45 67',
              region: data.region || 'Toshkent sh.',
              school: data.school || 'Prezident maktabi',
              grade: data.grade || 9,
              correctAnswers: data.correctAnswersCount ?? data.grading?.correctAnswersCount ?? 0,
              totalQuestions: data.totalQuestions ?? data.grading?.totalQuestionsCount ?? 10,
              percentage: pct,
              score,
              timeSpentMinutes: data.timeSpentMinutes ?? data.grading?.timeSpentMinutes ?? 15,
              submittedAt: data.completedAt ? new Date(data.completedAt).toLocaleString() : new Date().toLocaleString(),
              paymentType,
              certificateType: certType,
              antiCheatViolations: data.antiCheatViolations || {
                tabSwitches: 0,
                faceAbsence: 0,
                rapidAnswers: 0,
                totalViolations: 0,
              },
              wrongQuestionsList: wrongList,
            });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching submissions for olympiad:', e);
    }

    // Sort descending by score / percentage
    return list.sort((a, b) => b.score - a.score);
  },

  saveLiveCheatLog(olympiadId: string, log: any): void {
    try {
      const key = `anticheat_logs_${olympiadId}`;
      const existing = localStorage.getItem(key);
      let logs: any[] = [];
      if (existing) {
        try {
          logs = JSON.parse(existing);
          if (!Array.isArray(logs)) logs = [];
        } catch {}
      }
      logs.unshift(log);
      // Keep up to 100 recent logs
      if (logs.length > 100) logs = logs.slice(0, 100);
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save live cheat log:', e);
    }
  },

  getOlympiadCheatLogs(olympiadId: string): any[] {
    const logsMap = new Map<string, any>();
    try {
      // 1. Read live real-time anticheat logs
      const liveKey = `anticheat_logs_${olympiadId}`;
      const liveStr = localStorage.getItem(liveKey);
      if (liveStr) {
        try {
          const liveLogs = JSON.parse(liveStr);
          if (Array.isArray(liveLogs)) {
            liveLogs.forEach((l) => {
              if (l && l.id) logsMap.set(l.id, l);
            });
          }
        } catch {}
      }

      // 2. Read submission completed logs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('submission_completed_') && key.endsWith(`_${olympiadId}`)) {
          const val = localStorage.getItem(key);
          if (val) {
            const data = JSON.parse(val);
            if (Array.isArray(data.cheatLogs) && data.cheatLogs.length > 0) {
              data.cheatLogs.forEach((l: any) => {
                if (l && l.id) logsMap.set(l.id, l);
              });
            }
          }
        }
      }
    } catch {}
    return Array.from(logsMap.values());
  },

  getOlympiadAllParticipants(olympiadId: string): Array<{
    id: string;
    name: string;
    phone: string;
    region: string;
    school: string;
    grade: number;
    status: 'completed' | 'in_progress' | 'registered';
    correctAnswers?: number;
    totalQuestions?: number;
    percentage?: number;
    score?: number;
    timeSpentMinutes?: number;
    submittedAt?: string;
    registeredAt?: string;
    paymentType: string;
    certificateType?: string;
    antiCheatViolations?: {
      tabSwitches: number;
      faceAbsence: number;
      rapidAnswers: number;
      totalViolations: number;
    };
    wrongQuestionsList?: any[];
  }> {
    const participantsMap = new Map<string, any>();

    // 1. Add completed submissions
    const completedList = this.getOlympiadSubmissions(olympiadId);
    completedList.forEach((c) => {
      participantsMap.set(c.id, {
        ...c,
        status: 'completed',
        registeredAt: c.submittedAt
      });
    });

    // 2. Add registered users from auth/users store who registered for this contest
    try {
      const regSaved = localStorage.getItem('next_olymp_registered_users');
      if (regSaved) {
        const list = JSON.parse(regSaved);
        if (Array.isArray(list)) {
          list.forEach((u: any) => {
            if (u && u.id && u.role !== 'admin' && !u.id.includes('admin')) {
              if (!participantsMap.has(u.id)) {
                // Check if user has session in progress
                const isSessionActive = Boolean(localStorage.getItem(`sess_${u.id}_${olympiadId}`));
                participantsMap.set(u.id, {
                  id: u.id,
                  name: u.fullName || 'Ishtirokchi',
                  phone: u.phone || '+998 90 123 45 67',
                  region: u.region || 'Toshkent sh.',
                  school: u.school || 'Maktab',
                  grade: u.grade || 9,
                  status: isSessionActive ? 'in_progress' : 'registered',
                  registeredAt: u.createdAt ? u.createdAt.split('T')[0] : '2026-09-19',
                  paymentType: 'VIP Paket (Bepul)',
                  score: undefined,
                  percentage: undefined,
                  correctAnswers: undefined,
                  totalQuestions: undefined
                });
              }
            }
          });
        }
      }
    } catch {}

    // 3. If list is empty, supply initial preview participants
    if (participantsMap.size === 0) {
      return [
        {
          id: 'usr-student-1',
          name: 'Asilbek Olimov',
          phone: '+998 99 174 99 33',
          region: 'Toshkent shahri',
          school: 'Sergeli tumani 1-maktab',
          grade: 9,
          status: 'completed',
          correctAnswers: 28,
          totalQuestions: 30,
          percentage: 93,
          score: 93,
          timeSpentMinutes: 24,
          submittedAt: '2026-09-19 14:30',
          registeredAt: '2026-09-19 14:00',
          paymentType: 'VIP Paket (Bepul)',
          certificateType: 'I darajali Diplom',
          antiCheatViolations: { tabSwitches: 0, faceAbsence: 0, rapidAnswers: 0, totalViolations: 0 }
        }
      ];
    }

    return Array.from(participantsMap.values());
  },

  getUserExamResults(userId: string): any[] {
    const local = this.getUserSubmissions(userId);
    const all: any[] = [...MOCK_USER_RESULTS];

    const olympiads = useOlympiadStore.getState().olympiads || [];
    const exams = useNationalExamStore.getState().exams || [];

    local.forEach((l) => {
      const oMatch = olympiads.find((o) => o.id === l.olympiadId);
      const eMatch = exams.find((e) => e.id === l.olympiadId);

      const title = oMatch?.title || eMatch?.title || `Olimpiada #${l.olympiadId}`;
      const subject = oMatch?.subject || eMatch?.subject || 'Umumiy Fan';

      const totalQ = l.grading?.totalQuestionsCount || (l.grading?.gradedAnswers?.length) || 0;
      const correctCount = l.grading?.correctAnswersCount ?? 0;
      const wrongCount = Math.max(0, totalQ - correctCount);
      const score = l.score ?? 0;
      const maxScore = l.maxScore || 100;
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      let formattedDate = l.completedAt;
      try {
        const d = new Date(l.completedAt);
        if (!isNaN(d.getTime())) {
          formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
      } catch {}

      all.unshift({
        id: `RES-${l.olympiadId}-${Date.parse(l.completedAt) || Date.now()}`,
        userId: l.userId,
        olympiadId: l.olympiadId,
        olympiadTitle: title,
        subject,
        format: oMatch?.format || 'online',
        completedAt: formattedDate,
        score,
        maxScore,
        percentage,
        rank: percentage >= 80 ? 1 : percentage >= 60 ? 2 : 3,
        totalParticipants: (oMatch?.registeredCount || 0) + 1,
        certificateType: percentage >= 70 ? 'I-Darajali Diplom' : percentage >= 50 ? 'Sertifikat' : 'Ishtirokchi Sertifikati',
        certificateCode: `NO-2026-${l.olympiadId}`,
        status: 'published',
        timeSpentMinutes: l.grading?.timeSpentMinutes || 15,
        totalQuestions: totalQ,
        correctAnswersCount: correctCount,
        wrongAnswersCount: wrongCount,
        questionsAnalysis: l.grading?.gradedAnswers || []
      });
    });

    return all;
  },

  getExamResultById(resultId: string): any | null {
    const results = this.getUserExamResults('usr-student-1');
    return results.find((r) => r.id === resultId || r.olympiadId === resultId) || results[0] || null;
  }
};
