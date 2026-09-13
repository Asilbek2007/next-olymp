import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOlympiadDetail, useOlympiadQuestions } from '../../hooks/useOlympiad';
import { useContestStore } from '../../store/useContestStore';
import { useAntiCheat } from '../../hooks/useAntiCheat';
import { useSubmission } from '../../hooks/useSubmission';
import { Timer } from '../../components/contest/Timer';
import { QuestionCard } from '../../components/contest/QuestionCard';
import { QuestionPalette } from '../../components/contest/QuestionPalette';
import { AntiCheatBanner } from '../../components/contest/AntiCheatBanner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2, Trophy, AlertTriangle, Maximize, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContestParticipatePage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: olympiad } = useOlympiadDetail(id || '');
  const { data: questions } = useOlympiadQuestions(id || '');

  const startContest = useContestStore((state) => state.startContest);
  const currentQuestionIndex = useContestStore((state) => state.currentQuestionIndex);
  const nextQuestion = useContestStore((state) => state.nextQuestion);
  const prevQuestion = useContestStore((state) => state.prevQuestion);
  const isSubmitted = useContestStore((state) => state.isSubmitted);
  const tabSwitchCount = useContestStore((state) => state.tabSwitchCount);

  const { submitFinal, isSubmitting } = useSubmission();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ score: number } | null>(null);

  // Activate ExamGuard Anti-Cheat listener during contest
  useAntiCheat(!isSubmitted, {
    olympiadId: olympiad?.id || id,
    olympiadTitle: olympiad?.title || 'Onlayn Olimpiada',
    maxViolations: 3,
    requireFullscreen: true,
  });

  useEffect(() => {
    if (olympiad && questions && questions.length > 0) {
      startContest(olympiad.id, questions, olympiad.durationMinutes);
    }
  }, [olympiad, questions, startContest]);

  if (!olympiad || !questions || questions.length === 0) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-accent-500">Musobaqaga tayyorgarlik ko'rilmoqda...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleConfirmSubmit = async () => {
    const res = await submitFinal();
    setShowConfirmModal(false);
    if (res) {
      setSubmissionResult(res);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-accent-950 text-white border-b border-accent-800 px-4 sm:px-8 h-16 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white text-xs">
            NO
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{olympiad.title}</h2>
            <span className="text-[10px] text-accent-400 font-mono">Anti-Cheat Active • Logged</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}
            title="To'liq ekranga o'tish (ExamGuard)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-900 border border-accent-800 text-accent-300 hover:text-white text-xs transition-colors"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>To'liq Ekran</span>
          </button>
          <Timer />
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowConfirmModal(true)}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {t('contest.submit')}
          </Button>
        </div>
      </header>

      {/* Main Contest Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Left/Main Column: Question Display */}
        <div className="lg:col-span-3 space-y-6">
          <QuestionCard question={currentQuestion} questionNumber={currentQuestionIndex + 1} />

          {/* Bottom Pagination Controls */}
          <div className="flex items-center justify-between bg-white border border-border rounded-xl p-4 shadow-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {t('contest.prev')}
            </Button>

            <span className="text-xs font-bold text-accent-600">
              {t('contest.question')} {currentQuestionIndex + 1} {t('contest.of')} {questions.length}
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {t('contest.next')}
            </Button>
          </div>
        </div>

        {/* Right Column: Question Palette & Stats */}
        <div className="space-y-6">
          <QuestionPalette />

          <div className="bg-white border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-accent-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Cheat Tizim Holati</span>
            </div>
            <p className="text-xs text-accent-500">
              Tab switch soni: <strong className="text-rose-600">{tabSwitchCount} ta</strong>
            </p>
          </div>
        </div>
      </main>

      {/* Anti-Cheat Modal popup */}
      <AntiCheatBanner />

      {/* Confirm Submission Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title={t('contest.confirmSubmitTitle')}>
        <div className="space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
          <p className="text-sm text-accent-700 leading-relaxed">
            {t('contest.confirmSubmitBody')}
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" isLoading={isSubmitting} onClick={handleConfirmSubmit}>
              Tasdiqlash va Topshirish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Result Submitted Modal */}
      <Modal isOpen={!!submissionResult} onClose={() => navigate('/results')} title="Musobaqa Yakunlandi!" size="md">
        <div className="text-center p-4 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-accent-900">Tabriklaymiz!</h3>
            <p className="text-sm text-accent-600">Siz olimpiada masalalarini muvaffaqiyatli topshirdingiz.</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border text-center space-y-1">
            <span className="text-xs font-bold text-accent-500 uppercase">Dastlabki Natija</span>
            <div className="text-4xl font-black text-primary font-mono">{submissionResult?.score} / 100 ball</div>
          </div>
          <Button variant="primary" className="w-full" onClick={() => navigate('/certificates')}>
            Sertifikatlarim bo'limiga o'tish
          </Button>
        </div>
      </Modal>
    </div>
  );
};
