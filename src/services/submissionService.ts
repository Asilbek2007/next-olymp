import { Submission } from '../types';

export interface SubmitAnswerParams {
  userId: string;
  olympiadId: string;
  questionId: string;
  answer: string | string[];
}

import { ServerExamEngine, PostExamGradingResult } from './serverExamEngine';

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
    signature?: string
  ): Promise<{ score: number; totalQuestions: number; status: 'completed'; grading?: PostExamGradingResult }> {
    const sessionId = `sess_${userId}_${olympiadId}`;

    // Submit any pending answers to server engine
    Object.entries(answers).forEach(([qId, ans]) => {
      ServerExamEngine.submitAnswer(sessionId, qId, ans, Date.now());
    });

    // Run Server-Side Final Grading Worker
    const grading = await ServerExamEngine.finalizeAndGradeSession(sessionId);

    // Save final submission marker
    localStorage.setItem(`submission_completed_${userId}_${olympiadId}`, JSON.stringify({
      userId,
      olympiadId,
      score: grading.totalScore,
      maxScore: grading.maxScore,
      completedAt: new Date().toISOString(),
      grading,
    }));

    return {
      score: grading.totalScore,
      totalQuestions: grading.totalQuestionsCount,
      status: 'completed',
      grading,
    };
  },

  getUserSubmissions(userId: string): Array<{
    userId: string;
    olympiadId: string;
    score: number;
    maxScore: number;
    completedAt: string;
    grading?: any;
  }> {
    const list: any[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`submission_completed_${userId}_`)) {
          const val = localStorage.getItem(key);
          if (val) list.push(JSON.parse(val));
        }
      }
    } catch {}
    return list;
  }
};
